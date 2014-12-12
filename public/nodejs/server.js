// get base url from input on page
// connect to node.js server
// *****this code must be updated on live server*****
// var baseURL = "http://localhost:8888";
var baseURL = "http://p4.alex.me";

// fake score data for testing... should match actual record in database
var fakeScoreData = {
   gameAuthkey : "kKS5tvIMJD88m78xnpzdCCJa2z3tNkXx",
   users : [
      {userAuthkey : "globoxTqk99rbBRMYmLFbfE7WHxu1e0RPy4WnD", kills : 40, assists : 5, deaths : 14, victory : false},
      {userAuthkey : "raymanhPmFNZ3GBx0jD129avf8hpmetfnkYbx7", kills : 56, assists : 12, deaths : 2, victory : true}
   ]
};

// function to send score data to laravel to store in database
// to be used when game has finished... wait for response true before loading results page
function sendScoresToDatabase (scoreData) {
   console.log("sending scores...");
   // build POST request to send to laravel
   var xhr = new XMLHttpRequest();
   xhr.open("POST", baseURL + "/update/results", true);
   xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
 
   // receive response back from the server that results have been posted
   xhr.onreadystatechange = function(){
      console.log(xhr.readyState + " " + xhr.status);
      if (xhr.readyState === 4) {
         if (xhr.status >= 200 && xhr.status < 300) {
            var scoreUpdateStatus = JSON.parse(xhr.responseText);
            console.log(scoreUpdateStatus);           
         }
      }
   };
   
   // send score data as JSON
   xhr.send(JSON.stringify(scoreData));
}

var http = require('http');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var io = require('socket.io');
var url = require('url');

var server = http.createServer(function(request, response){
   
   // read POST requests to build a new game based on request from laravel
   if (request.method == "POST" && request.url == "/build/game/on/server") {
      
      // receive new game data
      request.setEncoding("utf8");
      request.on("data", function(data){
         // ***** use the json data to create a new game object and add to a master games list
         console.log(data);
      });
      
      response.writeHead(200, {"Content-Type" : "text/html"});
      response.end();
   }
   
   console.log("Connected to Node server");
   response.writeHead(200, {"content-type" : "plain-text"});
   response.end();
});

server.listen(8734);
console.log("listening on port 8734");
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




   