<?php

class Game extends Eloquent {
	
	public function users() {
		return $this->belongsToMany('User')->withPivot('kills', 'assists', 'deaths', 'victory');	
	}

}
