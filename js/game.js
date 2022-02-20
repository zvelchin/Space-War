"use strict"; // Strict regime

const cvs = document.querySelector("#canvas"); // receipt canvas
const ctx = cvs.getContext("2d");

const scale = 0.5; //scale of the ship
const scaleOfCollision = 0.35;
const laserScale = 0.2;
const scaleOfHit = 0.05;
const speedOfLaser = 10;
const speedOfEnemyLaser = 10;
const music = new Audio();
const shootAudio = new Audio();
const explosionAudio = new Audio();
let score = 0;

music.src = "audio/music.mp3";
music.volume = "0.4"; //sound level
shootAudio.src = "audio/shoot.mp3";
shootAudio.volume = "0.4";
explosionAudio.src = "audio/explosionAudio.mp3";
explosionAudio.volume = "0.4";

Resize();

window.addEventListener("resize", Resize); //When you load a page, you get canvas size

//first background
const firstSpace = new Space("img/background.png", 0);
//second background, which is behind the canvas above the first
const secondSpace = new Space("img/background.png", -1 * cvs.height);

let enemies = []; //enemy ships
let enemiesID;

let enemiesOfficers = [];
let enemiesOfficersID;

let player = new Player("img/ship.png", cvs.width / 2, cvs.height - 100); //player location

let playerLaser = []; //laser rounds
let enemiesLasers = []; //enemy gunfire
let enemiesLasersID;

let leftOfficersLaser = []; //Officers' left laser shot
let rightOfficersLaser = []; //Officers' right laser shot
let officersLasersID;

function drawSpace(space) {
  //draw the cosmos
  ctx.drawImage(
    space.image,
    0,
    0,
    space.image.width,
    space.image.height,
    space.x,
    space.y,
    cvs.width,
    cvs.height
  );
}

function drawShip(ship) {
  //drawing ships
  ctx.drawImage(
    ship.image,
    0,
    0,
    ship.image.width,
    ship.image.height,
    ship.x,
    ship.y,
    ship.image.width * scale,
    ship.image.height * scale
  );
}

function drawLaser(laser) {
  //draw lasers
  ctx.drawImage(
    laser.image,
    0,
    0,
    laser.image.width,
    laser.image.height,
    laser.x,
    laser.y,
    laser.image.width * laserScale,
    laser.image.height * laserScale
  );
}

function Update() {
  //Game update
  if (!continueAnimating) {
    return;
  }

  enemiesID = setInterval(() => {
    let enemyShip = new Enemies(
      "img/enemyship.png",
      randomInteger(0, cvs.width),
      -50
    ); //x randomly, and by y for canvas

    let probability = randomInteger(0, 1);
    //50% for the enemy to have a laser
    if (probability == 0) {
      enemyShip.hasEnemyLaser();
    }
    enemies.push(enemyShip);
  }, 1500);

  enemiesLasersID = setInterval(() => {
    enemies.forEach((enemy) => {
      if (enemy.hasLaser) {
        enemiesLasers.push(
          new Gun("img/enemyLaser.png", enemy.x + 18, enemy.y + 13)
        );
      }
    });
  }, 1500);

  enemiesOfficersID = setInterval(() => {
    if (score >= 10) {
      let enemyOfficer = new Officers(
        "img/officer.png",
        randomInteger(0, cvs.width),
        -100
      );

      let probability = randomInteger(0, 2);
      //33% for officers to have lasers
      if (probability == 0) {
        enemyOfficer.hasEnemyLaser();
      }
      enemiesOfficers.push(enemyOfficer);
    }
  }, 1000);

  officersLasersID = setInterval(() => {
    enemiesOfficers.forEach((officer) => {
      if (officer.hasLaser) {
        leftOfficersLaser.push(
          new Gun("img/officerLaser.png", officer.x + 25, officer.y + 65)
        );
        rightOfficersLaser.push(
          new Gun("img/officerLaser.png", officer.x + 65, officer.y + 65)
        );
      }
    });
  }, 1000);
}

function Game() {
  if (!continueAnimating) {
    return;
  }

  //We draw both backgrounds first
  drawSpace(firstSpace);
  drawSpace(secondSpace);
  //hang them
  firstSpace.y++;
  secondSpace.y++;
  //If the main background reaches the end of the screen, set the background for the starting positions
  if (firstSpace.y >= cvs.height) {
    firstSpace.y = firstSpace.startY;
    secondSpace.y = secondSpace.startY;
  }

  for (let i = 0; i < playerLaser.length; i++) {
    //draw the player’s laser
    drawLaser(playerLaser[i]);
    playerLaser[i].moveThePlayerLaser(speedOfLaser);

    if (playerLaser[i].y < -50) {
      //If the laser is behind the screen, remove it from the array
      playerLaser.splice(i, 1);
      i--;
      break;
    }
  }
  drawShip(player); //draw

  // draw the enemies

  for (let i = 0; i < enemies.length; i++) {
    drawShip(enemies[i]); //drawing enemy ships
    enemies[i].moveTheEnemy();

    if (enemies[i].y > cvs.height) {
      //If the enemy is behind the screen, remove it from the array
      enemies.splice(i, 1);
      i--;
      break;
    }

    let collision = player.Crashed(enemies[i]); //call a method for the player to hit enemies

    if (collision) {
      //if true, then GAME OVER.
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.font = "72px Plaguard";
      ctx.fillText("GAME OVER", cvs.width / 2, cvs.height / 2);
      player.dead = true;
    }

    for (let j = 0; j < playerLaser.length; j++) {
      let hit = enemies[i].enemiesCrashed(playerLaser[j]); //laser fire
      let explosion = new Image(); //explosion after impact
      explosion.src = "img/explosion.gif";

      if (hit) {
        //if you hit
        score++;
        ctx.drawImage(
          explosion,
          enemies[i].x,
          enemies[i].y,
          explosion.width * scale,
          explosion.height * scale
        );
        explosion.onload = enemies.splice(i, 1);
        i--;
        playerLaser.splice(j, 1);
        j--;
        explosionAudio.play();
        break;
      }
    }
  }

  // lasers of enemy
  for (let i = 0; i < enemiesLasers.length; i++) {
    drawLaser(enemiesLasers[i]);
    enemiesLasers[i].moveTheEnemyLaser(speedOfEnemyLaser);

    if (enemiesLasers[i].y > cvs.height) {
      enemiesLasers.splice(i, 1);
      i--;
      break;
    }

    let hitByEnemy = player.hitByEnemy(enemiesLasers[i]); //call method for player "defeated by enemy"

    if (hitByEnemy) {
      //if true, then GAME OVER.
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.font = "72px Plaguard";
      ctx.fillText("GAME OVER", cvs.width / 2, cvs.height / 2);
      player.dead = true;
    }
  }

  if (score >= 10) {
    clearInterval(enemiesID);
    clearInterval(enemiesLasersID);

    for (let i = 0; i < enemiesOfficers.length; i++) {
      drawShip(enemiesOfficers[i]);
      enemiesOfficers[i].moveTheEnemy();

      if (enemiesOfficers[i].y > cvs.height) {
        enemiesOfficers.splice(i, 1);
        i--;
        break;
      }

      let collision = player.Crashed(enemiesOfficers[i]);

      if (collision) {
        //if true, then GAME OVER.
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "72px Plaguard";
        ctx.fillText("GAME OVER", cvs.width / 2, cvs.height / 2);
        player.dead = true;
      }

      for (let j = 0; j < playerLaser.length; j++) {
        let hit = enemiesOfficers[i].enemiesCrashed(playerLaser[j]); //laser fire
        let explosion = new Image(); //explosion after impact
        explosion.src = "img/explosion.gif";

        if (hit) {
          //if you hit
          score++;
          if (enemiesOfficers[i].health > 0) {
            ctx.drawImage(
              explosion,
              enemiesOfficers[i].x,
              enemiesOfficers[i].y + 50,
              explosion.width * scale,
              explosion.height * scale
            );
          }
          if (enemiesOfficers[i].health <= 0) {
            ctx.drawImage(
              explosion,
              enemiesOfficers[i].x,
              enemiesOfficers[i].y,
              explosion.width * 1.2,
              explosion.height * 1.2
            );
            explosion.onload = enemiesOfficers.splice(i, 1);
            explosionAudio.play();
            i--;
          }
          playerLaser.splice(j, 1);
          j--;
          break;
        }
      }
    }

    for (let i = 0; i < leftOfficersLaser.length; i++) {
      drawLaser(leftOfficersLaser[i]);
      leftOfficersLaser[i].moveTheEnemyLaser(speedOfEnemyLaser);

      if (leftOfficersLaser[i].y > cvs.height) {
        leftOfficersLaser.splice(i, 1);
        i--;
        break;
      }

      let hitByOfficer = player.hitByEnemy(leftOfficersLaser[i]);

      if (hitByOfficer) {
        //if true, then GAME OVER.
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "72px Plaguard";
        ctx.fillText("GAME OVER", cvs.width / 2, cvs.height / 2);
        player.dead = true;
      }
    }

    for (let i = 0; i < rightOfficersLaser.length; i++) {
      drawLaser(rightOfficersLaser[i]);
      rightOfficersLaser[i].moveTheEnemyLaser(speedOfEnemyLaser);

      if (rightOfficersLaser[i].y > cvs.height) {
        rightOfficersLaser.splice(i, 1);
        i--;
        break;
      }

      let hitByOfficer = player.hitByEnemy(rightOfficersLaser[i]);

      if (hitByOfficer) {
        //if true, then GAME OVER.
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "72px Plaguard";
        ctx.fillText("GAME OVER", cvs.width / 2, cvs.height / 2);
        player.dead = true;
      }
    }
  }

  ctx.fillStyle = "#fff";
  ctx.font = "24px Plaguard";
  ctx.textAlign = "left";
  ctx.fillText(`SCORE: ${score}`, 10, cvs.height - 20); //scoring

  music.play();

  ctx.clearRect(0, 0, cvs.width, 0);

  if (!player.dead) {
    //before the player dies, the game goes
    requestAnimationFrame(Game);
  } else {
    //And then we start playing again
    music.pause();

    let restart = {
      x: cvs.width / 2.3,
      y: cvs.height / 4,
      w: 200,
      h: 50,
      textAlign: "center",
      text: "RESTART",
      state: "default",
      draw: function () {
        ctx.font = "48px Plaguard";
        switch (this.state) {
          case "over":
            ctx.fillStyle = "rgba(100, 150, 185, 0)";
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = "#DCDCDC";
            ctx.fillText(
              "RESTART",
              this.x + this.w / 2 - ctx.measureText("RESTART").width / 2,
              this.y + this.h / 2 + 10
            );
            break;
          default:
            ctx.fillStyle = "rgba(100, 150, 185, 0)";
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = "#ffff";
            ctx.fillText(
              "RESTART",
              this.x + this.w / 2 - ctx.measureText("RESTART").width / 2,
              this.y + this.h / 2 + 10
            );
        }
      },
    };
    restart.draw();
    cvs.addEventListener(
      "mousedown",
      function (e) {
        if (checkCollision(e.offsetX, e.offsetY, restart))
          window.location.reload(); //reboot page
      },
      false
    );

    cvs.addEventListener(
      "mousemove",
      function (e) {
        restart.state = checkCollision(e.offsetX, e.offsetY, restart)
          ? "over"
          : "def";
        restart.draw();
      },
      false
    );
  }
}

function Resize() {
  cvs.width = window.innerWidth;
  cvs.height = window.innerHeight;
}

function randomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

function checkCollision(x, y, obj) {
  //Checks if a point is in a rectangle
  return x >= obj.x && x <= obj.x + obj.w && y >= obj.y && y <= obj.y + obj.h;
}

document.querySelector("#play").onclick = function () {
  //game start
  document.querySelector(".wrapper").classList.add("active");
  Game();
  Update();
};

let status = 0;
const stopGame = document.querySelector("#pause");
let continueAnimating = true;

stopGame.addEventListener("click", function () {
  if (status == 0) {
    status = 1;
    continueAnimating = false;
    stopGame.innerHTML = '<i class="fa fa-play"></i>';
    clearInterval(enemiesID);
    clearInterval(enemiesLasersID);
    clearInterval(enemiesOfficersID);
    clearInterval(officersLasersID);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "72px Plaguard";
    ctx.fillText("PAUSED", cvs.width / 2, cvs.height / 2);
    music.pause();
  } else {
    status = 0;
    continueAnimating = true;
    Game();
    Update();
    stopGame.innerHTML = '<i class="fa fa-pause"></i>';
  }
});
