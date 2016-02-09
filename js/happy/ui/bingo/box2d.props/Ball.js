/*
 	 ____            ___     _                           ____        _ _ 
 	|  _ \          |__ \   | |                         |  _ \      | | |
 	| |_) | _____  __  ) |__| |  _ __  _ __ ___  _ __   | |_) | __ _| | |
 	|  _ < / _ \ \/ / / // _` | | '_ \| '__/ _ \| '_ \  |  _ < / _` | | |
 	| |_) | (_) >  < / /| (_| | | |_) | | | (_) | |_) | | |_) | (_| | | |
 	|____/ \___/_/\_\____\__,_| | .__/|_|  \___/| .__/  |____/ \__,_|_|_|
 	                            | |             | |                      
 	                            |_|             |_|                      
 */
(function() {
	var $window = $(window),
		ballTemplate,
		Box2d = window.app.model.Box2d || {
			'b2Vec2': Box2D.Common.Math.b2Vec2,
			'b2AABB': Box2D.Collision.b2AABB,
			'b2BodyDef': Box2D.Dynamics.b2BodyDef,
			'b2Body': Box2D.Dynamics.b2Body,
			'b2FixtureDef': Box2D.Dynamics.b2FixtureDef,
			'b2Fixture': Box2D.Dynamics.b2Fixture,
			'b2World': Box2D.Dynamics.b2World,
			'b2MassData': Box2D.Collision.Shapes.b2MassData,
			'b2PolygonShape': Box2D.Collision.Shapes.b2PolygonShape,
			'b2CircleShape': Box2D.Collision.Shapes.b2CircleShape,
			'b2DebugDraw': Box2D.Dynamics.b2DebugDraw,
			'b2MouseJointDef': Box2D.Dynamics.Joints.b2MouseJointDef,
			'b2Shape': Box2D.Collision.Shapes.b2Shape,
			'b2RevoluteJointDef': Box2D.Dynamics.Joints.b2RevoluteJointDef,
			'b2DistanceJointDef': Box2D.Dynamics.Joints.b2DistanceJointDef,
			'b2PrismaticJointDef': Box2D.Dynamics.Joints.b2PrismaticJointDef,
			'b2Joint': Box2D.Dynamics.Joints.b2Joint,
			'b2ContactListener': Box2D.Dynamics.b2ContactListener,
			'b2Settings': Box2D.Common.b2Settings,
			'scale': 30,
		};

	window.app.ui.box2d = window.app.ui.box2d || {};
	window.app.ui.box2d.props = window.app.ui.box2d.props || {};
	window.app.ui.box2d.props.Ball = Ball;

	function Ball(world, label, color) {
		this.world            = world;
		this.radius           = 22 / Box2d.scale;
		this.label            = label;
		this.color            = color;
		this.transformPrefix  = Modernizr.prefixed('transform');
        this.css3d            = Modernizr.csstransforms3d;

		// set ball template
		if ( document.getElementById('box2d_ball') ){
			ballTemplate = document.getElementById('box2d_ball').innerHTML;
		}

		this._createBody();
		this._createHTML();
	}

	Ball.prototype = {

        /**
         * Getter / Setter X coordination
         *
         * @public
         * @param  {number} px
         * @return {number}
         */
        x: function(px) {
            if (_.isNumber(px)) {
                this.body.SetPosition(new Box2d.b2Vec2(px / Box2d.scale, this.body.GetPosition().y));
            } else {
                return this.body.GetPosition().x * Box2d.scale;
            }
        },

        /**
         * Getter / Setter Y coordination
         *
         * @public
         * @param  {number} px
         * @return {number}
         */
        y: function(px) {
            if (_.isNumber(px)) {
                this.body.SetPosition(new Box2d.b2Vec2(px / Box2d.scale, this.body.GetPosition().y));
            } else {
                return this.body.GetPosition().x * Box2d.scale;
            }
        },

		/**
		 * Create body
         *
         * @private
		 * @return {void}
		 */
		_createBody: function() {
			// create fixture definition
			var fixDef = new Box2d.b2FixtureDef();
			fixDef.density = 0.09;
			fixDef.friction = 0.4;
			fixDef.restitution = 0.3;
			fixDef.shape = new Box2d.b2CircleShape(this.radius);

			// create body definition
			var bodyDef = new Box2d.b2BodyDef();
			bodyDef.type = Box2d.b2Body.b2_dynamicBody;
            bodyDef.position.x = -70 / Box2d.scale;
			bodyDef.position.y = -100 / Box2d.scale;
			bodyDef.linearDamping = 0;
			bodyDef.angularDamping = 0;
			bodyDef.gravityScale = 1;
			bodyDef.bullet = true;

			// create body
			this.body = this.world.CreateBody(bodyDef);
			this.body.CreateFixture(fixDef);
		},

		/**
		 * Create HTML
         * 
         * @private
		 * @return {void}
		 */
		_createHTML: function() {
			this.html = _.template(ballTemplate, {
				label: this.label,
				color: this.color
			});
			this.html = $(this.html).get(0);
		},

		/**
		 * Update ball html positions
         * 
         * @public
		 * @return {void}
		 */
		update: function() {
			if (this.body.IsAwake()) {
				var radius = this.radius * Box2d.scale,
                    x = (this.body.GetPosition().x * Box2d.scale + 50) - radius,
                    y = (this.body.GetPosition().y * Box2d.scale) - radius,
                    r = (this.body.GetAngle() / Math.PI) * 180;

                if (this.css3d){
                    this.html.style[this.transformPrefix] = 'translateX(' + x + 'px) translateY(' + y + 'px) rotate3d(0,0,1,' + r + 'deg)';
                }else{
                    this.html.style[this.transformPrefix] = 'translate(' + x + 'px,' + y + 'px) rotate(' + r + 'deg)';
                }
			}
		}
	};
})();