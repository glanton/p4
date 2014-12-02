<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateGamesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{

            Schema::create('games', function($table) {
               
                $table->increments('id');
                $table->timestamps();
                
                $table->string('interface_id');
                $table->string('authkey');
                $table->boolean('begun');
                $table->boolean('complete');
                $table->integer('user_count');
                
            });
            
            Schema::create('game_user', function($table) {
                
                $table->integer('game_id')->unsigned();
                $table->foreign('game_id')->references('id')->on('games');
                $table->integer('user_id')->unsigned();
                $table->foreign('user_id')->references('id')->on('users');
                $table->integer('kills');
                $table->integer('assists');
                $table->integer('deaths');
                $table->boolean('victory');
                
            });
            
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
            
            Schema::drop('games');
            Schema::drop('game_user');
            

	}

}
