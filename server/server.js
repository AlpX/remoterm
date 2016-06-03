#!/usr/bin/env node

/* server.js
 * RemoTerm
 * by Alp Burak Pehlivan  / mail@alpx.io 
 * Copyright (c) 2016
 * https://github.com/AlpX/remoterm
 * modified from Christopher Jeffrey's code.
 * term.js
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * https://github.com/chjj/term.js/
 */

var fs = require('fs');
var https = require('https')
  , express = require('express')
  , io = require('socket.io')
  , terminal = require('term.js');

var username= 'username'; // write your own username and password here before running server.js
var password= 'yourpassword';

/**
 * term.js
 */
process.title = 'remotermserver';

/**
 * Dump
 */

// Connection to middleware clients

// you should creat your own self-signed ssl cert
var options = {
  key: fs.readFileSync('./server.key', 'utf8'),
  cert: fs.readFileSync('./server.crt', 'utf8'),
  passphrase: 'remowebterm',
  requestCert: false
};

var cliterms = require('express')();
var termserver = https.Server(options, cliterms);
var io_from_middlewares = require('socket.io')(termserver);  // 3008

termserver.listen(3008);
console.log('termserver listening on 3008');


cliterms.get('/', function (req, res) {
  res.writeHead(200, {"Content-Type": "text/javascript"});
  res.write("terminal server is running.. Alp_X");
  res.end();
});



/**
 * Open Terminal
 */

var buff = []
  , socket 
  , midsock;

// this is reception from client. emit to local socket for web view


/**
 * App & Server
 */


var app = express()
  , server = https.createServer(options, app);


app.use(function(req, res, next) {
  var setHeader = res.setHeader;
  res.setHeader = function(name) {
    switch (name) {
      case 'Cache-Control':
      case 'Last-Modified':
      case 'ETag':
        return;
    }
    return setHeader.apply(res, arguments);
  };
  next();

});


app.use(express.static(__dirname+"/public"));
app.use(terminal.middleware());

// web ui
server.listen(3007);
console.log('web terminal is served on 3007');


/**
 * Web UI Socket
 */


io = io.listen(server, {  // 3007 web ui socket client
  log: false
});


var webSocketarr=[];
var webSessionIDarr=[];
var webUserIDarr=[];
var webMidTargetarr=[];
var webSessionLoggedInarr=[];


io.sockets.on('connection', function(sock) {
  socket = sock;
  // this online session could have been implemented better. but it works for the required task anyways.
  var session=0;
  var targetClient=-1;
  var sessionUser='anonymous'+Math.random();
  var loggedIn=false;
  var midsockOfWeb=null;

  socket.on('session', function(sessionid) { // start session
    session=sessionid;
    webSocketarr.push(sock);
    webSessionIDarr.push(session);
    webUserIDarr.push(sessionUser);
    webMidTargetarr.push(-1);
    webSessionLoggedInarr.push(loggedIn);
    
    socket.emit('ClientList', {midarr:midIDarr, users:midWebUserarr}); 
    
      console.log('a web session started');
      console.log(JSON.stringify(webSessionIDarr));
      console.log(JSON.stringify(webUserIDarr));
      console.log(JSON.stringify(webMidTargetarr)); 
      console.log(JSON.stringify(webSessionLoggedInarr));
  });
  
  socket.on('data', function(data) {
    if(loggedIn==true && targetClient!=-1) { // is logged in and a target is selected
        if (stream) stream.write('IN: ' + data + '\n-\n');
             midsockOfWeb.emit('data', data);
    }
  });

  socket.on('targetID', function(id) {
    if(loggedIn==true && webMidTargetarr.indexOf(midIDarr[id])==-1) {
      if(targetClient!=-1) {
        midWebUserarr[targetClient]='No One'; 
      }
      targetClient=id;
      midWebUserarr[id]=sessionUser;
      
      var index=webSessionIDarr.indexOf(session);
      webMidTargetarr[index]=midIDarr[id];
      midsockOfWeb=midSocketarr[id];
      socket.emit('MidSockChanged',id);
      console.log('Target is set to:'+midIDarr[id]);
      
        var ind;
        for (ind = 0; ind < webSocketarr.length; ind++) { 
            websock=webSocketarr[ind];
        	  if (websock!=null) {
        		websock.emit('ClientList', {midarr:midIDarr, users:midWebUserarr}); 
        	  }
        }
      ////////////////
      console.log(JSON.stringify(webSessionIDarr));
      console.log(JSON.stringify(webUserIDarr));
      console.log(JSON.stringify(webMidTargetarr));  // bu midsock larin kendisine hangi websession in socketinin bagli oldugunu ogrenmeleri icin lazim.
      console.log(JSON.stringify(webSessionLoggedInarr));
    }
  });
  
  socket.on('login', function(cred) {
      //console.log(session);
    if( (cred.usr==username && cred.pwd==password) )
    {
        if(webUserIDarr.indexOf(cred.usr)==-1) { // if not already logged in
	        sessionUser=cred.usr;
	        loggedIn=true;
	        var index=webSessionIDarr.indexOf(session); 
		    webUserIDarr[index]=cred.usr;
		    webSessionLoggedInarr[index]=true;
    	    console.log(session+' '+ cred.usr+' has logged in to web session');
    	    
    	    socket.emit('loginAccepted',cred.usr);
      console.log(JSON.stringify(webSessionIDarr));
      console.log(JSON.stringify(webUserIDarr));
      console.log(JSON.stringify(webMidTargetarr));  // bu midsock larin kendisine hangi websession in socketinin bagli oldugunu ogrenmeleri icin lazim.
      console.log(JSON.stringify(webSessionLoggedInarr));
      
        }
        else
        {
            console.log('already logged in somewhere. send message to web about it');
        }
    }
     
  });

  socket.on('logout', function(usrname) {
      //console.log('logging out');
        if(webUserIDarr.indexOf(usrname)!=-1) { // if not already logged out
	        sessionUser='anonymous'+Math.random();
	        loggedIn=false;
	        var index=webSessionIDarr.indexOf(session); 
  		    webUserIDarr[index]=sessionUser;
          webMidTargetarr[index]=''; // new added clean mid target when logged out
  		    webSessionLoggedInarr[index]=false;
  		    midsockOfWeb=null;
          midWebUserarr[targetClient]='No One';
  		    targetClient=-1;
            var ind;
            for (ind = 0; ind < webSocketarr.length; ind++) { 
                websock=webSocketarr[ind];
            	  if (websock!=null) {
            		websock.emit('ClientList', {midarr:midIDarr, users:midWebUserarr}); 
            	  }
            }
    	    console.log(session+' '+ usrname+' has logged out from web session');
    	    
    	    socket.emit('logoutAccepted','true');
      console.log(JSON.stringify(webSessionIDarr));
      console.log(JSON.stringify(webUserIDarr));
      console.log(JSON.stringify(webMidTargetarr));  // bu midsock larin kendisine hangi websession in socketinin bagli oldugunu ogrenmeleri icin lazim.
      console.log(JSON.stringify(webSessionLoggedInarr));
      
    }
     
  });

  socket.on('disconnect', function() { 
    var index=webSessionIDarr.indexOf(session);
    if(index!=-1) { 
        midWebUserarr[targetClient]='No One';
        loggedIn=false;
        webSocketarr.splice(index, 1);
        webSessionIDarr.splice(index, 1);
        webUserIDarr.splice(index, 1);
        webMidTargetarr.splice(index, 1);
        webSessionLoggedInarr.splice(index, 1);
    }
    console.log(index+' '+session +' '+ sessionUser + ' has disconnected');
    
    sock=null;
  });

  socket.on('killprg', function(obj) {
    if(loggedIn==true && targetClient!=-1) { // is logged in and a target is selected
        midsockOfWeb.emit('killprg', obj);
    }
  });  

  socket.on('restartprg', function(obj) {
    if(loggedIn==true && targetClient!=-1) { // is logged in and a target is selected
        midsockOfWeb.emit('restartprg', obj);
    }
  });  

  while (buff.length) {
    socket.emit('data', buff.shift());
  }


});





// -- Connections from client
var midSocketarr=[];
var midIDarr=[];
var midWebUserarr=[];

// client connections

io_from_middlewares.on('connection', function (socketfrommid) {  // 3008
  var midID='';
  var websock=null;
  midsock=socketfrommid;

  midsock.on('identity', function (identity) {
      //console.log(identity);
        
  	if(midIDarr.indexOf(identity.id)==-1)
  	{ 
  		    midID=identity.id;
      		midIDarr.push(identity.id);
      		midSocketarr.push(socketfrommid);
      		midWebUserarr.push('No One');
  	}	

    console.log(JSON.stringify(identity)+' has connected');
    var ind;
    for (ind = 0; ind < webSocketarr.length; ind++) { 
        websock=webSocketarr[ind];
    	  if (websock!=null) {
    		websock.emit('ClientList', {midarr:midIDarr,users:midWebUserarr}); 
    	  }
    }
  });

  midsock.on('disconnect', function() {
    var sockind=midIDarr.indexOf(midID);
    if(sockind!=-1) { 
	    midIDarr.splice(sockind,1);
	    midSocketarr.splice(sockind,1);
	    midWebUserarr.splice(sockind,1);
    	console.log(midID+ ' has disconnected');
	    console.log(JSON.stringify(midIDarr)); 
	    
      	webMidTargetarr[webMidTargetarr.indexOf(midID)]=-1;
        var ind;
        for (ind = 0; ind < webSocketarr.length; ind++) { 
            websock=webSocketarr[ind];
        	  if (websock!=null) {
        		websock.emit('ClientList', {midarr:midIDarr,users:midWebUserarr}); 
        	  }
        }
        
        console.log(JSON.stringify(webMidTargetarr));  
        socketfrommid = null;                                   
    }
	 
    
  });

  //data from client terminal
  midsock.on('data', function (data) {
        var ind=webMidTargetarr.indexOf(midID); 
        if(ind!=-1) {
            websock=webSocketarr[ind];
            if (websock) { 
                if (stream) stream.write('OUT: ' + data + '\n-\n');
                !websock ? buff.push(data) : websock.emit('data', data);
            }
        }
                
  });

  // data from remoterm clients
  midsock.on('prgkilled', function(prg) {
      var ind=webMidTargetarr.indexOf(midID); 
      if(ind!=-1)
      {
              websock=webSocketarr[ind];
              websock.emit('prgkilled', prg);
      }
  });
    
  midsock.on('prgcheck', function(prg) {
      var ind=webMidTargetarr.indexOf(midID); 
      if(ind!=-1)
      {
              websock=webSocketarr[ind];
              websock.emit('prgcheck', prg);
      }
  });
  
});
