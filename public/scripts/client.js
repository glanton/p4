window.onload = function(){
    //=====VARIABLES=====
    
    // holds data sent to the server (keyboard input and player identification)
    var PlayerData = {
      // old: assignedPlayer
      playerID : '',
      
      // key map (37: left, 38: up, 39: right, 40: down)
      keyMap : {
          37 : false,
          38 : false,
          39 : false,
          40 : false
      }
    };
    
    // game constants
    var GameConstants = {
        FRAMES_PER_SPRITE_SHEET: 64, // must be perfect square
        SQUARE_ROOT_FRAMES_PER_SPRITE_SHEET: 8
    }
    
    // holds image and canvas resources
    var GameResources = {
        resourceCount : 0,
        resourceLoadCount : 0,
        spriteSheets : {}
    };
  
 
  
    //=====INIT CODE=====
    
    // connect to node.js server
    // *****this code must be updated on live server*****
    // var socket = io.connect('http://localhost:8734');
    var socket = io.connect('http://104.131.10.181:8734/')
    
    // load ship sprite sheets
    addSpriteSheet("whiteShip", "http://alexfriberg.com/images/Tayak64.png");
    addSpriteSheet("redShip", "http://alexfriberg.com/images/Tayak64Red.png");
    
    // function to add spritesheets as objects with an image, width, and height
    function SpriteSheet (image){
        this.image = image;
        this.width = 0;
        this.height = 0;
    }
    
    // function to add image resources
    function addSpriteSheet (name, source){
        newSpriteSheet = new Image();
        newSpriteSheet.src = source;
        GameResources.spriteSheets[name] = new SpriteSheet(newSpriteSheet)
    }
    
    // get canvas element and set dimensions
    var canvas = document.getElementById("gameBoard");
    canvas.width = 480;
    canvas.height = 320;
    var ctx = canvas.getContext("2d");
    
    // version two of resource loader
    // count total resources to be loaded
    for (var spriteSheetI in GameResources.spriteSheets) {
        if (GameResources.spriteSheets.hasOwnProperty(spriteSheetI)) {
          GameResources.resourceCount++;
        }    
    }
    
    // compare resources loaded with total resources
    for (var spriteSheetK in GameResources.spriteSheets) {
        GameResources.spriteSheets[spriteSheetK].image.onload = checkLoadedResources(spriteSheetK);
    }
    
    function checkLoadedResources(spriteSheetK){
        return function () {
            // record width and height of sprite sheet
            GameResources.spriteSheets[spriteSheetK].width = GameResources.spriteSheets[spriteSheetK].image.width;
            GameResources.spriteSheets[spriteSheetK].height = GameResources.spriteSheets[spriteSheetK].image.height;
            //console.log(GameResources.spriteSheets[spriteSheetK].image.width);
            
            // check if all resources have loaded
            GameResources.resourceLoadCount++;
            if (GameResources.resourceLoadCount == GameResources.resourceCount) {
                socket.emit("join_new_game");
            }
        };
    };
    
    
    
    
    socket.on("assign_player", function(GameData){
        // is this necessary if the client passes a unique ID as part of the join_new_game emit?
        // yes, at least for now this is how we lock out the single game from extra people (if not on waitlist then loop requestUpdate)
        PlayerData.playerID = GameData.currentPlayer;
        console.log('Player assignment: ' + PlayerData.playerID);
        
        if (PlayerData.playerID == 'waiting') {
            console.log('sorry, no available game');
        } else {
            // begin core game loop
            setInterval(requestUpdate, 1000/60);
        }
    });
    

    
    function requestUpdate(){
        detectKeys();
        socket.emit("client_requests_update", PlayerData);
    }
    
    socket.on("server_sends_update", function(GameData){
        renderGame(GameData);
    });
    
    function renderGame (GameData) {
        // clear canvas in preparation for new frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (var i = 0; i < GameData.ships.length; i++){
          renderObject(GameData.ships[i]);
        }
    }

 
   
  //======FUNCTIONS=====
  
  
    //******** review what information is on the server (should be position, rotation... anything else?)
    function renderObject (object) {
        ctx.drawImage(
            GameResources.spriteSheets[object.sprite].image,
            object.xRotationIndex * GameResources.spriteSheets[object.sprite].width / GameConstants.SQUARE_ROOT_FRAMES_PER_SPRITE_SHEET,
            object.yRotationIndex * GameResources.spriteSheets[object.sprite].height / GameConstants.SQUARE_ROOT_FRAMES_PER_SPRITE_SHEET,
            GameResources.spriteSheets[object.sprite].width / GameConstants.SQUARE_ROOT_FRAMES_PER_SPRITE_SHEET,
            GameResources.spriteSheets[object.sprite].height / GameConstants.SQUARE_ROOT_FRAMES_PER_SPRITE_SHEET,
            object.xPos,
            object.yPos,
            GameResources.spriteSheets[object.sprite].width / GameConstants.SQUARE_ROOT_FRAMES_PER_SPRITE_SHEET,
            GameResources.spriteSheets[object.sprite].height / GameConstants.SQUARE_ROOT_FRAMES_PER_SPRITE_SHEET);
     };
  
  function detectKeys () {
    document.onkeydown = function(event){
      if (event.keyCode in PlayerData.keyMap){
        PlayerData.keyMap[event.keyCode] = true;
      }
    };

    document.onkeyup = function(event){
      if (event.keyCode in PlayerData.keyMap){
        PlayerData.keyMap[event.keyCode] = false;
        // console.log(event.keyCode + " up");
      }     
    };
  }
  
}



