import React, { useEffect, useRef, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.css';
import { config } from './config.js';
import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap.js';

const Logo = (props) => {
    return (
        <div className="logo"><span onClick={props.f_resetState}><i className="fas fa-film"/> VideoLibrary</span></div>
    );
}


const Searchbar = (props) => {

    const [text, setText] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorTimeout, setErrorTimeout] = useState(false);

    const showError = (errorText, timeout) => {
        clearError();
        setErrorMessage(errorText);
        setErrorTimeout(setTimeout(() => setErrorMessage(''), timeout));
    }

    const clearError = () => {
        if(errorTimeout && errorMessage) {
            clearTimeout(errorTimeout);
            setErrorTimeout(false);
            setErrorMessage('');
            //console.log('clearing error');
        }
    }

    const handleTextChange = (e) => {
        const re = new RegExp("^[a-zA-Z0-9 ]+$");
        const cutText = (e.target.value.length > 20 ? e.target.value.substring(0, 20) : e.target.value);
        if(cutText == '' || re.test(cutText)) {
            setText(cutText);
            if(cutText.length < e.target.value.length) {
                showError('Maximum search keyword length is 20 characters!', 3000);
            }
        } else {
            showError('Invalid character!', 2000);
        }
    }

    const handleSearchKeyPress = (e) => {
        if(e.charCode == 13) {
            props.f_requestResult(text);
        }
    }

    return (
        <div className="searchbar mb-3">
            <div className="input-group" >
                <input className="form-control" type="text" value={text} onChange={handleTextChange} onKeyPress={handleSearchKeyPress} placeholder="Search for a video..." />
                <div className="input-group-append">
                    <button onClick={props.f_requestResult.bind(this, text)} className="btn btn-outline-light" type="button"><i className="fas fa-search" /></button>
                </div>
            </div>
            <div className="error ml-1">{errorMessage}</div>
        </div>
    )
}


const Content = (props) => {

    const handleVideoClick = (info) => {
        props.f_watchVideo(info)
        $('#video')[0].scrollIntoView();
    }

    const Video = () => {
        if(props.openedVideo) {
            return (
                <div id="video" className="video col-12 col-xl-8">
                    <div className="embed-responsive embed-responsive-16by9">
                        <iframe className="embed-responsive-item" src={`https://www.youtube.com/embed/${props.openedVideo.id.videoId}?autoplay=1`}/>
                    </div>
                    <div className="title" dangerouslySetInnerHTML={{__html: props.openedVideo.snippet.title}}/>
                    <div className="uploader">{props.openedVideo.snippet.channelTitle}</div>
                </div>
            );
        } else {
            return (<div id="video" style={{display: 'none'}}></div>);
        }
    }

    const ResultsList = () => {
        if(props.result) {
            return (
                <div className={'results col-12' + (props.openedVideo ? ' col-xl-4' : '')}>
                    {
                        props.result.items.map((item, index) =>
                            <ListItem info={item} key={'listitem'+index}/>
                        )
                    }
                </div>
            );
        } else {
            return ('');
        }
    }

    const ListItem = (_props) => {
        return (
            <div className="listitem" onClick={handleVideoClick.bind(this, _props.info)}>
                <img className="thumbnail" src={_props.info.snippet.thumbnails.default.url} />
                <div className="info">
                    <div className="title" dangerouslySetInnerHTML={{__html: _props.info.snippet.title}} />
                    <div className="uploader">{_props.info.snippet.channelTitle}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="content container">
            <div className="row">
                <Video/>
                <ResultsList/>
            </div>
        </div>
    );
}


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    getInitialState = () => ({
        searchString: false,
        result: false,
        loading: false,
        allowLoading: true,
        openedVideo: false
    })

    resetState = () => {
        this.setState(this.getInitialState());
    }

    logAction = (action, data) => {
        $.post('http://localhost:3000/logaction/', {action: action, data: (data ? data : {})}, (receivedData, receivedStatus) => {
            console.log(`Logging API: ${receivedData} (${receivedStatus})`); //////////////////////
        });
    }

    componentDidMount() {
        //this.requestResult('lofi'); /////////////////////////////////////////
        window.addEventListener('scroll', this.checkIfScrolledDown);
        this.logAction('test'); /////////////////////////
    }

    watchVideo = (vidtoopen) => {
        this.setState({openedVideo: vidtoopen});
        this.logAction('watch', vidtoopen); /////////////////////////
    }

    checkIfScrolledDown = () => {
        if($(window).scrollTop() + $(window).height() >= $(document).height()){
            if(this.state.allowLoading) {
                this.setState({allowLoading: false});
                setTimeout(() => {
                    this.setState({allowLoading: true});
                    this.checkIfScrolledDown();
                }, 1000);
                this.requestMoreResults();
            }
        }
    }

    requestResult = (q) => {
        if(!this.state.loading) {
            if(q != '') {
                let npt = false;
                if(this.state.searchString === q && this.state.result.nextPageToken) {
                    npt = this.state.result.nextPageToken
                } else {
                    this.resetState();
                }
                const callurl = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=20&key=${config.GOOGLE_KEY}`+(npt ? '&pageToken='+npt : '');
                this.setState({loading: true});
                fetch(callurl)
                .then((response) => (response.json()))
                .then((data) => {
                    //console.log(data); /////////////////////////////////
                    if(data.error) {
                        throw(data.error.message);
                    } else {
                        const newData = {...data};
                        newData.items = (this.state.result.items ? this.state.result.items.concat(data.items) : newData.items);
                        this.setState({searchString: q, result: newData, loading: false});
                        this.logAction('search', q);
                        //this.setState({openedVideo: newData.items[0]}); ////////////////////////////////////
                    }
                })
                .catch(err => {
                    console.log('YouTube API call error: ' + err);
                });
            }
        }
    }

    requestMoreResults = () => {
        if(this.state.searchString && this.state.result.items && this.state.result.pageInfo.totalResults) {
            if(this.state.result.items.length < this.state.result.pageInfo.totalResults) {
                this.requestResult(this.state.searchString);
            }
        }
    }

    render() {
        return (
            <div id="app">
                <Logo f_resetState={this.resetState} />
                <div className="main container">
                    <Searchbar f_requestResult={this.requestResult} />
                    <Content result={this.state.result} f_watchVideo={this.watchVideo} openedVideo={this.state.openedVideo}/>
                </div>
            </div>
        );
    }
}

export default App