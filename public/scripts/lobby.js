

// set max users per single game
var MAX_USERS = 4;

// initialize global csrfToken and base url variables
var csrfToken;
var baseURL;

// AJAX call to pull game list data from server and then update display every five seconds
function updateLobby() {
   jQuery.post(baseURL + "/update/lobby", {_token : csrfToken}, function(data) {
        var jsonData = data;
        var currentGameSection;
        var currentGameInfo;
        var currentGameControls;
        var flexibleCount = 0;
        var inGame = true;

        // check if user is currently in a game
        if (jsonData[0] === "in_no_game") {
          flexibleCount = 1;
          inGame = false;
        }
        
        // empty gameList div
        jQuery(".gameList").empty();
        
        // iterate through each game, displaying information and adding appropriate buttons
        for (var i = flexibleCount; i < jsonData.length; i++) {
          
            currentGameSection = jQuery("<div class='gameSection'></div>").appendTo(".gameList");
            currentGameInfo = jQuery("<div class='gameInfo'></div>").appendTo(currentGameSection);
            jQuery(currentGameInfo).append("<div class='gameInterfaceId'>" + jsonData[i].interfaceId + "</div>");
            
            for (var k = 0; k < jsonData[i].users.length; k++) {
                jQuery(currentGameInfo).append("<div class='gameUser'>" + jsonData[i].users[k] + "</div>");
            }
            
            currentGameControls = jQuery("<div class='gameControls'></div>").appendTo(currentGameSection);
            
            // handle different cases: 1) in a game 2) not in a game and game not full (4 users max per game)
            if (inGame === true && i === 0) {
              
                // highlight user's game
                jQuery(currentGameSection).addClass("currentGameSection").removeClass("gameSection");
                
                // add start button
                jQuery(currentGameControls).append("<form class='gameButtonForm' method='POST' action='../start/game' accept-charset='UTF-8'><input name='_token' type='hidden' value=" + csrfToken + "><input class='gameButton' type='submit' value='Start'></form>");
                
                // add leave button
                jQuery(currentGameControls).append("<form class='gameButtonForm' method='POST' action='../leave/game' accept-charset='UTF-8'><input name='_token' type='hidden' value=" + csrfToken + "><input class='gameButton' type='submit' value='Leave'></form>");
          
            } else if (inGame === false && jsonData[i].users.length < MAX_USERS) {
              
                // add join button
                jQuery(currentGameControls).append("<form class='gameButtonForm' method='POST' action='../join/game' accept-charset='UTF-8'><input name='_token' type='hidden' value=" + csrfToken + "><input type='hidden' name='interfaceId' value=" + jsonData[i].interfaceId +"><input class='gameButton' type='submit' value='Join'></form>");
              
            }
        }
    });
   
   // run again in 5 seconds
   setTimeout(updateLobby, 5000);
}

jQuery(document).ready(function(){
    
    // set csrf token and baseURL from hidden inputs on the page
    csrfToken = jQuery("input[name=_token]").val();
    baseURL = jQuery("input[name=baseURL]").val();
    
    updateLobby();  
});

