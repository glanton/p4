
// initialize global csrfToken and base url variables
var csrfToken;
var baseURL;


// AJAX call to check if current game has been started every five second and if so begin game
function checkGameStatus() {
   jQuery.post(baseURL + "/check/game", {_token : csrfToken}, function(data) {
      var gameBegun = data;
      
      // if game has begun, redirect to game page 
      if (gameBegun == true) {
         window.location.replace(baseURL + "/game");
      }
    });
   
   // run again in 5 seconds
   setTimeout(checkGameStatus, 5000);
}


jQuery(document).ready(function(){
   
   // set csrf token, game exception, and base url variables form hidden inputs on page
   csrfToken = jQuery("input[name=_token]").val();
   baseURL = jQuery("input[name=baseURL]").val();
   
   checkGameStatus();  
});