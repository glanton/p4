// get base url from input on page
// connect to node.js server
// *****this code must be updated on live server*****
// var baseURL = "http://localhost:8888";
var baseURL = "http://p4.alexf.me";



//===== CONSTANTS =====
//*********************

// width and height of playable area
var PLAY_FIELD = {
   width : 960,
   height : 640,
   transition : 25
};

// constant that controls ship sprite used and ship's starting location/rotation
var SHIP_STARTING_DATA = [
   { sprite : "whiteShip", xPos : 100, yPos : 100, rotation : 120 },
   { sprite : "redShip", xPos : PLAY_FIELD.width - 100, yPos : PLAY_FIELD.height - 100, rotation : 300 },
   { sprite : "greyShip", xPos : 100, yPos : PLAY_FIELD.height - 100, rotation : 60 },
   { sprite : "coralShip", xPos : PLAY_FIELD.width - 100, yPos : 100, rotation : 240 }
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
   if (request.method === "POST" && request.url === "/build/game/on/server") {
      
      // receive new game data
      request.setEncoding("utf8");
      request.on("data", function(data){
         
         // use the json data to create a new game object and add to a master games list
         var newGame = new Game(JSON.parse(data));
         gamesList[newGame.authkey] = newGame;
         
         console.log(gamesList);
         
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
   
   // build data from laravel
   this.authkey = data.gameAuthkey;
   this.interfaceId = data.gameInterfaceId;
   this.users = data.users;
   
   // track game's status (will change when victory conditions met)
   this.status = "active";
   
   // add game data object to new game object and add ships array to data object
   this.data = {};
   this.data.ships = [];
   
   // populate ships array by assigning a ship to each user
   for (var i = 0; i < this.users.length; i++) {
      
      this.data.ships[i] = new Ship(this.users[i].username, "ship", SHIP_STARTING_DATA[i].sprite, SHIP_STARTING_DATA[i].xPos, SHIP_STARTING_DATA[i].yPos, SHIP_STARTING_DATA[i].rotation, 0, 0.1);
   }
   
   // used to mark a game object for deletion
   this.deletionScheduled = false;
}


// constructor function for building a new ship (also contains method for updating ship in game)
function Ship (name, type, sprite, xPos, yPos, rotation, speed, acceleration) {
   
   this.name = name;
   this.type = type;
   this.sprite = sprite;
   this.xPos = xPos;
   this.yPos = yPos;
   this.rotation = rotation;
   this.xRotationIndex = 0;
   this.yRotationIndex = 0;
   this.speed = speed;
   this.acceleration = acceleration;
   
   // life, death, and spawning properties
   this.health = 100;
   this.status = "living";
   this.respawnCount = 0;
   
   // contains history of ship's last locations in an array
   this.history = [];
   
   // contains information about ship's primary weapon
   this.primaryWeapon = {
      type : "weapon",
      damage : 5,
      speed : 8,
      rate : 6,
      cooldown : 0,
      lifespan : 30,
      projectiles : []
   };
   
   // contains score information -- when game finishes is transferred to user objects to pass to database
   this.kills = 0;
   this.assists = 0;
   this.deaths = 0;
   this.victory = false;
   
   // contains history of damage done by enemies to current ship; used to calculate assists
   this.damageHistory = {};
   
   // flag to confirm that users have received redirect; complete complete
   this.receivedComplete = false;
}


// constructor function for building projectiles fired from a ship
function Projectile (ship, xOffset, yOffset) {
   
   this.xPos = ship.xPos;
   this.yPos = ship.yPos;
   this.rotation = ship.rotation;
   this.speed = ship.primaryWeapon.speed + ship.speed;
   this.life = 0;
   
   // set xPos, accounting for xOffset, if applicable
   if (xOffset) {
      
      var xOffsetX = Math.sin((this.rotation + 90) * (Math.PI/180)) * xOffset;
      var xOffsetY = Math.cos((this.rotation + 90) * (Math.PI/180)) * -xOffset;
      
      this.xPos = this.xPos + xOffsetX;
      this.yPos = this.yPos + xOffsetY;
   }
   
   // set yPos, accounting for yOffset, if applicable
   if (yOffset) {
      
      var yOffsetX = Math.sin(this.rotation * (Math.PI/180)) * yOffset;
      var yOffsetY = Math.cos(this.rotation * (Math.PI/180)) * -yOffset;
      
      this.xPos = this.xPos + yOffsetX;
      this.yPos = this.yPos + yOffsetY;
   }
}



//===== FUNCTIONS =====
//*********************

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


// function to send score data to laravel to store in database
// to be used when game has finished... wait for response true before loading results page
function sendScoresToDatabase (game) {
   
   // build score data object
   var scoreData = buildScoreData(game);
   
   console.log("sending scores for game " + game.interfaceId);
   
   // build POST request to send to laravel
   var xhr = new XMLHttpRequest();
   xhr.open("POST", baseURL + "/update/results", true);
   xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
 
   // receive response back from the server that results have been posted
   xhr.onreadystatechange = function(){
      
      console.log(xhr.readyState + " " + xhr.status);
      
      // check for positive response and then adjust game status to redirect back to results
      if (xhr.readyState === 4) {
         
         if (xhr.status >= 200 && xhr.status < 300) {
            
            // receive laravel response in JSON format (object contains single boolean property: updateResults)
            var scoreUpdateStatus = JSON.parse(xhr.responseText);
            console.log(scoreUpdateStatus);
            
            // set game status to complete (this will trigger the redirect)
            if (scoreUpdateStatus.resultsProcessed) {
               
               game.status = "complete";
            }
         }
      }
   };
   
   console.log(scoreData);
   
   // send score data as JSON
   xhr.send(JSON.stringify(scoreData));
   
   
   //===== FUNCTIONS FOR sendScoresToDatabase =====
   // function to build correctly structured score data object
   function buildScoreData (game) {
      
      // initialize score data object and set up structure
      var scoreData = {};
      scoreData.gameAuthkey = game.authkey;
      scoreData.users = [];
      
      // loop through ships and save score data to users property
      for (var i = 0; i < game.data.ships.length; i++) {
         
         // loop through users to match with ships
         for (var k = 0; k < game.users.length; k++) {
            
            // check for match
            if (game.data.ships[i].name === game.users[k].username) {
               
               // add ship data to user object
               scoreData.users[i] = {};
               scoreData.users[i].userAuthkey = game.users[k].userAuthkey;
               scoreData.users[i].kills = game.data.ships[i].kills;
               scoreData.users[i].assists = game.data.ships[i].assists;
               scoreData.users[i].deaths = game.data.ships[i].deaths;
               scoreData.users[i].victory = game.data.ships[i].victory;
            }
         }
      }
      
      return scoreData;
   }
}


// update all game objects (currently just ships and weapons)
function updateGame (game) {
   
   // update statuses, ships and weapons
   for (var i = 0; i < game.data.ships.length; i++){
      
      controlShipStatus(game.data.ships[i]);
      updateShip(game.data.ships[i]);
      updateWeapon(game.data.ships[i].primaryWeapon, i, game.data.ships); 
   }
}


// function to control status of a ship (this function maps out the lifecycle conditions of a ship from living to dying to respawning)
function controlShipStatus (shipObject) {
   
   // if ship status is living
   if (shipObject.status === "living") {
      
      // if ship's health reaches zero, change status to dead
      if (shipObject.health <= 0) {
         
         // set status to dead and respawn count to five seconds
         shipObject.status = "dead";
         shipObject.respawnCount = 300;
      }

   // if ship status is dead
   } else if (shipObject.status === "dead") {
      
      // if ship's respawn not at zero, count down
      if (shipObject.respawnCount > 0) {
         
         // decrement respawn count by one
         shipObject.respawnCount -= 1;
         
      // if ship's respawn count reaches zero, change status to spawning   
      } else if (shipObject.respawnCount <= 0) {
         
         // set status to spawning
         shipObject.status = "spawning";
      }

   // if ship status is spawning
   } else if (shipObject.status === "spawning") {
      
      // set status to living
      shipObject.status = "living";
      
      // reset ship
      resetShip(shipObject);
   }
}


// function to reset ship when respawning
function resetShip (shipObject) {
   
   shipObject.xPos = Math.random() * PLAY_FIELD.width;
   shipObject.yPos = Math.random() * PLAY_FIELD.height;
   shipObject.rotation = Math.random() * 360;
   shipObject.speed = 0;   
   shipObject.health = 100;
   
   // reset ship's history
   this.history = [];
   
   // reset ship's damage history
   this.damageHistory = [];
}


// function to move object (ship or weapon)
function moveObject (object) {
   
   // update position of object based on speed and rotation
   if (object.speed > 0) {
      
      object.xPos = object.xPos + (Math.sin(object.rotation * (Math.PI/180)) * object.speed);
      object.yPos = object.yPos + (Math.cos(object.rotation * (Math.PI/180)) * -object.speed);
   }
   
   // check object position against game field bounds and warp if necessary
   // x check
   if (object.xPos < (0 - PLAY_FIELD.transition)) {
      
      object.xPos = PLAY_FIELD.width + PLAY_FIELD.transition;
   } else if (object.xPos > (PLAY_FIELD.width + PLAY_FIELD.transition)) {
      
      object.xPos = 0 - PLAY_FIELD.transition;
   }
   
   // y check
   if (object.yPos < (0 - PLAY_FIELD.transition)) {
      
      object.yPos = PLAY_FIELD.height + PLAY_FIELD.transition;
   } else if (object.yPos > (PLAY_FIELD.height + PLAY_FIELD.transition)) {
      
      object.yPos = 0 - PLAY_FIELD.transition;
   }
   
   // round speed and position to 2 decimal places
   object.speed = Math.round(object.speed * 100) / 100;
   object.xPos = Math.round(object.xPos * 100) / 100;
   object.yPos = Math.round(object.yPos * 100) / 100;
}


// function to update sprite and position of ships
function updateShip (shipObject) {
    
   // update ship if living
   if (shipObject.status === "living") {
      
      // move ship
      moveObject(shipObject);
      
      // update sprite of object based on rotation if type is one that uses sprites
      var sequentialFrameIndex = parseInt(shipObject.rotation / (360 / SPRITE_DATA.framesPerSheet));
      shipObject.xRotationIndex = sequentialFrameIndex % SPRITE_DATA.framesPerSheetSqRt;
      shipObject.yRotationIndex = parseInt(sequentialFrameIndex / SPRITE_DATA.framesPerSheetSqRt);
      
      // store object's current coordinates in history if it's a ship
      var historicalCoordinates = {
         "xPos" : shipObject.xPos,
         "yPos" : shipObject.yPos,
         "rotation" : shipObject.rotation
      };
      
      // add current coordinates to the historical record
      shipObject.history.unshift(historicalCoordinates);
      
      // only store the last 100 histroical coordinates
      if (shipObject.history.length > 100) {
         shipObject.history.pop();
      }
   }
}


// function to update sprite and position of ship and other objects
function updateWeapon (weaponObject, firingShipIndex, shipsArray) {
   
   // get projectiles array
   var projectiles = weaponObject.projectiles;
   
   // move, check collision, and  check the lifestpan each weapon's projectile
   for (var i = 0; i < projectiles.length; i++) {
      
      // initialize collision flag for skipping lifespan check if activated
      var collisionFlag = false;
      
      // move projectile
      moveObject(projectiles[i]);
      
      // loop through enemey ships to check collision
      for (var k = 0; k < shipsArray.length; k++) {
         
         // only count collisions with living enemy ships (ships that aren't the firing ship)
         if (k != firingShipIndex && shipsArray[k].status === "living") {
            
            // if collision, delete projectile and apply damage
            if (calculateDistance(projectiles[i], shipsArray[k]) <= 20) {
               
               // activate collision flag
               collisionFlag = true;
               
               // apply damage against ship's health
               shipsArray[k].health -= weaponObject.damage;
               
               // update damaage history; add to history if one already exists, otherwise create new history
               if (shipsArray[k].damageHistory[shipsArray[firingShipIndex].name]) {
                  
                  shipsArray[k].damageHistory[shipsArray[firingShipIndex].name] += weaponObject.damage;
               } else {
                  
                  shipsArray[k].damageHistory[shipsArray[firingShipIndex].name] = weaponObject.damage;
               }
               
               // if enemy ship was destroyed update scores
               if (shipsArray[k].health <= 0) {
                  
                  updateScores(shipsArray, k, firingShipIndex); 
               }
               
               
               // delete projectile element in projectiles array
               projectiles.splice(i, 1);
               i -= 1;
               
               // break out of loop checking if projectile hit any enemy ships since the current projectile was just deleted
               break;
            }
         }
      }
      
      // only check lifespan if collision flag is inactive
      if (collisionFlag === false) {
         
         // check lifespan of projectile and delete if reached
         if (projectiles[i].life >= weaponObject.lifespan) {
            
            // delete projectile element in projectiles array
            projectiles.splice(i, 1);
            i -= 1;
         } else {
            
            // add count to projectile's life
            projectiles[i].life += 1;
         }
      } 
   }
   
   // update weapon cooldown
   if (weaponObject.cooldown > 0) {
      
      weaponObject.cooldown -= 1;
   }
   
   
   //===== FUNCTIONS for updateWeapon =====
   // function to update the damage history of a ship
   function updateScores (shipsArray, destroyedShipIndex, firingShipIndex) {
      
      // get destroyed and firing ship objects
      var destroyedShip = shipsArray[destroyedShipIndex];
      var firingShip = shipsArray[firingShipIndex];
      
      // allocate kill to firing ship
      firingShip.kills += 1;
      
      // allocate assists to contributing ships
      for (var i = 0; i < shipsArray.length; i++) {
         
         // only allocate assists to ships other than the firing and destroyed ships
         if (i != destroyedShipIndex && i != firingShipIndex) {
            
            // get ship's name
            var contributingShipName = shipsArray[i].name;
            
            // check if ship contributed
            if (destroyedShip.damageHistory[contributingShipName]) {
               
               // if ship contributed 50 or more damage, allocate assist
               if (destroyedShip.damageHistory[contributingShipName] >= 50) {
                  
                  // allocate assist to contributing ship
                  shipsArray[i].assists += 1;
               }
            }
         }
      }
      
      // add death to destroyed ship
      shipsArray[destroyedShipIndex].deaths += 1;
   }
}


// function to calculate distance between two objects
function calculateDistance (objectOne, objectTwo) {

   var xComponent = Math.pow(objectOne.xPos - objectTwo.xPos, 2);
   var yComponent = Math.pow(objectOne.yPos - objectTwo.yPos, 2);
   var distance = Math.sqrt(xComponent + yComponent);
   
   return distance;
}


// accelerate object using its acceleration value
function accelerateObject (object) {
   
      object.speed = object.speed + object.acceleration;
}


// deccelerate object using its acceleration value
function deccelerateObject (object) {
      
   object.speed = object.speed - object.acceleration;
   
   // set speed to zero if less than zero
   if (object.speed < 0) {
      
      object.speed = 0;
   }
}
 
 
// rotate object using the passed degree change; may need to establish ship-based value later
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
 
 
// fire primary weapon
function firePrimaryWeapon(userShip) {
   
   // only fire if not on cooldown
   if (userShip.primaryWeapon.cooldown === 0) {
      
      // build new weapon projectiles
      var projectileLeft = new Projectile(userShip, 12, 10);
      var projectileRight = new Projectile(userShip, -12, 10);
   
      // add projectiles to list of ship's projectiles
      userShip.primaryWeapon.projectiles.push(projectileLeft);
      userShip.primaryWeapon.projectiles.push(projectileRight);
      
      // reset cooldown
      userShip.primaryWeapon.cooldown = userShip.primaryWeapon.rate;
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
         
         // initialize variable to store user ship object
         var userShip;
         
         // search through ships to find user's ship
         for (var i = 0; i < clientRequest.game.data.ships.length; i++) {
            
            if (clientRequest.game.data.ships[i].name === clientRequest.user.username) {
               
               // save user's ship for easy access
               userShip = clientRequest.game.data.ships[i];
            }
         }
         
         // rotate user ship counter-clockwise
         if (userData.keyMap[37]) {
            
            rotateObject(userShip, -5.625/2);
         }
         
         // accelerate user ship
         if (userData.keyMap[38]) {
            
            accelerateObject(userShip);
         }
         
         // rotate user ship clockwise
         if (userData.keyMap[39]) {
            
            rotateObject(userShip, 5.625/2);
         }
         
         // deccelerate user ship
         if (userData.keyMap[40]) {
            
            deccelerateObject(userShip);
         }
         
         // fire primary weapon from user ship
         if (userData.keyMap[90]) {
            
            firePrimaryWeapon(userShip);
         }
         
         // if game status is active, update, check victory conditions, and emit update
         if (clientRequest.game.status === "active") {

            // run complete update of all game objects
            updateGame(clientRequest.game);
            
            // check victory conditions and set game status to victory if true
            // loop through players checking current kills
            for (var i = 0; i < clientRequest.game.data.ships.length; i++) {
               
               // if ten kills (hard-coded for now) reached, update game status
               if (clientRequest.game.data.ships[i].kills >= 5) {
                  
                  // set game and player statuses to victory
                  clientRequest.game.status = "victory";
                  clientRequest.game.data.ships[i].victory = true;
               }
            }
            
            socket.emit("server_sends_update", clientRequest.game.data);
         
         // if victory conditions met, emit victory/wait for results to be processed
         } else if (clientRequest.game.status === "victory") {
  
            // update game status so that laravel isn't hit with a loop of scores
            clientRequest.game.status = "processing_results";

            sendScoresToDatabase(clientRequest.game);
            
            socket.emit("server_sends_victory");
            
         // if scores have been sent, still emit victory
         } else if (clientRequest.game.status === "processing_results") {
            
            socket.emit("server_sends_victory");
         
         // if scores have been processed (this status if updated by function sendScoresToDatabase), emit complete
         } else if (clientRequest.game.status === "complete") {
            
            // mark user as having received complete
            if (!userShip.receivedComplete) {
                  
               userShip.receivedComplete = true;
               socket.emit("server_sends_complete", clientRequest.game.interfaceId);
            }
            
            // loop through users to see if all have received complete status
            var completeCount = 0;
            for (var i = 0; i < clientRequest.game.data.ships.length; i++) {
               
               // check if received complete
               if (clientRequest.game.data.ships[i].receivedComplete) {
                  
                  completeCount += 1;
               }
            }
            
            // schdule game object for deletion 60 seconds from when first user receives complete status
            if (!clientRequest.game.deletionScheduled) {
               
               clientRequest.game.deletionScheduled = true;
               
               setTimeout(function(){
                  
                  // destroy game object
                  delete gamesList[clientRequest.game.authkey];
                  console.log("game object destroyed");
               }, 60000);
            }
         }
      }   
   });
});   