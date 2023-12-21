import { create, ghosts, torches,keys,hearts } from './sprites.js';
import { playerCollidesWithTorch, playerCollidesWithGhost,playerCollidesWithKey,keycount,health,playerCollidesWithHeart,playerCollidesWithGate } from './collision.js';
import { checkTorchState, updateScreenBrightness } from './torches.js';
import { gameUI }from "./gameUI.js";

var hasTorch = false;
const distance = 500;
var distanceThreshold = 0; 
function setHasTorch(value, ghosts) {
    hasTorch = value;
    ghosts.children.iterate(function (ghost) {
        ghost.setVisible(!hasTorch);
    });
}

function updateDistanceThreshold() {
    distanceThreshold += distance;
}

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    canvas: document.getElementById('canvas'),
    backgroundColor: 0xFFFFFF,
    //scene: [gameUI],
    scale:{
        zoom:5
    },
    physics: {
        default: 'arcade',
        debug: true
    },
};

var game = new Phaser.Game(config);
var cursors;
var player;
var heart1UI;
var heart2UI;
var heart3UI;
var key1UI;
var key2UI;
var key3UI;
var key4UI;
var key5UI;



game.scene.add('collision', {
    preload: function preload () {
        this.load.image('player', 'assets/anims/player/walk-down-01.png');
        this.load.image('ghost', 'assets/anims/ghost/down2.png');
        this.load.image('torch', 'assets/torch brazier.png');
        this.load.image('keyImg', 'assets/key.png');    
        this.load.image('heart','assets/heart.png');   
        this.load.image('gate','assets/gate.png');
        this.load.image('heartempty','assets/heartempty.png');
        this.load.image('heartfull','assets/heartfull.png');

        this.load.audio('bgm','assets/sounds/bgm.wav');
        this.load.audio('damage', 'assets/sounds/damage.mp3');
        this.load.audio('gateSound','assets/sounds/gate.mp3')
        this.load.audio('heartSound','assets/sounds/heart.mp3');
        this.load.audio('keySound','assets/sounds/keys.mp3');
        this.load.audio('torchSound','assets/sounds/torch.mp3');
        this.load.audio('WinSound','assets/sounds/victory.mp3');
        this.load.audio('LoseSound','assets/sounds/lose.mp3');

        this.load.atlas('playerAnim','assets/anims/player/texture.png','assets/anims/player/texture.json');

        //New code 
        //Load map assets
        this.load.image("tiles", "assets/tiles.png");
        this.load.tilemapTiledJSON("dungeon", "assets/Map.tmj");
        //End new code
    },
    create: function () {
        create(this);
        //this.scene.run('game-ui');
        cursors = this.input.keyboard.createCursorKeys();

        //New code 
        //Load map in layers        
        const map = this.make.tilemap({key: "dungeon"});        
        const tileset = map.addTilesetImage("tiles","tiles");
  
        map.createStaticLayer("Ground",tileset);
        const wallLayer = map.createStaticLayer("Walls",tileset);  
        wallLayer.setCollisionByProperty({collides: true});
        //End new code
        const debugGraphics = this.add.graphics().setAlpha(0.75);
        /*
        wallLayer.renderDebug(debugGraphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });
        */

        //UI        
        heart1UI = this.physics.add.sprite(250, 250, 'heartfull');
        heart2UI = this.physics.add.sprite(266, 250, 'heartfull');
        heart3UI = this.physics.add.sprite(282, 250, 'heartfull');
        heart1UI.setScrollFactor(0);
        heart2UI.setScrollFactor(0);
        heart3UI.setScrollFactor(0);
        
        key1UI = this.physics.add.sprite(570, 250);
        key2UI = this.physics.add.sprite(540, 250);
        key3UI = this.physics.add.sprite(510, 250);
        key4UI = this.physics.add.sprite(480, 250);
        key5UI = this.physics.add.sprite(450, 250); 
        
        key1UI.setScrollFactor(0);
        key2UI.setScrollFactor(0);
        key3UI.setScrollFactor(0);
        key4UI.setScrollFactor(0);
        key5UI.setScrollFactor(0);
        const ui = this.physics.add.group();
        ui.add(heart1UI,heart2UI,heart3UI,key1UI,key2UI,key3UI,key4UI,key5UI);

        //Music
        const music = this.sound.add('bgm');
        music.volume = (.08);
        music.setLoop(true);
        music.play();


        //We could just load in player/ghosts here
        player = this.physics.add.sprite( 160, 120,'player');
        player.setDisplaySize(32, 32);
        this.physics.add.collider(player, wallLayer);
        player.body.setSize(32,24);

        //maze ghosts
        var path = this.add.path(135, 900); 
        path.lineTo(135, 500); 
        var ghost = this.add.follower(path, 135, 900, 'ghost');
        ghosts.add(ghost);
        //ghost.setScale();
        ghost.startFollow({
            duration: 1800, 
            yoyo: true, // Make the ghost move back and forth on the path
            repeat: -1, // -1 means repeat indefinitely
        });
        var path1 = this.add.path(300, 775); 
        path1.lineTo(300, 450);
        var ghost1 = this.add.follower(path1, 300, 775, 'ghost');
        ghosts.add(ghost1);
        //ghost1.setScale(0.1);
        ghost1.startFollow({
            duration: 1600, 
            yoyo: true, // Make the ghost move back and forth on the path
            repeat: -1, // -1 means repeat indefinitely
        });
    
            // Define the path for the ghost to follow
        var path2 = this.add.path(460, 900); 
        path2.lineTo(460, 450); 
        var ghost2 = this.add.follower(path2, 460, 900, 'ghost');
        ghosts.add(ghost2);
        //ghost2.setScale(0.1);
        ghost2.startFollow({
            duration: 1800, 
            yoyo: true, // Make the ghost move back and forth on the path
            repeat: -1, // -1 means repeat indefinitely
        });    

        //box room ghosts
        var path3 = this.add.path(800,775);

        path3.lineTo(800,775);
        path3.lineTo(1220,775);
        path3.lineTo(1220,440);
        path3.lineTo(800,440);
        path3.lineTo(800,775);

        var ghost3 = this.add.follower(path3, 800, 775, 'ghost');
        ghosts.add(ghost3);
        //ghost2.setScale(0.1);
        ghost3.startFollow({
            duration: 6000, 
            //yoyo: true, // Make the ghost move back and forth on the path
            repeat: -1, // -1 means repeat indefinitely
        });
        var path4 = this.add.path(1220,440);
        path4.lineTo(1220,440);
        path4.lineTo(800,440);
        path4.lineTo(800,775);
        path4.lineTo(1220,775);
        path4.lineTo(1220,440);
        
        var ghost4 = this.add.follower(path4, 1220, 440, 'ghost');
        ghosts.add(ghost4);
        //ghost2.setScale(0.1);
        ghost4.startFollow({
            duration: 6000, 
            //yoyo: true, // Make the ghost move back and forth on the path
            repeat: -1, // -1 means repeat indefinitely
        });

        //left side wall obstacles ghosts
        var path5 = this.add.path(460, 1000); 
        path5.lineTo(800, 1000); 
        var ghost5 = this.add.follower(path5, 460, 1000, 'ghost');
        ghosts.add(ghost5);
        //ghost2.setScale(0.1);
        ghost5.startFollow({
            duration: 3000, 
            yoyo: true, // Make the ghost move back and forth on the path
            repeat: -1, // -1 means repeat indefinitely
        });
        var path6 = this.add.path(800, 1110); 
        path6.lineTo(460, 1110); 
        var ghost6 = this.add.follower(path6, 800, 1110, 'ghost');
        ghosts.add(ghost6);
        //ghost2.setScale(0.1);
        ghost6.startFollow({
            duration: 3000, 
            yoyo: true, // Make the ghost move back and forth on the path
            repeat: -1, // -1 means repeat indefinitely
        });
        
        var path7 = this.add.path(460, 1220); 
        path7.lineTo(1300, 1220); 
        var ghost7 = this.add.follower(path7, 460, 1220, 'ghost');
        ghosts.add(ghost7);
        //ghost2.setScale(0.1);
        ghost7.startFollow({
            duration: 3000, 
            yoyo: true, // Make the ghost move back and forth on the path
            repeat: -1, // -1 means repeat indefinitely
        });
        

        //right side wall obstacles ghosts
        var path8 = this.add.path(1300, 1000); 
        path8.lineTo(910, 1000); 
        var ghost8 = this.add.follower(path8, 1300, 1000, 'ghost');
        ghosts.add(ghost8);
        //ghost2.setScale(0.1);
        ghost8.startFollow({
            duration: 3000, 
            yoyo: true, // Make the ghost move back and forth on the path
            repeat: -1, // -1 means repeat indefinitely
        });
        var path9 = this.add.path(910, 1110); 
        path9.lineTo(1300, 1110); 
        var ghost9 = this.add.follower(path9, 910, 1110, 'ghost');
        ghosts.add(ghost9);
        //ghost2.setScale(0.1);
        ghost9.startFollow({
            duration: 3000, 
            yoyo: true, // Make the ghost move back and forth on the path
            repeat: -1, // -1 means repeat indefinitely
        }); 
        /*       
        var path10 = this.add.path(1300, 1220); 
        path10.lineTo(910, 1220); 
        var ghost10 = this.add.follower(path10, 1300, 1220, 'ghost');
        ghosts.add(ghost10);
        //ghost2.setScale(0.1);
        ghost10.startFollow({
            duration: 3000, 
            yoyo: true, // Make the ghost move back and forth on the path
            repeat: -1, // -1 means repeat indefinitely
        });
*/
        const gate = this.physics.add.sprite(1473, 1275, 'gate');
        gate.setScale(2.2);


        //torch placements
        const torch1 = this.physics.add.sprite(295, 885, 'torch');
        const torch2 = this.physics.add.sprite(600, 1055, 'torch');
        const torch3 = this.physics.add.sprite(1010, 650, 'torch');
    
        torch1.setDisplaySize(32,32);
        torch2.setDisplaySize(32,32);
        torch3.setDisplaySize(32,32);
    
        torches.push(torch1, torch2, torch3);
        checkTorchState(player, distanceThreshold);
        console.log("Initial Threshold:", distanceThreshold);

        //key placements
        const key1 = this.physics.add.sprite(55,885,'keyImg');
        const key2 = this.physics.add.sprite(380,550,'keyImg');
        const key3 = this.physics.add.sprite(620,885,'keyImg');
        const key4 = this.physics.add.sprite(1010,550,'keyImg');
        const key5 = this.physics.add.sprite(855,1165,'keyImg');
        keys.push(key1,key2,key3,key4,key5);


        const heart1 = this.physics.add.sprite(55,775,'heart');
        const heart2 = this.physics.add.sprite(535,885,'heart');
        const heart3 = this.physics.add.sprite(1130,1055,'heart');
        heart1.setScale(2);
        heart2.setScale(2);
        heart3.setScale(2);
        hearts.push(heart1,heart2,heart3);

        this.physics.add.overlap(player, keys, playerCollidesWithKey, null, this);
        this.physics.add.overlap(player, ghosts.getChildren(), playerCollidesWithGhost, null, this);
        this.physics.add.overlap(player, torches, playerCollidesWithTorch, null, this);
        this.physics.add.overlap(player, gate, playerCollidesWithGate, null, this);
        this.physics.add.overlap(player, hearts, playerCollidesWithHeart, null, this);





        //player animations
        this.anims.create({
            key:'player-idle-down',
            frames: [{key: 'playerAnim', frame:'player/walk-down-01.png'}]
        });
        this.anims.create({
            key: 'playerWalkDown',
            frames: this.anims.generateFrameNames('playerAnim',{start:1, end:4, prefix:'player/walk-down-0', suffix:'.png'}),
            repeat: -1,
            frameRate: 10
        });
        this.anims.create({
            key: 'playerWalkUp',
            frames: this.anims.generateFrameNames('playerAnim',{start:1, end:4, prefix:'player/walk-up-0', suffix:'.png'}),
            repeat: -1,
            frameRate: 10
        });
        this.anims.create({
            key: 'playerWalkRight',
            frames: this.anims.generateFrameNames('playerAnim',{start:1, end:4, prefix:'player/walk-right-0', suffix:'.png'}),
            repeat: -1,
            frameRate: 10
        });
        this.anims.create({
            key: 'playerWalkLeft',
            frames: this.anims.generateFrameNames('playerAnim',{start:1, end:4, prefix:'player/walk-left-0', suffix:'.png'}),
            repeat: -1,
            frameRate: 10
        });

        //player.anims.play('player-idle-down');

        this.cameras.main.startFollow(player,true);
        this.cameras.main.setZoom(2);

        

    },
    update: function () {
        //PlayerMovement(this);
            // Initialize velocity values
    let velocityX = 0;
    let velocityY = 0;
    var playerSpeed = 300;
    if(health <= 0){
        player.setVelocity(0, 0);
        player.anims.play('player-idle-down', true);
        heart1UI.setTexture('heartempty');
        heart2UI.setTexture('heartempty');
        heart3UI.setTexture('heartempty');
    } else {
    if(keycount > 5){
        player.setVelocity(0, 0);
        player.anims.play('player-idle-down', true);
    } else {
    
    // Check for keyboard input to move the player
    if (cursors.left.isDown) {
        velocityX = -playerSpeed; // Move left
        //player.body.offset.x = 0;
        player.anims.play('playerWalkLeft', true);
        checkTorchState(player, distanceThreshold);
    }
    if (cursors.right.isDown) {
        velocityX = playerSpeed;
        //player.body.offset.x = 0; // Move right
        player.anims.play('playerWalkRight', true);
        checkTorchState(player, distanceThreshold);
    }
    if (cursors.up.isDown) {
        velocityY = -playerSpeed;
        player.body.offset.y = 16; // Move up
        player.anims.play('playerWalkUp', true);
        checkTorchState(player, distanceThreshold);
    }
    if (cursors.down.isDown) {
        velocityY = playerSpeed;
        player.body.offset.y = 8; // Move down
        player.anims.play('playerWalkDown', true);
        checkTorchState(player, distanceThreshold);
    }
    if(!cursors.left.isDown && !cursors.right.isDown && !cursors.up.isDown && !cursors.down.isDown) {
        player.setVelocity(0, 0);
        player.anims.play('player-idle-down', true);
    }   

    // Normalize the diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
        const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        velocityX = (velocityX / length) * playerSpeed;
        velocityY = (velocityY / length) * playerSpeed;
    }

    // Set the player's velocity
    player.setVelocity(velocityX, velocityY);

    // Check if no keys are pressed and stop the player

    if(health == 1){
        heart1UI.setTexture('heartfull');
        heart2UI.setTexture('heartempty');
        heart3UI.setTexture('heartempty');
    }
    if(health == 2){
        heart1UI.setTexture('heartfull');
        heart2UI.setTexture('heartfull');
        heart3UI.setTexture('heartempty');
    }
    if(health == 3){
        heart1UI.setTexture('heartfull');
        heart2UI.setTexture('heartfull');
        heart3UI.setTexture('heartfull');
    }
    
    if(keycount == 1){
        key1UI.setTexture('keyImg');
    }
    if(keycount == 2){
        key2UI.setTexture('keyImg');
    }
    if(keycount == 3){
        key3UI.setTexture('keyImg');
    }
    if(keycount == 4){
        key4UI.setTexture('keyImg');
    }
    if(keycount == 5){
        key5UI.setTexture('keyImg');
    }

    }
    }
    }
});


game.scene.start('collision');

export { hasTorch, setHasTorch, distance, distanceThreshold, updateDistanceThreshold};
