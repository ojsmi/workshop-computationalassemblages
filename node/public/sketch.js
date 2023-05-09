let x, y, sX, sY;
let socket = io();

let bgColour = 0;
let pose;

function setup() {
    createCanvas( 500, 500 );
    
    x = width / 2;
    y = height / 2;
    sX = random( -5, 5 );
    sY = random( -5, 5 );

    socket.on( 'pulse', () => {
        bgColour = 255;
    });
    socket.on( 'pose', ( newPose ) => {
       pose = newPose;
    });
}

function draw() {
    background( bgColour );
    fill( 255 );
    noStroke();
    ellipse( x, y, 20, 20 );
    x += sX;
    y += sY;
    if( x > width || x < 0 ){
        sX = sX * -1;
        socket.emit('bounce');
    }
    if( y > height || y < 0 ){
          sY = sY * -1;
        socket.emit('bounce');
    }
    bgColour -= 10;
    if( pose ){
        noFill();
        stroke( 0, 255, 0 );
        ellipse( pose.left_wrist.x, pose.left_wrist.y, 50, 50  );
        ellipse( pose.right_wrist.x, pose.right_wrist.y, 50, 50  );
    }
}

function mouseDragged(){
    socket.emit('mouse', {x: mouseX/width, y: 1 - (mouseY/height) })
}