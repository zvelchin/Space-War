"use strict";

class Space {
  constructor(image, y) {
    this.x = 0; //space moves only on y
    this.startY = y;
    this.y = y;

    this.image = new Image(); //background.png
    this.image.src = image; //src to background.png
  }
}

class SpaceObjects {
  //all objects in the space
  constructor(image, x, y) {
    this.x = x; //position of objects on x
    this.y = y; // position of objects on y

    this.image = new Image();
    this.image.src = image;
  }
}

class Player extends SpaceObjects {
  //player
  constructor(image, x, y) {
    super(image, x, y);
    this.dead = false;
    this.speed = 10; //speed of movement
    this.keyList = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft", "Space"]; //ship control
    this.keys = {};
    this.shoot = window.addEventListener("keyup", (e) => {
      if (e.keyCode == "32") {
        //while clicking on space, fires
        playerLaser.push(new Gun("img/laser.png", player.x + 17, player.y + 3));
        shootAudio.play();
        if (player.dead) {
          shootAudio.pause();
        }
      }
    });

    addEventListener("keydown", (e) => this.changeState(e));
    addEventListener("keyup", (e) => this.changeState(e));
  }

  changeState(e) {
    if (!this.keyList.includes(e.code)) return;
    this.keys[e.code] = e.type === "keydown" ? true : false;

    if (this.keys.ArrowUp) {
      //moving up
      this.y -= this.speed;
    }

    if (this.keys.ArrowRight) {
      //moving right
      this.x += this.speed;
    }

    if (this.keys.ArrowDown) {
      //moving down
      this.y += this.speed;
    }

    if (this.keys.ArrowLeft) {
      //moving left
      this.x -= this.speed;
    }

    if (this.y < 0) {
      //allows us not to go up canvas
      this.y = 0;
    }

    if (this.x + this.image.width * scale > cvs.width) {
      //allows us not to go right canvas
      this.x -= this.speed;
    }

    if (this.y + this.image.height * scale > cvs.height) {
      //allows us not to go down canvas
      this.y -= this.speed;
    }

    if (this.x < 0) {
      //allows us not to go left canvas
      this.x = 0;
    }
  }

  Crashed(enemiesShips) {
    //collision of the player with enemy ships
    let collision = false;

    if (
      this.y <= enemiesShips.y + enemiesShips.image.height * scaleOfCollision &&
      this.y + this.image.height * scaleOfCollision >= enemiesShips.y
    ) {
      //if our player is on the same level by y with enemy ships
      if (
        this.x <=
          enemiesShips.x + enemiesShips.image.width * scaleOfCollision &&
        this.x + this.image.width * scaleOfCollision >= enemiesShips.x
      ) {
        //Same thing, but already by x
        collision = true;
      }
    }

    return collision; //The collision occurred!
  }

  hitByEnemy(theEnemyGotHit) {
    //The player was hit by a laser
    let hit = false;

    if (
      this.y <= theEnemyGotHit.y + theEnemyGotHit.image.height * scaleOfHit &&
      this.y + this.image.height * scaleOfCollision >= theEnemyGotHit.y
    ) {
      //if our player is on the same level y by y with the enemy laser
      if (
        this.x <= theEnemyGotHit.x + theEnemyGotHit.image.width * scaleOfHit &&
        this.x + this.image.width * scaleOfCollision >= theEnemyGotHit.x
      ) {
        //by x
        hit = true;
      }

      return hit; //Hit the player!
    }
  }
}

class Enemies extends SpaceObjects {
  //enemies
  constructor(image, x, y) {
    super(image, x, y);
    this.speed = randomInteger(2, 4); //enemy speed changes
    this.hasLaser = false; //not all enemies will shoot
    this.z = randomInteger(-1, 1); //for sinus
  }

  enemiesCrashed(thePlayerGotHit) {
    //player hit
    let hit = false;

    if (
      this.y <= thePlayerGotHit.y + thePlayerGotHit.image.height * scaleOfHit &&
      this.y + this.image.height * scaleOfCollision >= thePlayerGotHit.y
    ) {
      //if the player’s laser is on level y with the enemy
      if (
        this.x <=
          thePlayerGotHit.x + thePlayerGotHit.image.width * scaleOfHit &&
        this.x + this.image.width * scaleOfCollision >= thePlayerGotHit.x
      ) {
        //Same thing, but already by x
        hit = true;
      }

      return hit;
    }
  }

  moveTheEnemy() {
    //enemy movement
    this.y += this.speed;
    this.x = this.x + Math.sin(this.z);
  }

  hasEnemyLaser() {
    this.hasLaser = true; //enemies who shoot
  }
}

class Gun extends SpaceObjects {
  constructor(image, x, y) {
    super(image, x, y);
  }

  moveThePlayerLaser(spd) {
    //player shot
    this.y -= spd;
  }

  moveTheEnemyLaser(spd) {
    //enemy fire
    this.y += spd;
  }
}

class Officers extends SpaceObjects {
  constructor(image, x, y) {
    super(image, x, y);
    this.speed = randomInteger(2, 4); //officer speed changes
    this.hasLaser = false; //Not all officers will shoot
    this.z = randomInteger(-1, 1); //for sinus
    this.health = 2;
  }

  enemiesCrashed(thePlayerGotHit) {
    //the player hit an officer

    if (
      this.y <= thePlayerGotHit.y + thePlayerGotHit.image.height * scaleOfHit &&
      this.y + this.image.height * scaleOfCollision >= thePlayerGotHit.y
    ) {
      if (
        this.x <=
          thePlayerGotHit.x + thePlayerGotHit.image.width * scaleOfHit &&
        this.x + this.image.width * scaleOfCollision >= thePlayerGotHit.x
      ) {
        this.health--;
        return true;
      }

      return false;
    }
  }

  moveTheEnemy() {
    this.y += this.speed;
    this.x = this.x + Math.sin(this.z);
  }

  hasEnemyLaser() {
    this.hasLaser = true;
  }
}
