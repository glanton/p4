<?php

class InterfaceController extends BaseController {
    
    public function __construct() {
        
        // run CSRF fliter on POST requests
        $this->beforeFilter('csrf', array('on' => 'post'));
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
    
    
    public function postUpdateLobby() {

        return View::make('lobby');
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

        return Redirect::to('/lobby');
    
    }


    public function postStartGame() {
        return Redirect::action('InterfaceController@postUpdateLobby');
    }
    
    
    public function postLeaveGame() {
        return Redirect::action('InterfaceController@postUpdateLobby');
    }
    
    
    public function postJoinGame() {
        return Redirect::action('InterfaceController@postUpdateLobby');
    }
    
    public function getGame() {
        return View::make('game');
    }
       
    public function getResults($gameID) {
        return View::make('results');
    }
      
    public function getProfile($profileID = null) {
        return View::make('profile');
    }
        
    public function getProfileEdit() {
        return View::make('profile_edit');
    }
     
    public function postProfileEdit() {
        return View::make('profile');
    }
    
}
