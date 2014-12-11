<?php

class InterfaceController extends BaseController {
    
    /*=====
    __construct
    =====*/
    public function __construct() {
        
        // run CSRF fliter on POST requests
        $this->beforeFilter('csrf', array('on' => 'post'));
        // block all pages except for login page until user authenticated
        $this->beforeFilter('auth', array('except' => array('getLogin', 'postLogin', 'postSignup')));
        
    }
    
    
    /*=====
    getLogin
    =====*/
    public function getLogin() {
        return View::make('login');
    }
     
    
    /*=====
    postLogin
    =====*/
    public function postLogin() {
        
        // gather email and password credentials
        $credentials = array(
            'email' => Input::get('loginEmail'),
            'password' => Input::get('loginPassword')
        );
        
        if (Auth::attempt($credentials, $remember = false)) {
            return Redirect::intended('/lobby');
        } else {
            return Redirect::to('/login')
                ->with('flash_message', 'Log in failed.')
                ->withInput();
        }
        
    }
    
    
    /*=====
    getLogout
    check if user is currently in a game and leave it if so
    =====*/
    public function getLogout() {

        // get user's current game authkey
        $user = Auth::user();
        $currentGameAuthkey = $user->current_game_authkey;
    
        // check that user is currently in a game
        if ($currentGameAuthkey != 'not_in_game') {
    
            // get current game object
            $currentGame = Game::where('authkey', '=', $currentGameAuthkey)
                ->first();
        
            // check for and only leave games that have not yet begun
            if ($currentGame->begun == false) {
 
                // detach user from current game
               $currentGame->users()->detach($user->id);
           
               // decrement user count of current game
               $currentGame->user_count -= 1;
               
                // if no users remain in game, set it to complete
                if ($currentGame->user_count == 0) {
                    $currentGame->complete = true;
                }
                
                // save game
                $currentGame->save();
            }
            
            // reset user's current game authkey
            $user->current_game_authkey = 'not_in_game';
            $user->save();       
        }         
          
        Auth::logout();
        
        return Redirect::to('login');
        
    }
      
    
    /*=====
    postSignup
        validate signup data and create a new account
    =====*/
    public function postSignup() {
        
        // gather signup form data
        $signupData = Input::all();
        
        // set validation rules
        $rules = array(
            'username' => 'alpha_num|required|unique:users',
            'email' => 'email|required|unique:users',
            'confirmEmail' => 'same:email',
            'password' => 'min:6',
            'confirmPassword' => 'same:password'
        );
        
        // build the validator
        $validator = Validator::make($signupData, $rules);
        
        // check validation
        if ($validator->passes()) {
            
            // add new user to the database
            $user = new User();
            $user->username = Input::get('username');
            $user->email = Input::get('email');
            $user->password = Hash::make(Input::get('password')); //hash password for security
            $user->authkey = Input::get('username') . str_random(32);
            $user->current_game_authkey = 'not_in_game';
            $user->save();
            
            // sign in new user and send to lobby
            if (Auth::attempt(array('email' => Input::get('email'), 'password' => Input::get('password'))))
            {
                return Redirect::to('/lobby');
            } else {
                return Redirect::to('/lobby');
            }
        }
        
        // on validation failure
        Input::flashExcept('password', 'confirmPassword');
        
        return Redirect::to('/login')
            ->withErrors($validator);
            
    }
    
    
    /*=====
    getLobby
    load lobby page and also cleanup inactive games
    =====*/
    public function getLobby() {
        
        // pull collection of all games that haven't begun and aren't complete
        $games = Game::where('begun', '=', 'false')
            ->where('complete', '=', 'false')
            ->get();
        
        // check how long each unstarted game has been active
        foreach ($games as $game) {
            
            $secondsElapsed = time() - strtotime($game->created_at);
            $minutesElapsed = floor($secondsElapsed/60);
            
            // if game was created more than twenty minutes ago, detach all players, set their current game authkey to "not_in_game", and close the game (set complete to true)
            if ($minutesElapsed >= 20) {
            
                $users = $game->users;
                
                foreach ($users as $user) {
                    
                    // detach user from current game
                    $game->users()->detach($user->id);
               
                    // decrement user count of current game
                    $game->user_count -= 1;
                   
                    // if no users remain in game, set it to complete
                    if ($game->user_count == 0) {
                        $game->complete = true;
                    }
                    
                    // save game
                    $game->save();
               
                    // reset user's current game authkey
                    $user->current_game_authkey = 'not_in_game';
                    $user->save();
                }
            }
        }
        
        return View::make('lobby');
    }
    
    
    /*=====
    postUpdateLobby
    =====*/
    public function postUpdateLobby() {
        
        // pull collection of all games that haven't begun and aren't complete
        $games = Game::where('begun', '=', 'false')
            ->where('complete', '=', 'false')
            ->get();

        // pull authkey of user's current game
        $currentGameAuthkey = Auth::user()->current_game_authkey;
            
        // initialize array to hold list of games, set first element of array to indicate currently in no game, and set iterator to start on next element
        $gameList = array();
        $gameList[0] = 'in_no_game';
        $gameListCount = 1;
        
        // for each game in the collection, save the interface_id and usernames
        foreach ($games as $game) {
            // iterator that can be changed to zero in case game matches user's current game
            $flexibleCount = $gameListCount;
            
            // check if game matches user's current game
            if ($game->authkey == $currentGameAuthkey) {
                // change flex count to 0 and hold true count
                $flexibleCount = 0;
                $gameListCount -= 1;
            }
            
            // create new object within gameList for each game
            $gameList[$flexibleCount] = new stdObject();
            $gameList[$flexibleCount]->interfaceId = $game->interface_id;
            $gameList[$flexibleCount]->users = array();
            
            // store each user's username within an array within the new object
            foreach ($game->users as $user) {
                array_push($gameList[$flexibleCount]->users, $user->username);
            }
            
            // maintain true count
            $gameListCount += 1;
        }
        
        return Response::json($gameList);
    }
            

    /*=====
    postNewGame
    =====*/
    public function postNewGame() {
    
        // get user's current game authkey
        $user = Auth::user();
        $currentGameAuthkey = $user->current_game_authkey;
    
        // check that user is not currently in a game
        if ($currentGameAuthkey == 'not_in_game') {
    
            // generate game interface_id until unique
            $interfaceId = 0;
            do {
                $interfaceId = str_random(32);
                $interfaceIdValidator = Validator::make(
                    array('interface_id' => $interfaceId),
                    array('interface_id' => 'unique:games')
                );  
            } while ($interfaceIdValidator->fails());
            
            // generate game authkey until unique
            $authkey = 0;
            do {
                $authkey = str_random(32);
                $authkeyValidator = Validator::make(
                    array('authkey' => $authkey),
                    array('authkey' => 'unique:games')
                );  
            } while ($authkeyValidator->fails());         
    
            // create new game, add it to the games table
            $newGame = new Game();
            $newGame->interface_id = $interfaceId;
            $newGame->authkey = $authkey;
            $newGame->user_count = 1;
            $newGame->begun = false;
            $newGame->complete = false;
            $newGame->save();
            
            // associate new game with the user who created it (the one currently logged in)
            $newGame->users()->attach($user->id);
            $newGame->save();
            
            // mark new game as the user's current game
            $user->current_game_authkey = $authkey;
            $user->save();
        }
        
        return Redirect::to('/lobby');
    
    }


    /*=====
    postStartGame
    =====*/
    public function postStartGame() {
        
        // get user's current game authkey
        $user = Auth::user();
        $currentGameAuthkey = $user->current_game_authkey;
        
        // check that user is currently in a game
        if ($currentGameAuthkey != 'not_in_game') {
            
            // get current game object
            $currentGame = Game::where('authkey', '=', $currentGameAuthkey)
                ->first();
            
            // check for and only start games that have not yet begun
            if ($currentGame->begun == false) {
                
                // begin current game and save
                $currentGame->begun = true;
                $currentGame->save();
                
                // initialize curl to send game authkey, usernames, and user authkeys to node js server
                $ch = curl_init();
                
                // store usernames and associated authkeys as arrays within a users array
                $users = array();
                $usersCount = 0;
                
                foreach ($currentGame->users as $user) {
                    array_push($users, array("username" => $user->username, "userAuthkey" => $user->authkey));
                    $usersCount += 1;
                }
                
                // store game authkey along with users array and encode as json
                $gameData = array("gameAuthkey" => $currentGame->authkey, 'gameInterfaceId' => $currentGame->interface_id, "users" => $users);
                $jsonGameData = json_encode($gameData);
                
                // curl settings
                curl_setopt($ch, CURLOPT_URL, 'http://localhost:8734/build/game/on/server');
                curl_setopt($ch, CURLOPT_POST, 1);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonGameData);
                
                curl_exec($ch);
                curl_close($ch);
        
                
                
                return Redirect::to('/game');
            }
        }
        
        return Redirect::to('/lobby');
    }
    
    
    /*=====
    postLeaveGame
    =====*/
    public function postLeaveGame() {
        
        // get user's current game authkey
        $user = Auth::user();
        $currentGameAuthkey = $user->current_game_authkey;
    
        // check that user is currently in a game
        if ($currentGameAuthkey != 'not_in_game') {
    
            // get current game object
            $currentGame = Game::where('authkey', '=', $currentGameAuthkey)
                ->first();
        
            // check for and only leave games that have not yet begun
            if ($currentGame->begun == false) {

                // detach user from current game
                $currentGame->users()->detach($user->id);
           
                // decrement user count of current game
                $currentGame->user_count -= 1;
               
                // if no users remain in game, set it to complete
                if ($currentGame->user_count == 0) {
                    $currentGame->complete = true;
                }
                
                // save game
                $currentGame->save();
           
                // reset user's current game authkey
                $user->current_game_authkey = 'not_in_game';
                $user->save();       
            }
        }  

        return Redirect::to('/lobby');
    }
    
    
    /*=====
    postJoinGame
    =====*/
    public function postJoinGame() {
        
        // get user's current game authkey
        $user = Auth::user();
        $currentGameAuthkey = $user->current_game_authkey;
    
        // check that user is not currently in a game
        if ($currentGameAuthkey == 'not_in_game') {
         
            // get requested game object
            $currentGame = Game::where('interface_id', '=', Input::get('interfaceId'))
                ->first();
            
            // check that game with provided interfaceId exists
            if (!empty($currentGame)) {
                
                // check that game is not full and has not begun
                if ($currentGame->user_count < 4 and $currentGame->begun == false) {
                    
                    // attach user to current game
                    $currentGame->users()->attach($user->id);
                    
                    // increment user count of current game and save
                    $currentGame->user_count += 1;
                    $currentGame->save();
                    
                    // update the user's current game authkey
                    $user->current_game_authkey = $currentGame->authkey;
                    $user->save();
                }
                
            }
        }
        
        return Redirect::to('/lobby');
    }

    
    /*=====
    postCheckGameStatus
    check if another player has started the game and if so load the game page
    =====*/
    public function postCheckGameStatus() {

        // pull authkey of user's current game
        $currentGameAuthkey = Auth::user()->current_game_authkey;
        
        // set game status to "not_in_game" (will be sent if user isn't in a game)
        $gameStatus = 'not_in_game';
        
        // check that user is currently in a game
        if ($currentGameAuthkey != 'not_in_game') {
            
            // get current game object
            $currentGame = Game::where('authkey', '=', $currentGameAuthkey)
                ->first();
            
            // collect begun status of current game
            $gameStatus = $currentGame->begun;
        }
        
        return Response::json($gameStatus);
    }
    
    
    /*=====
    getGame
    =====*/
    public function getGame() {
        
        return View::make('game');
    }
    
    
    
    /*=====
    getResults
    =====*/  
    public function getResults($gameId) {
        return View::make('results');
    }
     
     
    /*=====
    getProfile
    =====*/ 
    public function getProfile($profileId = null) {        
        return View::make('profile');
    }
     

    /*=====
    getEditProfile
    =====*/   
    public function getEditProfile() {
        return View::make('edit_profile');
    }
    
    
    /*=====
    postEditProfile
    =====*/
    public function postEditProfile() {
        return View::make('profile');
    }
    
}
