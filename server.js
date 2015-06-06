/**
 * Created by pl on 6/1/15.
 */

var express = require('express');
var twilio = require('twilio');
var http = require('http');
var bodyParser = require ('body-parser');
var accountSid = "ACe701a4e2c6cf998a6e4330f367e5e54a";
var authToken = "0cda74fdde03eaa48bcc82ccec986880";
var path = require('path');

var app = express();

app.use(bodyParser.urlencoded({extended:true}));

var client = twilio(accountSid, authToken);

var recsID = null;

app.post('/', function (req, res){
    var twiml = new twilio.TwimlResponse();
    // console.log(req.body);
    /*twiml.say({voice: 'man', 'language': 'en'}, "Today is a good day to die.")
        .pause({length:1})
        .say({voice: 'man', 'language': 'en'}, "Press one to record.");*/

    twiml.gather({
        action: '/res1',
        finishOnKey: '*',
        numDigits: '1',
        timeout: '5'
    }, function(){
        this.say('Press 1 to say an address.')
            .say('Press 2 for random stuff.');
    });
    res.writeHead(200, {
        'Content-type': 'text/xml'
    });
    res.end(twiml.toString());
    // run callback fn

});

app.post('/res1', function(req, res){
    var twiml = new twilio.TwimlResponse();
    if (req.body.Digits == '1'){
        twiml.say ({'voice': 'man', language:'en'}, "After the beep, please say your address. Press 9 when you're finished");
        twiml.record({
            action: '/queue',
            transcribe: true,
            timeout:'60',
            transcribeCallback: '/testing'
        });
    } else if (req.body.Digits == '2'){
        twiml.say("Your information has been sent to google maps");
    } else {
        twiml.say("Invalid command")
            .redirect('/');
    }

    res.writeHead(200, {
        'Content-type': 'text/xml'
    });
    res.end(twiml.toString());

});

app.post('/queue', function(req, res){
    var twiml = new twilio.TwimlResponse();
    if (req.body.Digits == '9') {
        twiml.play('http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3');
    }
    res.writeHead(200, {
        'Content-type': 'text/xml'
    });
    res.end(twiml.toString());
});

app.post('/testing', function(req, res){
    var twiml = new twilio.TwimlResponse();
    client.calls(req.body.CallSid).update({
        url: "https://4d7edb4e.ngrok.io/directagain",
        method: "POST"
    }, function(err, call) {
        //twiml.say("You said "+req.body.TranscriptionText);
    });
    console.log(req.body.TranscriptionText);

    res.writeHead(200, {
        'Content-type': 'text/xml'
    });
    res.end(twiml.toString());
});

app.post('/directagain', function(req, res){
    var twiml = new twilio.TwimlResponse();
    twiml.say("The call has been redirected to this, the recording is still in the testing function");
    res.writeHead(200, {
        'Content-type': 'text/xml'
    });
    res.end(twiml.toString());
});

/*app.post('/record', function(req, res){
    var twiml = new twilio.TwimlResponse();
    recsID = req.body.RecordingSid;
    twiml.say("Please wait").pause({length:5});
    var lol = setInterval( function(){
        if (stopInterval=='stop'){
            clearInterval(lol);
            stopInterval = null;
        } else {
            send_recid(function(data){
                if (data){
                    console.log("Address is : "+data);
                    sendout(data);
                }
            });
        }
    }, 5000);


    function sendout(data){

    }

    res.writeHead(200, {
        'Content-type': 'text/xml'
    });
    res.end(twiml.toString());
});

var stopInterval = null;
// callback to request transcribed text
var send_recid = function(callback) {
    // request transaction ID
    client.request({
        url:'/Accounts/'+accountSid+'/Recordings/'+recsID+'/Transcriptions',
        method:'GET'
    }, function (error, responseData) {
        // handle response
        if ( ! responseData )
        {
            return null
        }
        else
        {
            console.log(responseData.transcriptions[0].status);

            if(responseData.transcriptions[0].status == 'completed')
            {
                // get transcription text obj
                client.transcriptions(responseData.transcriptions[0].sid).get(function(err, transcription) {
                    //console.log(transcription);
                    var address = transcription.transcriptionText;
                    callback(address);
                    stopInterval = 'stop';
                });
            }
        }
    });
};*/

app.listen(8000, function(){
    console.log("PORT 8000 on");
});