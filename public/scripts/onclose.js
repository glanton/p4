// unfortunately, this code will also trigger when the user leaves a page by loading a new URL from the browser, pressing the back button, the refresh button, or using any other way of leaving the page that isn't a link or a form. This may be alright, and even if not ideal may be a preferrable alternative to having a bunch of inactive unstarted games sitting around. I'm leaving this code in for now under consideration (12/6/14)

// initialize global csrfToken variable and variable to track how user exits page (set to false by default)
var csrfToken;
var exitByLinkOrForm = false;

csrfToken = jQuery("input[name=_token]").val();

activateTrackingVariables();

// in addition to initial click handlers, add more on an AJAX event to capture generated form submits and links
jQuery(document).ajaxSuccess(function() {
   activateTrackingVariables();
});


jQuery(window).bind("beforeunload", function() {
   // if the user to did exit by link or form (meaning they closed the browser), post to server to leave an unstarted game
   if (exitByLinkOrForm === false) {
      jQuery.post("../leave/game", {_token : csrfToken});
   }
})


// function to add tracking to links and submit inputs
function activateTrackingVariables() {
   
   // activate tracking variable if link clicked
   jQuery("a").on("click", function() {
      exitByLinkOrForm = true;
   });
   
   // activate tracking variable if form submit clicked
   jQuery("form").on("submit", function() {
      exitByLinkOrForm = true;
   });
   
}

