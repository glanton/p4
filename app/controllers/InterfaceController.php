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
            
            // generate user authkey until unique
            $authKey = 0;
            do {
                $authKey = str_random(32);
                $authValidator = Validator::make(
                    array('authKey' => $authKey),
                    array('authKey' => 'unique:users')
                );  
            } while ($authValidator->fails());
            
            // add new user to the database
            $user = new User();
            $user->username = Input::get('username');
            $user->email = Input::get('email');
            $user->password = Hash::make(Input::get('password')); //hash password for security
            $user->authkey = $authKey;
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
