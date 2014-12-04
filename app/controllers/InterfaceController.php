<?php

class InterfaceController extends BaseController {
    
    public function __construct() {
        
        // run CSRF fliter on POST requests
        // $this->beforeFilter('csrf', array('on' => 'post'));
        // block all pages except for login page until user authenticated
        $this->beforeFilter('auth', array('except' => array('getLogin', 'postLogin', 'postSignup')));
        
    }
    
    
    public function getLogin() {
        return View::make('login');
    }
     
     
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
    
    
    public function getLogout() {
        
        Auth::logout();
        
        return Redirect::to('login');
        
    }
      
     
    // validate signup data and create a new account
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
            $user->save();
            
            return Redirect::to('/lobby');
        }
        
        // on validation failure
        Input::flashExcept('password', 'confirmPassword');
        
        return Redirect::to('/login')
            ->withErrors($validator);
            
    }
    
    
    public function getLobby() {
        return View::make('lobby');
    }
    
    
    // change to postUpdateLobby when ready to integrate with AJAX
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
            

    public function postNewGame() {
    
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
        $newGame->users()->save(Auth::user());
        
        // mark new game as the user's current game
        Auth::user()->current_game_authkey = $authkey;
        Auth::user()->save();
        
        return Redirect::to('/lobby');
    
    }


    public function postStartGame() {
        return Redirect::to('/lobby');
        //return Redirect::action('InterfaceController@postUpdateLobby');
    }
    
    
    public function postLeaveGame() {
        return Redirect::action('InterfaceController@postUpdateLobby');
    }
    
    
    public function postJoinGame($interfaceId) {
        return Redirect::action('InterfaceController@postUpdateLobby');
    }
    
    public function getGame() {
        return View::make('game');
    }
       
    public function getResults($gameId) {
        return View::make('results');
    }
      
    public function getProfile($profileId = null) {
        return View::make('profile');
    }
        
    public function getProfileEdit() {
        return View::make('profile_edit');
    }
     
    public function postProfileEdit() {
        return View::make('profile');
    }
    
}
