<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

Route::get('/', 'InterfaceController@getLobby');
Route::get('/login', 'InterfaceController@getLogin');
Route::post('/login', 'InterfaceController@postLogin');
Route::get('/logout', 'InterfaceController@getLogout');
Route::post('/signup', 'InterfaceController@postSignup');
Route::get('/lobby', 'InterfaceController@getLobby');
Route::post('/update/lobby', 'InterfaceController@postUpdateLobby');
Route::post('/new/game', 'InterfaceController@postNewGame');
Route::post('/start/game', 'InterfaceController@postStartGame');
Route::post('/leave/game', 'InterfaceController@postLeaveGame');
Route::post('/join/game', 'InterfaceController@postJoinGame');
Route::post('check/game', 'InterfaceController@postCheckGameStatus');
Route::get('/game', 'InterfaceController@getGame');
Route::get('/results/{interfaceId}', 'InterfaceController@getResults');
Route::get('/profile/{username?}', 'InterfaceController@getProfile');
Route::get('/edit/profile', 'InterfaceController@getEditProfile');
Route::post('/edit/profile', 'InterfaceController@postEditProfile');


// Results Controller (not csrf or auth protect to allow data from node.js server)
Route::post('/update/results', 'ResultsController@postUpdateResults');


//#####################
// only for testing
//#####################
Route::post('/reset/game', function() {
	
	// get user's current game authkey
        $user = Auth::user();
        $currentGameAuthkey = $user->current_game_authkey;
    
	// get current game object
	$currentGame = Game::where('authkey', '=', $currentGameAuthkey)
	    ->first();
	
	// set the current game of all users to 'not_in_game'
	foreach ($currentGame->users as $gameUser) {
		$gameUser->current_game_authkey = 'not_in_game';
		$gameUser->save();
	}
	
	$currentGame->complete = true;
	$currentGame->save();
	
	return Redirect::to('/lobby');
});