<?php

class InterfaceController extends BaseController {
    
    public function getLogin() {
        return View::make('login');
    }
     
     
    public function postLogin() {
        
        
        return View::make('lobby');
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
            $user->save();
            
            return Redirect::to('/lobby');
        }
        
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
