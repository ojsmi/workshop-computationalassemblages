/* import the modules we need for this to work */
const http = require('http');
const socketio = require("socket.io");
const osc = require( 'node-osc' );
const express = require('express');

/* config */
const webPort = 8000;
const toMaxPort = 8002;
const fromMaxPort = 8003;

/* setup */
const app = express();
const server = http.createServer( app );
const io = new socketio.Server(server);
const oscClient = new osc.Client('127.0.0.1', toMaxPort );
const oscServer = new osc.Server( fromMaxPort, '127.0.0.1' );

app.use( express.static('public') );

server.listen( webPort, () => {
    console.log(`Server running at http://localhost:${webPort}`);
});

const p5 = new Set();

io.on('connection', (socket) => {
    console.log('p5 connected');  
    
    p5.add( socket );
    
    socket.on('disconnect', () => {
        p5.delete( socket );
        console.log('p5 disconnected');
    });

    socket.on('bounce', () => {
        console.log('bounce');
        oscClient.send( '/p5/bounce', 1 );
    });

    socket.on('mouse', ( mouse ) => {
        console.log( 'mouse', mouse );
        oscClient.send( '/p5/mouse/x', mouse.x );
        oscClient.send( '/p5/mouse/y', mouse.y );
    });
    
    oscServer.on( 'pulse', ( message ) => {
        console.log( 'pulse' );
        socket.emit( 'pulse' );
    });
});

io.of('/posenet').on('connection', (socket) => {
    console.log('posenet connected');

    socket.on('disconnect', () => {
        console.log('posenet disconnected');
    });

    socket.on('pose', ( pose ) => {
        console.log( 'pose' );
        oscClient.send( '/pose/left_wrist/x', pose.left_wrist.x );
        oscClient.send( '/pose/left_wrist/y', pose.left_wrist.y );
        oscClient.send( '/pose/right_wrist/x', pose.right_wrist.x );
        oscClient.send( '/pose/right_wrist/y', pose.right_wrist.y );

        p5.forEach( ( p5Socket ) => {
            p5Socket.emit( 'pose', pose );
        } )
    });
})

