// classes for all circles, monsters, player and coins
class Circle {
    constructor(color, radius, v) {
        this.radius = radius;
        this.v = v;

        let circle = new PIXI.Graphics();
        circle.beginFill(color);
        circle.drawCircle(0, 0, radius);
        circle.endFill();
        circle.x = radius;
        circle.y = radius;
        app.stage.addChild(circle);

        this.circle = circle;
    }

    remove() {
        app.stage.removeChild(this.circle);
    }

    collide(other) {
        let dx = other.circle.x - this.circle.x;
        let dy = other.circle.y - this.circle.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        return dist < (this.radius + other.radius);
    }
}

class Monster extends Circle {
    update() {
        this.circle.className = "monster";
        this.circle.x += this.v.x;
        this.circle.y += this.v.y;

        if (this.circle.x >= w-this.radius) {
            this.v.x *= -1;
        }

        else if (this.circle.x <= this.radius) {
            this.v.x *= -1;
        }

        if (this.circle.y >= h-this.radius) {
            this.v.y *= -1;
        }
        else if (this.circle.y <= this.radius) {
            this.v.y *= -1;
        }
        
    }
}

class Player extends Circle {
    constructor(color, radius, v) {
        super(color, radius, v);
        this.reset();
    }

    reset() {
        this.circle.x = w/2;
        this.circle.y = h/2;
        this.speed = 3;
    }

    update() {
        let x = this.circle.x + this.v.x;
        let y = this.circle.y + this.v.y;

        this.circle.x = Math.min(Math.max(x, this.radius), w-this.radius);
        this.circle.y = Math.min(Math.max(y, this.radius), w-this.radius);

        // monster collition
        monsters.forEach(m => {
            if (this.collide(m)) {
               if( aux == 0){
                // playing sound
                deathSnd.play();
                deathSnd.currentTime = 0;
                // stopping game 
                // saving player stats and ending
                
                playerScore = document.querySelector('#score span').innerHTML;
                scoreArray.push(playerScore);               
                 // GAME OVER SCREEN
                gameOver();
                aux++;
                }

            }
        });

        // coin collition 
        if (this.collide(coin)) {
            // coin sounds
            coinSnd.play();
            coinSnd.currentTime = 0;
            // Updating coins, generating new random coin, adding monster and updating stats
            updateCoins(coins+1);
            coin.random();
            addMonster();
            if(this.speed < 15){
                this.speed = this.speed + 0.2;
            //     ClickEvent("coins");
            // }else{
            //     ClickEvent("coins");
            }            
            return;
        }
    }
}

class Coin extends Circle {
    random() {
        this.circle.x = this.radius + Math.random()*(w - 2*this.radius);
        this.circle.y = this.radius + Math.random()*(h - 2*this.radius);
    }

    update() {
         let s = 1 + Math.sin(new Date() * 0.01) * 0.2;
        this.circle.scale.set(s, s);
    }
}

function addMonster() {
    monsters.push(new Monster(0xBB3838, Math.random()*10 + 10, {x:2 + Math.random(), y:2 + Math.random()}));
}

// control functions
function onkeydown(ev) {
    switch (ev.key) {
        case "ArrowLeft":
        case "a":
            player.v.x = -player.speed; 
            pressed['left'] = true;
            break;

        case "ArrowRight":
        case "d":
            player.v.x = player.speed;
            pressed['right'] = true;
            break;

        case "ArrowUp":
        case "w":
            player.v.y = -player.speed;
            pressed['up'] = true;
            break;

        case "ArrowDown": 
        case "s":
            player.v.y = player.speed;
            pressed['down'] = true;
            break;
        case "Escape":
            endGame();
            break;
    }
}
function onkeyup(ev) {
    switch (ev.key) {
        case "ArrowLeft": 
        case "a":
            player.v.x = pressed['right']?player.speed:0; 
            pressed['left'] = false;
            break;

        case "ArrowRight": 
        case "d":
            player.v.x = pressed['left']?-player.speed:0; 
            pressed['right'] = false;
            break;

        case "ArrowUp": 
        case "w":
            player.v.y = pressed['down']?player.speed:0; 
            pressed['up'] = false;
            break;

        case "ArrowDown": 
        case "s":
            player.v.y = pressed['up']?-player.speed:0; 
            pressed['down'] = false;
            break;
    }
}

function setupControls() {
    window.addEventListener("keydown", onkeydown);
    window.addEventListener("keyup", onkeyup);
}
// reset the game after loss
function reset() {
    aux = 0;
    monsters.forEach(m => {
        m.remove();
    });
    monsters = [];
    addMonster();
    player.reset();
    coin.random();
    updateCoins(0);
    // resetting record sound for next game
    recordSnd.currentTime = 0;
}

function updateCoins(num) {
    coins = num;
    document.querySelector('#score span').innerHTML = coins;
    // updating high score if surpassed
    if(coins > highScore){
        recordSnd.play();
        document.querySelector('#hiScore span').innerHTML = coins;
        highScore = coins;
    }
}


// resize
window.onresize = () => {
    app.renderer.resize(w, h);
    reset();
}

// Game loop, game start and game ending functions

function gameLoop() {
    player.update();
    coin.update();
    monsters.forEach(c => {
        c.update();
    });
}

function startGame(){
    playerCont++;
    aux = 0;
    if(difficulty == 1){
         w = 544, h=544;
         app = new PIXI.Application({width: w, height: h, antialias:true});
    }else if(difficulty == 2){
         w = 412, h=412;
         app = new PIXI.Application({width: w, height: h, antialias:true});
    }else{
         w = 672, h=672;
         document.getElementById("canvas").style.right = "10em";
         app = new PIXI.Application({width: w, height: h, antialias:true});
    }
    document.getElementById("loadingScreen").classList.add("hidden");
    document.getElementById("gameScreen").style.display = "initial";
    playerName = window.prompt("Tell us your name!", "Player");
     player = new Player(color, 10, {x:0, y:0});
     coin = new Coin(0xF8F160, 10, {x:0, y:0});
    int = setInterval(gameLoop, 1000/60);
    app.renderer.backgroundColor = 0x1A1A17;
    document.querySelector("#canvas").appendChild(app.view);
    setupControls();
    window.onresize();
}

function endGame(){
    // updating player data into the leaderboard
    updtLb();
    clearInterval(int);
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("titleScreen").style.display = "flex"
    document.getElementById("titleScreen").style.alignSelf = "center";
    app.destroy(true);
    // resetting record sound for next game
    recordSnd.currentTime = 0;
}

// Change difficulty function
function changeDif(){
    if(difficulty == 1){
        document.getElementById("switch").innerHTML = "HARD";
        difficulty = 2;
    
    }else if(difficulty == 2){
        document.getElementById("switch").innerHTML = "EASY";
        difficulty = 0;
    }else{
        document.getElementById("switch").innerHTML = "MEDIUM";
        difficulty = 1;
    }
}
// change ball color function
function customize(){
    let el = document.getElementById("ball");
    if(color == 0xfcf8ec){
        color = 0x4ceb34;
        el.style.backgroundColor = "#4ceb34";
    }else if(color == 0x4ceb34){
        color = 0x22e0d7;
        el.style.backgroundColor = "#22e0d7"
    }else if(color == 0x22e0d7){
        color = 0x1673f5;
        el.style.backgroundColor = "#1673f5";
    }else if(color == 0x1673f5){
        color = 0xe119f7;
        el.style.backgroundColor = "#e119f7";
    }else{
        color = 0xfcf8ec;
        el.style.backgroundColor = "#fcf8ec";
    }
}
// leaderboard functions
function updtLb (){
        if(playerCont == 1){
            let ele = document.createElement("div");
            document.getElementById("lbScreen").insertBefore(ele,document.getElementById("lbExit"));
            ele.id = "user"+playerCont;
            ele.innerHTML= playerName+" ------------------------------- "+playerScore;

        }else{
            pos = document.getElementById("lbExit");
            for(let i = 0; i < playerCont; i++){
                let num = i +1 ;
               var rel = document.getElementById("user"+num);
               var  relScore =  scoreArray[i];
               if(playerScore > relScore){
                    pos = rel;
               }
            }
            let ele = document.createElement("div");
            document.getElementById("lbScreen").insertBefore(ele,pos);
            ele.id = "user"+playerCont;
            ele.innerHTML= playerName+" ------------------------------- "+playerScore;
        }
    }

function openLb (){
    document.getElementById("titleScreen").style.display = "none";
    document.getElementById("lbScreen").classList.remove("hidden");
    document.getElementById("lbExit").addEventListener("click",function(){
            document.getElementById("lbScreen").classList.add("hidden");
            document.getElementById("titleScreen").style.display = "flex"
            document.getElementById("titleScreen").style.alignSelf = "center";
        })
}

// global variables
var difficulty = 1;
var color = 0xfcf8ec;
var w = 544, h=544;
var monsters = [];
var pressed = {};
var player;
var coin;
var coins;
var aux = 0;
    // variables for the leaderboard
var playerName;
var playerScore;
var playerCont = 0;
var pos;
var scoreArray = [];
var highScore = 0;
// event listeners
document.getElementById('str').addEventListener("click",loading);
document.getElementById("df").addEventListener("click",changeDif);
document.getElementById("ct").addEventListener("click",customize);
document.getElementById("lb").addEventListener("click",openLb);
//sound effects and music
var coinSnd = new Audio("assets/smw_coin.wav");
var deathSnd = new Audio("assets/wound.wav");
var recordSnd = new Audio("assets/eb_winboss.wav");

// loading screen promise function
function loading(){			
    document.getElementById("titleScreen").style.display = "none";
    document.getElementById("loadingScreen").classList.remove("hidden");
	let bar = document.querySelector(".loadBar");
	let time = 2500;
	let proc = 0;
	var start = null;

	return new Promise((resolve, reject) => {
		function step(timestamp) {
			if (!start) start = timestamp;
			var prog = timestamp - start;
			let pct = ((prog*100)/time) + "%";
			bar.style.width = pct;
				
			if (prog < time) {
				proc = window.requestAnimationFrame(step); 
			} else {
				bar.style.width = "100%";	
				resolve(startGame());				
			}
		}
		proc = window.requestAnimationFrame(step);
	});	
}

// Game over promise function
function gameOver(){
    document.getElementById("main").classList.add("blur");
    document.getElementById("gameOverScreen").classList.remove("hidden");
    let time = 5000;
    let timer = document.getElementById("timer");
    let num = 5;
    timer.innerHTML = num;

    return new Promise((resolve, reject) => {
        let inter = setInterval(function(){
            num = num -1;
            timer.innerHTML = num;
        }, 1000);        
        let timeO = setTimeout(function(){
            clearInterval(inter);
            document.getElementById("main").classList.remove("blur");
            document.getElementById("gameOverScreen").classList.add("hidden");
            reject(endGame());
        },time);

        document.getElementById("yesCont").addEventListener("click",function(){;
            clearInterval(inter);
            clearTimeout(timeO);
            document.getElementById("main").classList.remove("blur");
            document.getElementById("gameOverScreen").classList.add("hidden");
            resolve(reStartGame());
        })
    })
}
function reStartGame(){
    reset();
}