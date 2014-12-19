window.onload = function(){
    
    //===== CONSTANTS =====
    //*********************
    
    var SPRITE_DATA = {
       framesPerSheet : 64, // must be perfect square
       framesPerSheetSqRt : 8 // square root of total frames in a sheet
    };
    
    
    
    //=====VARIABLES=====
    //*******************
    
    // connect to node.js server
    // *****this code must be updated on live server*****
    var socket = io.connect('http://localhost:8734');
    // var socket = io.connect('http://104.131.10.181:8734/')
    
    // get particle canvas element and set dimensions
    var particleCanvas = document.getElementById("particleCanvas");
    particleCanvas.width = 960;
    particleCanvas.height = 640;
    var ctxP = particleCanvas.getContext("2d");
    
    // get sprite canvas element and set dimensions
    var spriteCanvas = document.getElementById("spriteCanvas");
    spriteCanvas.width = 960;
    spriteCanvas.height = 640;
    var ctxS = spriteCanvas.getContext("2d");
    
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
    function SpriteSheet (image){
        
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
        
        // clear particle and sprite canvas in preparation for new frame
        ctxP.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        ctxS.clearRect(0, 0, spriteCanvas.width, spriteCanvas.height);
        
        // render each ship and its weapons
        for (var i = 0; i < gameData.ships.length; i++) {
        
            // only render ship and engine trail if status is living
            if (gameData.ships[i].status === "living") {
                
                renderObject(gameData.ships[i]);
                renderEngineTrail(gameData.ships[i]);
            }
            
            // always render weapons (which persist even after ship death)
            renderPrimaryWeapon(gameData.ships[i]);
        }
        
        // blend particle canvas
        ctxP.globalCompositeOperation = "lighter";
        
        // debug text *&^*&^*&^*&^* DELETE WHEN COMPLETE *&*&^@#@)#*
        renderDebugText(gameData.ships[0]);
    }
    
    // ##%#%#%$& DEBUG FUNCTION ##*&#*&^*&@#$*&#$
    function renderDebugText (object) {
        
        ctxS.font = "20px Arial";
        ctxS.fillStyle = "white";
        ctxS.fillText("xPos: " + object.xPos, 50, 50);
        ctxS.fillText("yPos: " + object.yPos, 50, 80);
        ctxS.fillText("speed: " + object.speed, 50, 110);
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
}



