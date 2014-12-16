// get base url from input on page
// connect to node.js server
// *****this code must be updated on live server*****
var baseURL = "http://localhost:8888";
// var baseURL = "http://p4.alex.me";

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



//===== CONSTANTS =====
//*********************

// constant that controls ship sprite used and ship's starting location/rotation
var SHIP_STARTING_DATA = [
   { sprite : "whiteShip", xPos : 100, yPos : 100, rotation : 0 },
   { sprite : "redShip", xPos : 200, yPos : 200, rotation : 0 },
   { sprite : "greyShip", xPos : 100, yPos : 200, rotation : 0 },
   { sprite : "coralShip", xPos : 200, yPos : 100, rotation : 0 }
];

var SPRITE_DATA = {
   framesPerSheet : 64, // must be perfect square
   framesPerSheetSqRt : 8 // square root of total frames in a sheet
};



//===== VARIABLES =====
//*********************

// connection-related variables follow
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
         
         // use the json data to create a new game object and add to a master games list
         var newGame = new Game(JSON.parse(data));
         gamesList[newGame.authkey] = newGame;
         console.log(gamesList);
         
         // build new game starting state
         buildNewGame(gamesList[newGame.authkey]);
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

// establish object to hold all active games and their information (game connection info, player info, and game state info)
var gamesList = {};
  


//===== CONSTRUCTOR FUNCTIONS =====
//**********************************

// constructor function for building a new game within the active games lists
function Game (data) {
   
   this.authkey = data.gameAuthkey;
   this.interfaceId = data.gameInterfaceId;
   this.users = data.users;
}

// constructor function for building a new ship (also contains method for updating ship in game)
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
   var sequentialFrameIndex = parseInt(this.rotation / (360 / SPRITE_DATA.framesPerSheet));
   this.xRotationIndex = sequentialFrameIndex % SPRITE_DATA.framesPerSheetSqRt;
   this.yRotationIndex = parseInt(sequentialFrameIndex / SPRITE_DATA.framesPerSheetSqRt);
 
   // update position of ship based on speed and rotation
   if (this.speed > 0) {
      this.xPos = this.xPos + (Math.sin(this.rotation * (Math.PI/180)) * this.speed);
      this.yPos = this.yPos + (Math.cos(this.rotation * (Math.PI/180)) * -this.speed);
   }
  };

}



//===== FUNCTIONS =====
//*********************

// build new game when start game request first received from laravel
function buildNewGame (newGame) {
   
   // add game data object to new game object and add ships array to data object
   newGame.data = {};
   newGame.data.ships = [];
   
   // assign ship to each user
   for (var i = 0; i < newGame.users.length; i++) {
      
      newGame.data.ships[i] = new Ship(newGame.users[i].username, SHIP_STARTING_DATA[i].sprite, SHIP_STARTING_DATA[i].xPos, SHIP_STARTING_DATA[i].yPos, SHIP_STARTING_DATA[i].rotation, 0, 0.1)
   }
}


// function to authenticate user data requests to the server
function authenticateUser (userData) {

   // object to be returned with game and user information
   var clientRequest = {};
 
   // check game authkey against the active games lists
   if (gamesList[userData.gameAuthkey]) {
      
      // set game variable for further operations
      clientRequest.game = gamesList[userData.gameAuthkey];
       
      // check user authkeys against the game's user list
      for (var i = 0; i < clientRequest.game.users.length; i++) {
        
         if (clientRequest.game.users[i].userAuthkey === userData.userAuthkey) {
            
            // set user variable for further operations
            clientRequest.user = clientRequest.game.users[i];
               
            // game authenticate; proceed
            // console.log ("User " + clientRequest.user.username + " (" + clientRequest.user.userAuthkey + ") authenticated in game " + clientRequest.game.authkey);
      
            // return authenticated information associated with this client
            return clientRequest;
         } 
      }
      
      // if none of the users match return false
      return false;
   } else {
 
      return false;
   }
}


//===== WEBSOCKETS =====
//**********************

ioServer.sockets.on("connection", function(socket){
   
   // will become the ready function when interface is added for each player to ready... in the meantime just authenticates and returns data
   socket.on("client_requests_ready_state", function(userData) {
      console.log("attempted connection by user authkey " + userData.userAuthkey);
      
      // authenticate use and return clientRequest containing game and user objects; otherwise return false
      var clientRequest = authenticateUser(userData);
      
      // if game and user authenticated
      if (clientRequest) {
         
         // eventually make this a check to see if all users are ready and if so set to true (for now only set to true)
         var readyState = true;
         
         socket.emit('server_sends_ready_state', readyState);  
      }
   });
   
   
   socket.on('client_requests_update', function(userData){
      
      // authenticate use and return clientRequest containing game and user objects; otherwise return false
      var clientRequest = authenticateUser(userData);
      
      // if game and user authenticated
      if (clientRequest) {
         
         // search through ships to find user's ship
         for (var i = 0; i < clientRequest.game.data.ships.length; i++) {
            
            if (clientRequest.game.data.ships[i].name === clientRequest.user.username) {
               
               // save user's ship for easy access
               var userShip = clientRequest.game.data.ships[i];
            }
         }
         
         // rotate user ship counter-clockwise
         if (userData.keyMap[37]) {
            
            rotateObject(userShip, -6);
         }
         
         // accelerate user ship
         if (userData.keyMap[38]) {
            
            accelerateObject(userShip);
         }
         
         // rotate user ship clockwise
         if (userData.keyMap[39]) {
            
            rotateObject(userShip, 6);
         }
         
         // deccelerate user ship
         if (userData.keyMap[40]) {
            
            deccelerateObject(userShip);
         }
         
         // run complete update of all game objects
         updateGame(clientRequest.game);
      
         socket.emit('server_sends_update', clientRequest.game.data);
      }   
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
    
    function updateGame (game) {
      for (var i = 0; i < game.data.ships.length; i++){
        game.data.ships[i].update();
      }
    }
});




   