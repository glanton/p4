var http = require('http');
var io = require('socket.io');

var server = http.createServer(function(request, response){
   console.log('Connected to Node server');
   response.writeHead(200, {'content-type': 'plain-text'});
   response.end();
});

server.listen(8734);
console.log('listening on port 8734');
var ioServer = io.listen(server);

// create empty player list when server starts
var playerList = [];

// holds current state of game including ships, weapons, and score... everything needed to render a frame
var GameData = {
  ships : [],
  currentPlayer : ""
};
  
// game constants
var GameConstants = {
   FRAMES_PER_SPRITE_SHEET: 64, // must be perfect square
   SQUARE_ROOT_FRAMES_PER_SPRITE_SHEET: 8
}


ioServer.sockets.on("connection", function(socket){
   
   socket.on("join_new_game", function() {
      console.log('in - ' + playerList.length);
      
      GameData.currentPlayer = "";
   
      // if player list empty assign player one to first connection
      if (playerList.length == 0) {
         playerList[0] = 'playerOne';
         GameData.currentPlayer = playerList[0];
         
         // create player one ship
         GameData.ships[0] = new Ship("playerOneShip", "whiteShip", 100, 100, 0, 0, 0.1);
         
      // if player list has one player assign player two to second connection
      } else if (playerList.length == 1) {
         playerList[1] = 'playerTwo';
         GameData.currentPlayer = playerList[1];
         
         // create player two ship
         GameData.ships[1] = new Ship("playerTwoShip", "redShip", 200, 200, 45, 0.2, 0.1);
         
      // if player list has two players assign waiting code to all other connections
      } else {
         GameData.currentPlayer = 'waiting';
      }
      
      socket.emit('assign_player', GameData);
       
   });
   
   socket.on("client_sends_sprite_data", function(NewGameData){
      //GameData = SentGameData;
      console.log(NewGameData);
   });
   
   socket.on('client_requests_update', function(PlayerData){
      // adjust player directions based on sent player data
      if (PlayerData.playerID == 'playerOne') {
         
          if (PlayerData.keyMap[37]){
               // rotate left
               //console.log("37: " + keyMap[37]);
               rotateObject(GameData.ships[0], -6);
          }
          
          if (PlayerData.keyMap[38]){
               // accelerate
               //console.log("38: " + keyMap[38]);
               accelerateObject(GameData.ships[0]);
          }
      
          if (PlayerData.keyMap[39]){
               // rotate right
               //console.log("39: " + keyMap[39]);
               rotateObject(GameData.ships[0], 6);
          }
          
          if (PlayerData.keyMap[40]){
               // deccelerate
               //console.log("40: " + keyMap[40]);
               deccelerateObject(GameData.ships[0]);
          }
         
      } else if (PlayerData.playerID == 'playerTwo') {
         
          if (PlayerData.keyMap[37]){
               // rotate left
               //console.log("37: " + keyMap[37]);
               rotateObject(GameData.ships[1], -6);
          }
          
          if (PlayerData.keyMap[38]){
               // accelerate
               //console.log("38: " + keyMap[38]);
               accelerateObject(GameData.ships[1]);
          }
      
          if (PlayerData.keyMap[39]){
               // rotate right
               //console.log("39: " + keyMap[39]);
               rotateObject(GameData.ships[1], 6);
          }
          
          if (PlayerData.keyMap[40]){
               // deccelerate
               //console.log("40: " + keyMap[40]);
               deccelerateObject(GameData.ships[1]);
          }
         
      }
      
      updateGame();
      
      socket.emit('server_sends_update', GameData);
   });
   
   
   
   // *****FUNCTIONS*****
   
   function accelerateObject (object) {
         object.speed = object.speed + object.acceleration;
    }
  
    function deccelerateObject (object) {
         if (object.speed > 0) {
           object.speed = object.speed - object.acceleration;
         }
    }
    
    function rotateObject (object, degreeChange) {
         var newOrient = object.rotation + degreeChange;
     
         // if the new degree of orientation falls outside normal bounds (0-360)
         if (newOrient < 0){
           newOrient = newOrient + 360;
         } else if (newOrient >= 360){
           newOrient = newOrient - 360;
         }
         
         object.rotation = newOrient;
         // console.log(object.rotation);
    }
    
    function updateGame () {
      for (var i = 0; i < GameData.ships.length; i++){
        GameData.ships[i].update();
      }
    }
   
   
     //=====CONSTRUCTOR FUNCTIONS=====
  
      function Ship (name, sprite, xPos, yPos, rotation, speed, acceleration) {
         this.name = name;
         this.sprite = sprite;
         this.xPos = xPos;
         this.yPos = yPos;
         this.rotation = rotation;
         this.xRotationIndex = 0;
         this.yRotationIndex = 0;
         this.speed = speed;
         this.acceleration = acceleration;
    
      this.update = function () {
         // update sprite of ship based on rotation
         var sequentialFrameIndex = parseInt(this.rotation / (360 / GameConstants.FRAMES_PER_SPRITE_SHEET));
         this.xRotationIndex = sequentialFrameIndex % GameConstants.SQUARE_ROOT_FRAMES_PER_SPRITE_SHEET;
         this.yRotationIndex = parseInt(sequentialFrameIndex / GameConstants.SQUARE_ROOT_FRAMES_PER_SPRITE_SHEET);
       
         // update position of ship based on speed and rotation
         if (this.speed > 0) {
            this.xPos = this.xPos + (Math.sin(this.rotation * (Math.PI/180)) * this.speed);
            this.yPos = this.yPos + (Math.cos(this.rotation * (Math.PI/180)) * -this.speed);
         }
        };
    
      }
});




   