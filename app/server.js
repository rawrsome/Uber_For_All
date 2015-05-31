var twilio = require('twilio');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
require('./config/mongoose');

app.use(bodyParser.urlencoded({extended: true})); 

var state = require('./routes/voice.js');

app.post('/',function(request,response){
    var resp = new twilio.TwimlResponse();
    if(request.body.Digits >= 0 && (state.name !== "Welcome")){
        state.speak(resp, request.body.Digits);
    }else{
        state.speak(resp);
    }

    state = state.next;
    response.writeHead(200,{
        'content-type': 'text/xml'
    });

    response.end(resp.toString());

});

app.listen(8999, function(){
    console.log("I am listening");
});
