<?php

class ResultsController extends BaseController {
     
    /*=====
    postUpdateResults
    =====*/  
    public function postUpdateResults() {
        
        // read the results data sent from the node server
        $resultsData = Input::All();
        
        // return false as default if unable to process request
        $updateResults = array('updateResults' => 'false');
        
        // get current game's authkey from results data
        $gameAuthkey = $resultsData['gameAuthkey'];
        
        // get current game object
        $game = Game::where('authkey', '=', $gameAuthkey)
            ->first();
            
        // check that game with provided authkey exists
        if (!empty($game)) {
            
            // loop through users provided with results and get each user from the database
            foreach ($resultsData['users'] as $resultsUser) {
                
                $user = User::where('authkey', '=', $resultsUser['userAuthkey'])
                    ->first();
                
                // check that user with provided authkey exists
                if (!empty($user)) {
                    
                    // get the pivot for the user's game's results
                    $results = $user->games->find($game->id);
                    
                    // assign kills, assists, deaths, and victory status
                    $results->pivot->kills = $resultsUser['kills'];
                    $results->pivot->assists = $resultsUser['assists'];
                    $results->pivot->deaths = $resultsUser['deaths'];
                    $results->pivot->victory = $resultsUser['victory'];
                    
                    // save results
                    $results->pivot->save();
                    
                    // set user's current game to not_in_game
                    $user->current_game_authkey = "not_in_game";
                    $user->save();
                    
                    // set game to complete and save
                    $game->complete = true;
                    $game->save();
                    
                    // return true
                    $updateResults = array('updateResults' => 'true');
                }
            }
        }
    
        return Response::json($updateResults);
    }
    
}