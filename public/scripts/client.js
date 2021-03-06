//===== GLOBAL CONSTANTS =====
//****************************

// width and height of playable area
var PLAY_FIELD = {
    width : 960,
    height : 640,
    transition : 25
};


// other than globals run all code on page load
window.onload = function(){
    
    //===== CONSTANTS =====
    //*********************
    
    var SPRITE_DATA = {
        framesPerSheet : 64, // must be perfect square
        framesPerSheetSqRt : 8 // square root of total frames in a sheet
    };
    
    
    
    //=====VARIABLES=====
    //*******************
    
    // get base url
    var baseURL = document.getElementById("baseURL").value;
    
    // connect to node.js server
    // *****this code must be updated on live server*****
    // var socket = io.connect('http://localhost:8734');
    var socket = io.connect('http://104.131.10.181:8734/')
    
    // get particle canvas element and set dimensions
    var particleCanvas = document.getElementById("particleCanvas");
    particleCanvas.width = PLAY_FIELD.width;
    particleCanvas.height = PLAY_FIELD.height;
    var ctxP = particleCanvas.getContext("2d");
    
    // get sprite canvas element and set dimensions
    var spriteCanvas = document.getElementById("spriteCanvas");
    spriteCanvas.width = PLAY_FIELD.width;
    spriteCanvas.height = PLAY_FIELD.height;
    var ctxS = spriteCanvas.getContext("2d");
    
    // get text canvas element and set dimensions
    var textCanvas = document.getElementById("textCanvas");
    textCanvas.width = PLAY_FIELD.width;
    textCanvas.height = PLAY_FIELD.height;
    var ctxT = textCanvas.getContext("2d");
    
    // get authkeys from hidden inputs
    var userAuthkeyInput = document.getElementById("userAuthkey").value;
    var gameAuthkeyInput = document.getElementById("gameAuthkey").value;
    
    // variable to store user data to be sent to server (keyboard inputs and game/player authentication)
    var userData = {
        // user and game authkeys
        userAuthkey : userAuthkeyInput,
        gameAuthkey : gameAuthkeyInput,
        
        // key map (37: left, 38: up, 39: right, 40: down, 90: z)
        keyMap : {
            37 : false,
            38 : false,
            39 : false,
            40 : false,
            90 : false
        }
    };
    
    // holds image and canvas resources
    var gameResources = {
        resourceCount : 0,
        resourceLoadCount : 0,
        spriteSheets : {}
    };
  
  
  
    //===== CONSTRUCTOR FUNCTIONS =====
    //**********************************
    
    // constructor function to build a new sprite sheet image
    function SpriteSheet (image) {
        
        this.image = image;
        this.width = 0;
        this.height = 0;
    }
    
     
 
    //===== FUNCTIONS =====
    //*********************
 
    // function to add image resources
    function addSpriteSheet (name, source){
        
        newSpriteSheet = new Image();
        newSpriteSheet.src = source;
        gameResources.spriteSheets[name] = new SpriteSheet(newSpriteSheet)
    }
    
    
    // function to request update from server and send current keyboard inputs
    function requestUpdate(){
        
        detectKeys();
        socket.emit("client_requests_update", userData);
    }
    
    
    // function to detect and capture key input
    function detectKeys () {
        document.onkeydown = function(event){
            if (event.keyCode in userData.keyMap){
                
                // prevent default arrow key scrolling (among other defaults)
                event.preventDefault();
                userData.keyMap[event.keyCode] = true;
            }
        };
    
        document.onkeyup = function(event){
            if (event.keyCode in userData.keyMap){
                
                userData.keyMap[event.keyCode] = false;
                // console.log(event.keyCode + " up");
            }     
        };
    }
  
  
    // function to clear canvas re-render all graphical objects
    function renderGame (gameData) {
        
        // clear particle, sprite, and text canvas in preparation for new frame
        ctxP.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        ctxS.clearRect(0, 0, spriteCanvas.width, spriteCanvas.height);
        ctxT.clearRect(0, 0, textCanvas.width, textCanvas.height);
        
        // render each ship and its weapons
        for (var i = 0; i < gameData.ships.length; i++) {
        
            // only render ship and engine trail if status is living
            if (gameData.ships[i].status === "living") {
                
                renderObject(gameData.ships[i]);
                renderEngineTrail(gameData.ships[i]);
            }
            
            // always render weapons (which persist even after ship death)
            renderPrimaryWeapon(gameData.ships[i]);
            
            // render current scores
            renderScores(gameData.ships[i], i);
        }
        
        // blend particle canvas
        ctxP.globalCompositeOperation = "lighter";
        
    }
    
  
    // function to render ships and other graphical objects
    function renderObject (object) {
        
        // calculate width and height of a single frame of the sprite sheet
        var frameWidth = gameResources.spriteSheets[object.sprite].width / SPRITE_DATA.framesPerSheetSqRt;
        var frameHeight = gameResources.spriteSheets[object.sprite].height / SPRITE_DATA.framesPerSheetSqRt;
        
        ctxS.drawImage(
            gameResources.spriteSheets[object.sprite].image,
            object.xRotationIndex * frameWidth,
            object.yRotationIndex * frameHeight,
            frameWidth,
            frameHeight,
            object.xPos - (frameWidth / 2),
            object.yPos - (frameHeight / 2),
            frameWidth,
            frameHeight);
    }
     
     
    // function to render ship's engine trail based on historical points
    function renderEngineTrail (object) {
            
        // control how many historical points are used
        var points = object.history.slice(0, 50);
        
        // loop through points
        for (var i = 0; i < points.length; i++) {
            
            // get current point
            var point = points[i];
            
            // set size of trail according to ship speed and location in trail; set to zero if less than zero
            var size = object.speed - (object.speed * i/49);
            if (size < 0) {
                
                size = 0;
            }
            
            // adjust offset for where trail starts from ship sprite; hardcoding offset for now--may need to adjust later to accomodate different sprites!
            var xSpriteOffset = Math.sin(point.rotation * (Math.PI/180)) * 20;
            var ySpriteOffset = Math.cos(point.rotation * (Math.PI/180)) * -20;
            point.xPos = point.xPos - xSpriteOffset;
            point.yPos = point.yPos - ySpriteOffset;
                
            // set random distribution of trail
            var randomOffset = (Math.random() * 8) - 4;
            var xAdjusted = point.xPos + randomOffset;
            var yAdjusted = point.yPos + randomOffset;
            
            // set opacity of trail accorindation to location in trail
            var opacity = (1.5 - i/50).toFixed(2);
            
            // begin rendering
            ctxP.beginPath();
            
            // establish gradient
            var gradient = ctxP.createRadialGradient(point.xPos, point.yPos, 0, point.xPos, point.yPos, size);
            gradient.addColorStop(0, "rgba(255, 255, 255, " + opacity + ")");
            gradient.addColorStop(0.5, "rgba(255, 255, 255, " + opacity + ")");
            gradient.addColorStop(0.7, "rgba(100, 200, 255, " + (opacity * 0.8) + ")");
            gradient.addColorStop(1, "rgba(150, 20, 255, " + (opacity * 0.4) + ")");
            
            // render trail
            ctxP.fillStyle = gradient;
            ctxP.arc(xAdjusted, yAdjusted, size, Math.PI * 2, false);
            ctxP.fill();
        }
    }
     
     
    // function to render ships' primary weapons
    function renderPrimaryWeapon (object) {
        
        // get array pf primary weapon projectiles
        var projectiles = object.primaryWeapon.projectiles;
        
        // loop through projectiles
        for (var i = 0; i < projectiles.length; i++) {
            
            // get current projectile
            var projectile = projectiles[i];
            
            // set line endpoint
            var xLineOffset = Math.sin(projectile.rotation * (Math.PI/180)) * 5;
            var yLineOffset = Math.cos(projectile.rotation * (Math.PI/180)) * -5;
            var xPosLineEnd = projectile.xPos - xLineOffset;
            var yPosLineEnd = projectile.yPos - yLineOffset;
            
            // set opacity
            var opacity = 1.5 - (projectile.life / object.primaryWeapon.lifespan);
            
            // begin rendering
            ctxP.beginPath();
            
            // render projectile
            ctxP.strokeStyle = "rgba(255, 255, 100, " + opacity +")";
            ctxP.lineWidth = 2;
            ctxP.moveTo(projectile.xPos, projectile.yPos);
            ctxP.lineTo(xPosLineEnd, yPosLineEnd);
            // ctxP.arc(projectile.xPos, projectile.yPos, 2, Math.PI * 2, false);
            ctxP.stroke();
        }
    }
    
    
    // function to render current scores of all active players
    function renderScores (shipObject, shipIndex) {
        
        // get ship player name and score
        var name = shipObject.name;
        var score = shipObject.kills + " | " + shipObject.assists + " | " + shipObject.deaths;
        
        // adjust render location according to which player it is
        // player one
        if (shipIndex === 0) {
        
            // render player one score
            renderScore(name, score, 10, 20, 11, 40);
        
        // player two
        } else if (shipIndex === 1) {
            
            // calculate length of player two name and score
            var nameLength = calculateTextLength(name, "name");
            var scoreLength = calculateTextLength(score, "score");
            
            // adjust coordinates of player two name and score
            var xPosName = PLAY_FIELD.width - nameLength - 10;
            var yPosName = PLAY_FIELD.height - 10;
            var xPosScore = PLAY_FIELD.width - scoreLength - 11;
            var yPosScore = yPosName - 22;
            
            renderScore(name, score, xPosName, yPosName, xPosScore, yPosScore);
            
        // player three
        } else if (shipIndex === 2) {
            
            // adjust coordinates of player three name and score
            var yPosName = PLAY_FIELD.height - 10;
            var yPosScore = yPosName - 22;
            
            renderScore(name, score, 10, yPosName, 11, yPosScore);
        
        // player four
        } else if (shipIndex === 3) {
            
            // calculate length of player two name and score
            var nameLength = calculateTextLength(name, "name");
            var scoreLength = calculateTextLength(score, "score");
            
            // adjust coordinates of player two name and score
            var xPosName = PLAY_FIELD.width - nameLength - 10;
            var xPosScore = PLAY_FIELD.width - scoreLength - 11;
            
            renderScore(name, score, xPosName, 20, xPosScore, 40)
        }
        
        
        //===== FUNCTIONS FOR renderScores =====        
        // function to check length of player's name
        function calculateTextLength (text, type) {
            
            // check text type and set respective font
            if (type === "name") {
                ctxT.font = "18px Arial";  
            } else if (type === "score") {
                ctxT.font = "12px Arial";
            }
            
            return ctxT.measureText(text).width;
        }
        
        
        // function to render a single player's scores
        function renderScore (name, score, xPosName, yPosName, xPosScore, yPosScore) {
            
           // render player name
            ctxT.font = "18px Arial";
            ctxT.fillStyle = "white";
            ctxT.fillText(name, xPosName, yPosName);
            
            // render player score
            ctxT.font = "12px Arial";
            ctxT.fillStyle = "gray";
            ctxT.fillText(score, xPosScore, yPosScore); 
        }
    }
    
    
    // render game over text
    function renderGameOverText () {
        
        ctxT.clearRect(0, 0, textCanvas.width, textCanvas.height);
        
        ctxT.font = "100px Arial";
        ctxT.fillStyle = "white";
        ctxT.fillText("Game Over", 210, 280);
        
        ctxT.font = "40px Arial";
        ctxT.fillStyle = "#999999";
        ctxT.fillText("...loading results", 370, 330);
        
    }
  
  
    //=====INIT CODE=====
    //*******************
    
    // load ship sprite sheets
    addSpriteSheet("whiteShip", "../images/Tayak64.png");
    addSpriteSheet("redShip", "../images/Tayak64Red.png");
    addSpriteSheet("greyShip", "../images/Tayak64Grey.png");
    addSpriteSheet("coralShip", "../images/Tayak64Coral.png");
    
    // version two of resource loader
    // count total resources to be loaded
    for (var spriteSheetI in gameResources.spriteSheets) {
        if (gameResources.spriteSheets.hasOwnProperty(spriteSheetI)) {
          gameResources.resourceCount += 1;
        }    
    }
    
    // compare resources loaded with total resources
    for (var spriteSheetK in gameResources.spriteSheets) {
        gameResources.spriteSheets[spriteSheetK].image.onload = checkLoadedResources(spriteSheetK);
    }
    
    function checkLoadedResources(spriteSheetK){
        return function () {
            // record width and height of sprite sheet
            gameResources.spriteSheets[spriteSheetK].width = gameResources.spriteSheets[spriteSheetK].image.width;
            gameResources.spriteSheets[spriteSheetK].height = gameResources.spriteSheets[spriteSheetK].image.height;
            //console.log(gameResources.spriteSheets[spriteSheetK].image.width);
            
            // check if all resources have loaded
            gameResources.resourceLoadCount++;
            if (gameResources.resourceLoadCount == gameResources.resourceCount) {
                socket.emit("client_requests_ready_state", userData);
            }
        };
    };
    
    
    
    //===== WEBSOCKETS =====
    //**********************
    
    // receive game ready state; when ready begin regular game loop
    socket.on("server_sends_ready_state", function(gameReady){
        
        if (gameReady) {
            
            setInterval(requestUpdate, 1000/60);
        }
    });
    
    
    // render game upon receiving game data from server
    socket.on("server_sends_update", function(gameData){
        
        renderGame(gameData);
    });
    
    
    // render gamer over text upon receiving victory response from server
    socket.on("server_sends_victory", function(){
        
        renderGameOverText();
    });
    
    
    // redirect to results page upon receiving complete response from server
    socket.on("server_sends_complete", function(interfaceId){
       
        // redirect to results page after 5 seconds
        setTimeout(function(){
            
            window.location.replace(baseURL + "/results/" + interfaceId);
        }, 5000);
    });
}
