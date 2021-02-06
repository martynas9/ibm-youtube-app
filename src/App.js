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

    const handleTextChange = (e) => {
        const re = new RegExp("^[a-zA-Z0-9 ]+$");
        const cutText = (e.target.value.length >= 20 ? e.target.value.substring(0, 19) : e.target.value);
        if(cutText == '' || re.test(cutText)) {
            setText(cutText);
        }
    }

    const handleSearchKeyPress = (e) => {
        if(e.charCode == 13) {
            props.f_requestYoutubeResult(text);
        }
    }

    return (
        <div className="searchbar input-group mb-3" >
            <input className="form-control" type="text" value={text} onChange={handleTextChange} onKeyPress={handleSearchKeyPress} placeholder="Search for a video..." />
            <div className="input-group-append">
                <button onClick={props.f_requestYoutubeResult.bind(this, text)} className="btn btn-outline-light" type="button" id="button-addon2"><i className="fas fa-search" /></button>
            </div>
        </div>
    )
}


const Content = (props) => {

    const handleVideoClick = (info) => {
        props.f_openVideo(info)
        $('#video')[0].scrollIntoView();
    }

    const Video = () => {
        if(props.openedVideo) {
            return (
                <div id="video" className="video col-12 col-lg-8">
                    <div className="embed-responsive embed-responsive-16by9">
                        <iframe className="embed-responsive-item" src={`https://www.youtube.com/embed/${props.openedVideo.id.videoId}?autoplay=1`}/>
                    </div>
                    <div className="title" dangerouslySetInnerHTML={{__html: props.openedVideo.snippet.title}}/>
                    <div className="uploader">{props.openedVideo.snippet.channelTitle}</div>
                </div>
            );
        } else {
            return ('');
        }
    }

    const ResultsList = () => {
        if(props.result) {
            return (
                <div className={'results col-12' + (props.openedVideo ? ' col-lg-4' : '')}>
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
        openedVideo: false
    })

    resetState = () => {
        this.setState(this.getInitialState());
    }

    componentDidMount() {
        this.requestYoutubeResult('lofi'); /////////////////////////////////////////
    }

    requestYoutubeResult = (q) => {
        if(!this.state.loading) {
            if(q != '') {
                const callurl = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=20&key=${config.GOOGLE_KEY}`;
                this.setState({loading: true});
                fetch(callurl)
                .then((response) => (response.json()))
                .then((data) => {
                    console.log(data); /////////////////////////////////
                    if(data.error) {
                        throw(data.error.message);
                    } else {
                        this.setState({searchString: q, result: data, loading: false, openedVideo: false});
                        this.setState({openedVideo: data.items[0]}); ////////////////////////////////////
                    }
                })
                .catch(err => {
                    console.log('YouTube API call error: ' + err);
                });
            }
        }
    }

    render() {
        return (
            <div id="app">
                <Logo f_resetState={this.resetState} />
                <div className="main container">
                    <Searchbar f_requestYoutubeResult={this.requestYoutubeResult} />
                    <Content result={this.state.result} f_openVideo={(vidtoopen) => this.setState({openedVideo: vidtoopen})} openedVideo={this.state.openedVideo}/>
                </div>
            </div>
        );
    }
}

export default App