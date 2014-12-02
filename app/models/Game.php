<?php

class Game extends Eloquent {
	
	public function users() {
		return $this->belongsToMany('User');	
	}

}
