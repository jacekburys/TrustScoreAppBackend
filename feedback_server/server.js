var express = require('express'),
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    ebay = require('ebay-api'),
    openurl = require('openurl');

var hostname = 'localhost';
var port = 3000;

var appId = "JacekBur-TrustSco-PRD-c38c4f481-4b6543de";
var devId = "bd93c7e8-f828-407f-8d79-063d608a6437";
var certId = "PRD-38c4f4810731-bbfa-496a-8d6a-0516";
var RuName = "Jacek_Burys-JacekBur-TrustS-lmoetzrfr";

var sessionId;

function getSessionId(callback) {
  ebay.xmlRequest({
    'serviceName': 'Trading',
    'opType': 'GetSessionID',
    'appId': appId,
    'devId': devId,
    'certId': certId,
    'appName': 'TrustScore',
    //'sandbox': false,
    params: {
      'RuName': RuName
    }
  },
  function(error, data){
    if(error) {
      console.log(error);
    } else {
      sessionId = data.SessionID;
      console.log("sessionId : " + sessionId);
      callback(sessionId);
    }
  });
}

function signIn(sessionId) {
  var url = "https://signin.ebay.com/ws/eBayISAPI.dll?SignIn&RuName="+RuName+"&SessID="+sessionId;
  console.log("trying to open url: " + url);
  openurl.open(url); 
};

function getToken(next) {
  console.log("trying to get a token");
  ebay.xmlRequest({
    'serviceName': 'Trading',
    'opType': 'FetchToken',
    'appId': appId,
    'devId': devId,
    'certId': certId,
    'appName': 'TrustScore',
    //'sandbox': true,
    params: {
      'SessionID' : sessionId
    }
  },
  function(error, data){
    if(error) {
      console.log(error);
    } else {
      console.log("%j", data);
      var token = data.eBayAuthToken;
      console.log("token : " + token);
      getFeedback(token, next);
    }
  });
};

function getFeedback(token, next) {
  console.log("trying to get feedback");
  ebay.xmlRequest({
    'serviceName': 'Trading',
    'opType': 'GetFeedback',
    'appId': appId,
    'devId': devId,
    'certId': certId,
    'authToken' : token,
    'appName': 'TrustScore',
    //'sandbox': true,
    params: {
      'UserID' : 'swimdan95'
    }
  },
  function(error, data){
    if(error) {
      console.log(error);
    } else {
      console.log("%j", data);
      next();
    }

  });
};
////////////////////

var options = {
   key: fs.readFileSync('key.pem'),
   cert: fs.readFileSync('cert.pem'),
   passphrase: "password"
};


var app = express();

app.get('/', function(req, res){
  console.log(req);
  res.send("hello");
});


app.get('/accept', function(req, res, next) {
  console.log("accept " + sessionId);
  getToken(next);
});

var server = https.createServer(options, app).listen(3000, function(){
  console.log("server started at port 3000");
});

getSessionId(signIn);
