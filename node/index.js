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
const toMax = new osc.Client('127.0.0.1', toMaxPort );
const fromMax = new osc.Server( fromMaxPort, '127.0.0.1' );

app.use( express.static('public') );

server.listen( webPort, () => {
    console.log(`Server running at http://localhost:${webPort}`);
});

const p5connections = new Set();

io.on('connection', (p5) => {
    console.log('p5 connected');  
    
    p5connections.add( p5 );
    
    p5.on('disconnect', () => {
        p5connections.delete( p5 );
        console.log('p5 disconnected');
    });

    p5.on('bounce', () => {
        console.log('bounce');
        toMax.send( '/bounce', 1 );
    });

    p5.on('mouse', ( mouse ) => {
        console.log( 'mouse', mouse );
        toMax.send( '/mouse/x', mouse.x );
        toMax.send( '/mouse/y', mouse.y );
    });
    
    fromMax.on( 'pulse', ( message ) => {
        console.log( 'pulse' );
        p5.emit( 'pulse' );
    });
});

io.of('/posenet').on('connection', (socket) => {
    console.log('posenet connected');

    socket.on('disconnect', () => {
        console.log('posenet disconnected');
    });

    socket.on('pose', ( pose ) => {
        console.log( 'pose' );
        toMax.send( '/pose/left_wrist/x', pose.left_wrist.x );
        toMax.send( '/pose/left_wrist/y', pose.left_wrist.y );
        toMax.send( '/pose/right_wrist/x', pose.right_wrist.x );
        toMax.send( '/pose/right_wrist/y', pose.right_wrist.y );

        p5connections.forEach( ( p5 ) => {
            p5.emit( 'pose', pose );
        } )
    });
})

