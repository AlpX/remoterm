#!/usr/bin/env node
/* client.js
 * RemoTerm
 * by Alp Burak Pehlivan  / mail@alpx.io 
 * Copyright (c) 2016
 * https://github.com/AlpX/remoterm
 */

var fs = require('fs');
var pty = require('pty.js');
var io = require('socket.io-client'); 

var util = require('util'),
    exec = require('child_process').exec,
    child;
  
var path = require('path');

// change localhost to your server's ip
var serverip = 'https://localhost:3008';
// change this to name your client device
var clientid = 'AlpX Remote Client 1';

process.title='remotermclient';

//server
// this ip should be your remo term server's ip.
var socket = io.connect(serverip); 

// configurations for automated checking of working applications and services
var prgnames=["dantou.mi"];
var runfilenames=["middleware.js"];
var prgAutoRestart=[false];

// you can set autorestart of apps or services
var servicenames=["mongodb"];
var serviceRunningStr=["start/running"];
var serviceStoppedStr=["stop/waiting"];
var serviceAutoRestart=[true];



// Multi terminal server is on 3008
  socket.on('connect', function () {
  	socket.emit('identity',{id:clientid});
  	console.log('connected to server!');
  });

  socket.on('data', function (data) {
    console.log(data);
    term.write(data);
  });

  socket.on('killprg', function(obj) {
    killprg(obj);
  });  

  socket.on('restartprg', function(obj) {
    restartprg(obj);
  });  

  
  var term = pty.fork(process.env.SHELL || 
  'bash', [], { //'bash' was 'sh' i changed it. Alp_X
    name: require('fs').existsSync('/usr/share/terminfo/x/xterm-256color')
      ? 'xterm-256color'
      : 'xterm',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME
  });

  term.on('data', function(data) {
    return !socket
      ? buff.push(data)
      : socket.emit('data', data);
  });


  function killprg(obj) {
    var name=obj.name;
    var type=obj.type;
    console.log('kill request for: '+name+ ' type:'+type);
    if(type=='prg')
    {
      run_cmd( "pgrep", ["-f",name], function(text) {
        var names=text.trim();      
        names=names.split('\n');
        console.log(names);
        var args=[];
        args.push('-5');
        args.push.apply(args,names);
        console.log(args);
        run_cmd( "kill", args, function(text) {
            /*
            var obj={};
            obj.prgname=name;
            obj.status='killed';
            socket.emit('prgkilled', obj); 
            */
        });
      });
    }
    else if(type=='service')
    {
      run_cmd( "service", [name, "stop"], function(text) {
      });
    }
  }

  function restartprg(obj) {
    var name=obj.name;
    var type=obj.type;
    console.log('restart request for: '+name+' type:'+type);
    if(type=='prg')
    {
      run_cmd( "pgrep", ["-f",name], function(text) {
        var names=text.trim();      
        names=names.split('\n');
        console.log(names);
        var args=[];
        args.push('-5');
        args.push.apply(args,names);
        console.log(args);
        run_cmd( "kill", args, function(text) {
          /*
          var obj={};
          obj.prgname=name;
          obj.status='killed';
          socket.emit('prgkilled', obj); 
          */
          //console.log(name + " inside runcmd ")
          var prgind=prgnames.indexOf(name);
          if(prgind!=-1)
          {
            var runname=runfilenames[prgind];
            run_cmd_indep( "nohup", ["nodejs",runname,"&"], function(text) {
               //
            });
          }
        });
      });
    }
    else if(type=='service')
    {
      run_cmd( "service", [name, "restart"], function(text) {
      });
    }
  }


  function run_cmd(cmd, args, callBack ) {
      var spawn = require('child_process').spawn;
      var child = spawn(cmd, args);
      var resp = "";

      child.stdout.on('data', function (buffer) { resp += buffer.toString() });
      child.stdout.on('end', function() { callBack (resp) });
  } // ()

  function run_cmd_with_par(cmd, args, par, callBack) {
      var spawn = require('child_process').spawn;
      var child = spawn(cmd, args);
      var resp = "";

      child.stdout.on('data', function (buffer) { resp += buffer.toString() });
      child.stdout.on('end', function() { callBack (resp, par) });
  } // ()

  function run_cmd_indep(cmd, args, callBack ) {
      var spawn = require('child_process').spawn;
      var out = fs.openSync('./out.log', 'a');
      var err = fs.openSync('./out.log', 'a');
      var child = spawn(cmd, args, {
      detached: true,
      stdio: [ 'ignore', out, err ]
      });

      child.unref();
  } // ()
 

  function cleanArray(actual){
    var newArray = new Array();
    for(var i = 0; i<actual.length; i++){
        if (actual[i]){
          newArray.push(actual[i]);
      }
    }
    return newArray;
  }
  

// TIMER for periodical check up
// setInterval(function(){

/* // not necessary but this is here as an old example.
  var cmdexec = "sudo ping -q -c 3 8.8.8.8 > /dev/null";
    // excute ping using child_process' exec function

  child = exec( cmdexec,
    function (error, stdout, stderr) {
      if (error !== null) {
        //console.log('exec error: ' + error);
        console.log("Not connected to Internet! Trying dhclient..");
    run_cmd_indep( "sudo", ["dhclient","eth0"], function(text) {
      console.log(text);
    });
      }
      else {
        //console.log("Connected to Internet!");
            }
  });
*/

  // for(var k=0; k < prgnames.length; k++){
  //   var pname=prgnames[k];

  //   run_cmd_with_par("pgrep", ["-f", pname], pname, function(text, par) {
  //     //console.log("in runcmd "+par)
  //     if(socket!=null) {
  //       if(text!="")
  //       console.log(text);
  //       //..
  //       if(text!="") {
  //         var obj={};
  //         obj.type='prg';
  //         var arr=text.split('\n');
  //         obj.pid=cleanArray(arr);
  //         obj.prgname=par;
  //         obj.status='running';
  //         console.log(JSON.stringify(obj));
  //         socket.emit('prgcheck', obj); 
  //       }
  //       else
  //       {
  //         var obj={};
  //         obj.type='prg';
  //         obj.prgname=par;
  //         obj.status='closed';
  //         socket.emit('prgcheck', obj); 
  //       }
  //     }
  //   });
  // }


//   for(var k=0; k < servicenames.length; k++){
//     var pname=servicenames[k];

//     run_cmd_with_par("service", [pname, "status"], pname, function(text, par) {
//       //console.log("in runcmd "+par)
//       if(socket!=null) {
//         var obj={};
//         //..
//         obj.pid=[];
//         obj.pid.push('');

//         var serviceInd=servicenames.indexOf(par);
//         if(text.indexOf(serviceRunningStr[serviceInd])!=-1) {
//           //console.log(text);
//           obj.type='service';
//           obj.prgname=par;
//           obj.status='running';
//           console.log(JSON.stringify(obj));
//           socket.emit('prgcheck', obj); 
//         }
//         else
//         {
//           obj.type='service';
//           obj.prgname=par;
//           obj.status='closed';
//           socket.emit('prgcheck', obj); 
//           var serviceInd=servicenames.indexOf(obj.prgname);
//           if(serviceAutoRestart[serviceInd])
//           {
//             obj.name=obj.prgname;
//             restartprg(obj);
//           }
//         }
//       }
//     });
//   }

// }, 1* 3000); 


