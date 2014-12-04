<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCurrentGameAuthkeyToBooksTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{

            Schema::table('users', function($table) {
               
               $table->string('current_game_authkey');
                
            });

	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
            
            Schema:table('users', function($table) {
               
               $table->dropColumn('current_game_authkey');
                
            });
            
	}

}
