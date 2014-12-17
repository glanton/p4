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
    
    // get canvas element and set dimensions
    var canvas = document.getElementById("gameBoard");
    canvas.width = 960;
    canvas.height = 640;
    var ctx = canvas.getContext("2d");
    
    // get authkeys from hidden inputs
    var userAuthkeyInput = document.getElementById("userAuthkey").value;
    var gameAuthkeyInput = document.getElementById("gameAuthkey").value;
    
    // variable to store user data to be sent to server (keyboard inputs and game/player authentication)
    var userData = {
        // user and game authkeys
        userAuthkey : userAuthkeyInput,
        gameAuthkey : gameAuthkeyInput,
        
        // key map (37: left, 38: up, 39: right, 40: down)
      keyMap : {
          37 : false,
          38 : false,
          39 : false,
          40 : false
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
        
        // clear canvas in preparation for new frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // render each ship
        for (var i = 0; i < gameData.ships.length; i++) {
            
          renderObject(gameData.ships[i]);
        }
    }
    
  
    // function to render ships and other graphical objects
    function renderObject (object) {
        
        // calculate width and height of a single frame of the sprite sheet
        var frameWidth = gameResources.spriteSheets[object.sprite].width / SPRITE_DATA.framesPerSheetSqRt;
        var frameHeight = gameResources.spriteSheets[object.sprite].height / SPRITE_DATA.framesPerSheetSqRt;
        
        ctx.drawImage(
            gameResources.spriteSheets[object.sprite].image,
            object.xRotationIndex * frameWidth,
            object.yRotationIndex * frameHeight,
            frameWidth,
            frameHeight,
            object.xPos - (frameWidth / 2),
            object.yPos - (frameHeight / 2),
            frameWidth,
            frameHeight);
     };
  
  
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



