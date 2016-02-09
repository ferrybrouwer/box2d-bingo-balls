var app = app || {};
app.box2d = app.box2d || {};
app.box2d.props = app.box2d.props || {};

(function(){
	
	/**
	 * Create world instance
	 * 
	 * @param {number} gravity_x [default 0]
	 * @param {number} gravity_y [default 10]
	 * @return {datatype}
	 */
	function World(gravity_x, gravity_y) {
		var gravity = new app.box2d.b2Vec2(gravity_x || 0, gravity_y || 10),
			sleep = true;
			
		return new app.box2d.b2World(gravity, sleep);
	};

	app.box2d.props.World = World;
})();