const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () => {
    console.log('Logging app listening on port 3000!')
});

app.post('/logaction', cors(), (req, res) => {
    const currenttime = new Date().toLocaleString();
    const logtext = `${currenttime}  IP: ${req.ip} , Action: ${req.body.action}`
    //const logtext_additional = (req.body.action == 'watch' ? `, video title: ${req.body.data.snippet.title}, video id: ${req.body.data.id.videoId}` : '');
    let logtext_additional = '';
    switch(req.body.action) {
        case 'watch': 
            logtext_additional = ` , video title: ${req.body.data.snippet.title}, video id: ${req.body.data.id.videoId}`;
            break;
        case 'search':
            logtext_additional = ` , search text: ${req.body.data}`;
            break;
        default:
            logtext_additional = '';
    }
    console.log(logtext + logtext_additional);
    return res.send('Received a log request for action: ' + req.body.action);
})