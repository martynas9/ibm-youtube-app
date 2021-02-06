import React, { useEffect, useState } from 'react';
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

    const Video = () => {
        if(props.result) {
            return (
                <div className="video col-12 col-lg-8">
                    video here
                </div>
            );
        } else {
            return ('');
        }
    }

    const ResultsList = () => {
        if(props.result) {
            return (
                <div className="results col-12 col-lg-4">
                    <ListItem/>
                </div>
            );
        } else {
            return ('');
        }
    }

    const ListItem = () => {
        return (
            <div></div>
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
        loading: false
    })

    resetState = () => {
        this.setState(this.getInitialState());
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
                    this.setState({searchString: q, result: data, loading: false});
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
                    <Content result={this.state.result}/>
                </div>
            </div>
        );
    }
}

export default App