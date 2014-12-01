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
Route::get('/game', 'InterfaceController@getGame');
Route::get('/results/{gameID}', 'InterfaceController@getResults');
Route::get('/profile/{profileID?}', 'InterfaceController@getProfile');
Route::get('/edit/profile', 'InterfaceController@getProfileEdit');
Route::post('/edit/profile', 'InterfaceController@postProfileEdit');