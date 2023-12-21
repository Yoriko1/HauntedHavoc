import { hasTorch, setHasTorch, distance, distanceThreshold, updateDistanceThreshold} from './main.js';
import { create, ghosts, torches, keys,hearts} from './sprites.js';
import { checkTorchState, updateScreenBrightness } from './torches.js';


var playerBlinking = false;
var blinkDuration = 3000; // 2 seconds
var blinkInterval = 250; // Blink every 250ms
var blinkCount = 0;
var blinkIntervalId;
var keycount = 0;
var health = 3;
let loseMessage;
let darknessOverlay;

function playerCollidesWithTorch(player, torch) {
    updateDistanceThreshold();
    const torchSound = this.sound.add('torchSound');
    torchSound.volume = (.1);
    torchSound.play();
    console.log("Threshold when you obtain a torch:", distanceThreshold);
    // Handle the player obtaining a torch
    console.log('Torch collected'); // Debugging line
    setHasTorch(true, ghosts, distance);
    const torchIndex = torches.indexOf(torch);
    console.log('You got this torch:', torchIndex);
    if (torchIndex !== -1) {
        // Remove the torch from the array and destroy it
        torches.splice(torchIndex, 1);
        torch.destroy();
    }

    // Update the torch state and screen brightness
    checkTorchState(player, distanceThreshold)

    // Perform other actions when the player obtains a torch
}


function playerCollidesWithGhost(player, ghosts) {
    if (!hasTorch) {
        if (!playerBlinking && health !==0) {
            console.log("hit");
            health--;
            const damageSound = this.sound.add('damage');
            damageSound.volume = (.05);
            damageSound.play();
            if(health == 0){

                const playerDeathX = player.x;
                const playerDeathY = player.y;
                // Create a black overlay to gradually darken the screen
                darknessOverlay = this.add.graphics();
                darknessOverlay.fillStyle(0x000000, 1);
                darknessOverlay.fillRect(playerDeathX - this.game.config.width / 2, playerDeathY - this.game.config.height / 2, this.game.config.width, this.game.config.height);
                darknessOverlay.setAlpha(0); // Initially transparent
                // Tween to gradually increase the alpha of the overlay
                this.tweens.add({
                    targets: darknessOverlay,
                    alpha: 1,
                    duration: 3000 // Adjust the duration as needed
                });
                                // Display "YOU LOSE" message
                                loseMessage = this.add.text(
                                    playerDeathX,
                                    playerDeathY,
                                    'YOU LOSE',
                                    { fontSize: '75px', fill: '#fff' }
                                    );
                                    loseMessage.setOrigin(0.5);
                                    const LoseSound = this.sound.add('LoseSound');
                                    LoseSound.volume = (.2);
                                    LoseSound.play();
                                    
            } else {
            console.log(health);
            playerBlinking = true;
            blinkCount = 0;
            player.visible = true; // Ensure the player is initially visible

            // Start the blinking interval
            blinkIntervalId = setInterval(() => {
                player.visible = !player.visible; // Toggle player visibility
                blinkCount += blinkInterval;
                
                if (blinkCount >= blinkDuration) {
                    // Blinking duration is over
                    player.visible = true; // Ensure the player is fully visible
                    playerBlinking = false; // Reset the blinking flag
                    clearInterval(blinkIntervalId); // Clear the blinking interval
                }
            }, blinkInterval);
        }
    }
}
}

function playerCollidesWithKey(player,key){
    keycount++;
    //console.log(keycount);
    const keySound = this.sound.add('keySound');
    keySound.volume = (.2);
    keySound.play();
    const keyIndex = keys.indexOf(key);
    console.log(keyIndex);
    console.log(keys);
    if (keyIndex !== -1) {  
        key.destroy();
        keys.splice(keyIndex, 1);
        
    }


}
function playerCollidesWithGate(player,gate){
    if (keycount === 5) {
        const gateSound = this.sound.add('gateSound');
        gateSound.volume = (.05);
        gateSound.play();
    keycount++
    const playerEscapeX = player.x;
    const playerEscapeY = player.y;
    // Create a black overlay to gradually darken the screen
    darknessOverlay = this.add.graphics();
    darknessOverlay.fillStyle(0x000000, 1);
    darknessOverlay.fillRect(playerEscapeX - this.game.config.width / 2, playerEscapeY - this.game.config.height / 2, this.game.config.width, this.game.config.height);
    darknessOverlay.setAlpha(0); // Initially transparent
    // Tween to gradually increase the alpha of the overlay
    this.tweens.add({
        targets: darknessOverlay,
        alpha: 1,
        duration: 3000 // Adjust the duration as needed
    });
                    // Display "YOU WIN" message
                    loseMessage = this.add.text(
                        playerEscapeX,
                        playerEscapeY,
                        'YOU WIN',
                        { fontSize: '75px', fill: '#fff' }
                        );
                        loseMessage.setOrigin(0.5);
                        const WinSound = this.sound.add('WinSound');
                        WinSound.volume = (.2);
                        WinSound.play();
}
}

function playerCollidesWithHeart(player,heart){
    if(health < 3){
        const heartIndex = hearts.indexOf(heart);
        health++;
        const heartSound = this.sound.add('heartSound');
        heartSound.volume = (.1);
        heartSound.play();
        console.log(health)
        if (heartIndex !== -1) {  
            heart.destroy();
            hearts.splice(heartIndex, 1);
            
        } 
    }


}
export { playerCollidesWithTorch, playerCollidesWithGhost,playerCollidesWithKey,keycount,health,playerCollidesWithHeart,playerCollidesWithGate };




