import swarm from '../../swarm';

const keyUpCode = 65; // a
const keyDownCode = 81; // q

class KeyListener {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.lastKeyPressedTime = 0;
    this.pressedKeys = [];
    this.keydown = function (e) {
      this.pressedKeys[e.keyCode] = true;
    };
    this.keyup = function (e) {
      this.pressedKeys[e.keyCode] = false;
      const currentTime = Math.floor(new Date().getTime() / 1000);
      if (currentTime !== this.lastKeyPressedTime) {
        if (e.keyCode === keyUpCode || e.keyCode === keyDownCode) {
          this.lastKeyPressedTime = currentTime;
        }
        let keyState = 0;
        if (e.keyCode === keyUpCode) {
          keyState = 1;
        } else if (e.keyCode === keyDownCode) {
          keyState = 2;
        }
        if (this.gameManager.topic && this.gameManager.privateKey && keyState !== 0) {
          console.log(`Sending: ${keyState}`);
          swarm.updateResource(
            this.gameManager.privateKey,
            this.gameManager.topic,
            keyState,
          );
        }
      }
    };
    document.addEventListener('keydown', this.keydown.bind(this));
    document.addEventListener('keyup', this.keyup.bind(this));
  }

  isUpPressed() {
    return this.isPressed(keyUpCode) === true;
  }

  isDownPressed() {
    return this.isPressed(keyUpCode) === true;
  }

  isPressed(key) {
    return !!this.pressedKeys[key];
  }
}

export default KeyListener;
