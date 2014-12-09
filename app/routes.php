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
Route::get('/results/{gameId}', 'InterfaceController@getResults');
Route::get('/profile/{profileId?}', 'InterfaceController@getProfile');
Route::get('/edit/profile', 'InterfaceController@getEditProfile');
Route::post('/edit/profile', 'InterfaceController@postEditProfile');