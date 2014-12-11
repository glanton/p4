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


// Results Controller (not csrf or auth protect to allow data from node.js server)
Route::post('/update/results', 'ResultsController@postUpdateResults');


# /app/routes.php
Route::get('/debug', function() {

    echo '<pre>';

    echo '<h1>environment.php</h1>';
    $path   = base_path().'/environment.php';

    try {
        $contents = 'Contents: '.File::getRequire($path);
        $exists = 'Yes';
    }
    catch (Exception $e) {
        $exists = 'No. Defaulting to `production`';
        $contents = '';
    }

    echo "Checking for: ".$path.'<br>';
    echo 'Exists: '.$exists.'<br>';
    echo $contents;
    echo '<br>';

    echo '<h1>Environment</h1>';
    echo App::environment().'</h1>';

    echo '<h1>Debugging?</h1>';
    if(Config::get('app.debug')) echo "Yes"; else echo "No";

    echo '<h1>Database Config</h1>';
    print_r(Config::get('database.connections.mysql'));

    echo '<h1>Test Database Connection</h1>';
    try {
        $results = DB::select('SHOW DATABASES;');
        echo '<strong style="background-color:green; padding:5px;">Connection confirmed</strong>';
        echo "<br><br>Your Databases:<br><br>";
        print_r($results);
    } 
    catch (Exception $e) {
        echo '<strong style="background-color:crimson; padding:5px;">Caught exception: ', $e->getMessage(), "</strong>\n";
    }

    echo '</pre>';

});