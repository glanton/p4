<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up() {
	    
            Schema::create('users', function($table) {
               
               $table->increments('id');
               $table->timestamps();
               
               $table->string('username');
               $table->string('email');
               $table->string('password');
               $table->string('description');
               $table->string('authkey');
                
            });
            
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		
            Schema::drop('users');
                
	}

}
