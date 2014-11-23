<?php

class InterfaceController extends BaseController {
    
    public function getLogin() {
        return View::make('login');
    }
     
    public function postLogin() {
        return View::make('lobby');
    }
      
    public function postSignup() {
        return View::make('lobby');
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
