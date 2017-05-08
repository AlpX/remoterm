# remoterm
remoterm lets you access your remote devices' terminals through your web server. It has a simple UI with an emulated terminal.

You can access the terminal of internet connected linux devices through password protected web page from your remoterm server.
Advantages:
- If you can't ssh to your internet connected remote device you can use remoterm for this.
- Remoterm has several automated remote control fucntions such as restarting closed applications and services by periodically checking them.
- One web page to control all your remote linux devices, whether it is your remote server or small ARM board at home.

--
Alp Burak Pehlivan

# How to use:
git clone https://github.com/AlpX/remoterm.git
go to client folder or server folder:
npm install
nodejs client.js
or
nodejs server.js
- If you have a problem with pty.js installation during npm install, you can try my solution: 
sudo ln -s /usr/bin/nodejs /usr/bin/node
then try npm install again.

## Server:
=======
/server/server.js:
Change the following variables for yourself.

`var username= 'username';`

`var password= 'yourpassword';`

-----
*You should create your own ssl certs and use them instead of dummy ones I created.

`npm install` in /server folder. run:

`nodejs server.js`

## Client:
======

/client/client.js:

Change localhost to your server's ip. By default remoterm server uses port 3008.

`var serverip = 'https://localhost:3008';`

Change the following variable to name your remoterm client.

`var clientid = 'AlpX Remote Client 1';`

`npm install` in /client folder.

If you get an error about pty.js during npm install, the following may resolve the problem:

Install node-gyp on your system:

`sudo apt-get install node-gyp`

run:

`nodejs client.js`

> for leaving your nodejs applications running you can use forever. I use it for mine :) It is great!
https://github.com/foreverjs/forever

Go to your server's remoterm webui from browser:

https://yourserverip:3007/

Write your username and password. Login. Then client on the client you want to control remotely from connected client list.

![remotermalpx](https://cloud.githubusercontent.com/assets/1581359/15782508/4a717dac-29b3-11e6-9a37-290e52ab0360.png)

Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code to be distributed under the MIT license. You are also implicitly verifying that all code is your original work.

License

Copyright (c) 2016, Alp Burak Pehlivan (MIT License)
