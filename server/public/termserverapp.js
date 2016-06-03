

angular.module('termserverApp', [])
  .controller('termController',  ['$scope', function($scope) { 


var webSessionID=Math.random();
$scope.prglist=[];
$scope.prgstats=[];
$scope.nohuplog='';
$scope.changedate='';
$scope.slideSelection='loginslide';

    $scope.login = function() { 
        var usrname=document.getElementById('usr').value;
        var pswd=document.getElementById('pwd').value;
        //console.log(usrname+ ' '+ pswd);
        
		if(socket)
		{ socket.emit('login',{usr: usrname, pwd:pswd}) }
    };
    
    $scope.logout = function() { 
        //console.log('logout');
    		if(socket && $scope.isloggedIn)
    		{ socket.emit('logout',$scope.loginName) }
    };


    $scope.changeMidsock = function(id) {
    	//console.log(id);
    	$scope.selectedClientChanged=true; 
    	if($scope.selectedClientChanged)
    	{
    		if(socket)
    		{
    		    socket.emit('targetID', id); 
    		}
    		$scope.selectedClientChanged=false;
    	}
    };

    $scope.restartprg = function(ind) {
        if($scope.prgstats[ind].type=='prg')
        {
          socket.emit('restartprg', {name:$scope.prglist[ind], type:'prg'});
        }
        else {
          socket.emit('restartprg', {name:$scope.prglist[ind], type:'service'});
        }
    };

    $scope.killprg = function(ind) {
        // console.log(ind);
        if($scope.prgstats[ind].type=='prg')
        {
          socket.emit('killprg', {name:$scope.prglist[ind], type:'prg'});
        }
        else {
          socket.emit('killprg', {name:$scope.prglist[ind], type:'service'});
        }
    };




$scope.isloggedInBefore=false;
$scope.isloggedIn=false;
$scope.loginName='';
$scope.webSessionID=0;
$scope.selectedClient=-1;
$scope.selectedClientChanged=false;
$scope.clientList=[];
$scope.loggedInUserList=[];

    var socket = io.connect();

    socket.on('connect', function() {
      
      var term = new Terminal({
        cols: 80,
        rows: 24,
        useStyle: true,
        screenKeys: true
      });

      socket.emit('session', webSessionID );
      // console.log(webSessionID);
      
      term.on('data', function(data) {
        socket.emit('data', data); 
      });

      term.on('title', function(title) {
        document.title = title;
      });

      socket.on('MidSockChanged', function(id) {
            $scope.$apply(function () {
	            $scope.selectedClient=id;
              var x=document.getElementsByClassName("terminal");
              x[0].style.visibility='visible';
            });
      });
      
      socket.on('loginAccepted', function(name) {
            $scope.$apply(function () {
                //console.log('logged in');
	            $scope.isloggedIn=true;
	            $scope.loginName=name;
              if($scope.isloggedInBefore==false)
              {
                  term.open(document.body);
                  $scope.isloggedInBefore=true;
              }

              var x=document.getElementsByClassName("terminal");
              x[0].style.visibility='hidden';
              //term.write('\x1b[31mWelcome to term.js!\x1b[m\r\n');
            });
      });
      
      socket.on('logoutAccepted', function(status) {
            $scope.$apply(function () {
	            $scope.isloggedIn=false;
	            $scope.loginName='';
              $scope.selectedClient=-1;
              var x=document.getElementsByClassName("terminal");
              x[0].style.visibility='hidden';
            });
      });

      socket.on('data', function(data) {
        term.write(data);
      });

      socket.on('ClientList', function(list) {
			$scope.$apply(function () {
				$scope.clientList=list.midarr;
				$scope.loggedInUserList=list.users;
			});
      });

      socket.on('disconnect', function() {
  			$scope.$apply(function () {
  				$scope.clientList=[];
  				$scope.webSessionID=0;
  			});
  			term.destroy();
      });

      // newly added from alpxmonitor's webgui.js
      socket.on('prgkilled', function(prg) {
        var prgindex=$scope.prglist.indexOf(prg.prgname);
        if(prgindex!=-1)
        {
          $scope.prgstats.splice(prgindex,1);
          $scope.prglist.splice(prgindex,1);
        }
      });
    
      socket.on('prgcheck', function(prg) {
        var statobj=[];
        statobj.prgname=prg.prgname;
        statobj.type=prg.type;
        //console.log(prg.prgname);
        // led and visuals
        if(prg.status=='running')
        {
          
          statobj.status='running';
          statobj.pid=prg.pid[0];
          //console.log(JSON.stringify(prg.pid));
          if(prg.pid.length>1)
          {
              statobj.status='multiple_running';
            for(var i=1; i<prg.pid.length; i++)
            {
                statobj.pid=statobj.pid+" "+prg.pid[i];
            }
          }
          statobj.led=1;
        }
        else
        {
          statobj.status='none';
          statobj.led=0;
          statobj.pid='';
        }
  
        
        var prgindex=$scope.prglist.indexOf(prg.prgname);
        if(prgindex!=-1)
        {
          $scope.$apply(function () {
            $scope.prgstats[prgindex]=statobj;
          });
        }
        else
        {
          $scope.$apply(function () {
            $scope.prglist.push(prg.prgname);
            $scope.prgstats.push(statobj);
          });
        }

        });
      //


    });


  }]); 
