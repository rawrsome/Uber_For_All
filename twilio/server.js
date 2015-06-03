var express = require('express');
var twilio = require('twilio');
var http = require('http');
var bodyParser = require ('body-parser');
var accountSid = "AC446595351bf315237663a95580d1ee84"
var authToken = "9b161113e23d5b2ba92ee3b79f376358";
var path = require('path');

var app = express();

app.use(bodyParser.urlencoded({extended:true}));

var client = twilio(accountSid, authToken);

var recsID;

app.post('/', function (req, res){
    // console.log(req.body);

    var twiml = new twilio.TwimlResponse();
    twiml.say({voice: 'man', 'language': 'en'}, "Welcome to Uber for all. Please say address.");
    // record input and transcribe
    twiml.record({
        transcribe: true, 
        timeout:'60'
    });

    // Fill global recsID with recording ID    
    recsID = req.body.RecordingSid;

    res.writeHead(200, {
        'Content-type': 'text/xml'
    })

    // console.log(twiml.toString())
    res.end(twiml.toString());

    // setTimeout( function() { send_recid() }, 15000);
    
    // run callback fn
    var lol = setInterval( function(){
        if (stopInterval=='stop'){
            clearInterval(lol);
            stopInterval = null;
        } else {
            send_recid();
        }
    }, 5000);
   
});
var stopInterval = null;
// callback to request transcribed text
var send_recid = function() {
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
                // console.log(transcription);
                var address = transcription.transcriptionText
                console.log(address);
                stopInterval = 'stop';
            });
           }
        }
    });
};

app.listen(8000, function(){
    console.log("PORT 8000 on");
});