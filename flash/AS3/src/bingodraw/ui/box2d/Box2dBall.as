package bingodraw.ui.box2d
{
	import Box2D.Collision.Shapes.b2CircleShape;
	import Box2D.Dynamics.b2Body;
	import Box2D.Dynamics.b2BodyDef;
	import Box2D.Dynamics.b2FixtureDef;
	import Box2D.Dynamics.b2World;

	import bingodraw.ui.Ball;

	import flash.display.Sprite;

	/**
	 * @author ferrybrouwer
	 */
	public class Box2dBall extends Sprite
	{
		private var world : b2World;
		private var radius : Number;
		private var body : b2Body;
		private var label : String;
		private var color : uint;
		private var ball : Ball;

		/**
		 * Box2d Ball constructor
		 * @param world : b2World
		 * @param radius : Number
		 * @return void
		 */
		public function Box2dBall(world : b2World, label : String, color : uint)
		{
			this.world = world;
			this.radius = 20 / Box2dBowl.SCALE;
			this.label = label;
			this.color = color;
			
			// create box2d body
			this._createBody();
			
			// add visual sprite ball
			this.ball = new Ball(label, color);
			this.ball.x = -50;
			addChild(ball);
		}

		private function _createBody() : void
		{
			// create fixture definition
			var fixDef : b2FixtureDef = new b2FixtureDef();
			fixDef.density = 0.09;
			fixDef.friction = 0.4;
			fixDef.restitution = 0.3;
			fixDef.shape = new b2CircleShape(this.radius);

			// create body definition
			var bodyDef : b2BodyDef = new b2BodyDef();
			bodyDef.type = b2Body.b2_dynamicBody;

			bodyDef.position.x = -50 / Box2dBowl.SCALE;
			bodyDef.position.y = -100 / Box2dBowl.SCALE;
			bodyDef.linearDamping = 0;
			bodyDef.angularDamping = 0;
			bodyDef.bullet = true;

			// create body
			this.body = this.world.CreateBody(bodyDef);
			this.body.CreateFixture(fixDef);
		}

		/**
		 * Update ball positions when body is awake
		 * @return void
		 */
		public function update() : void
		{
			if ( this.body.IsAwake() && this.ball )
			{
				var radius : Number = this.radius * Box2dBowl.SCALE,
				positions : Object = {x:this.body.GetPosition().x * Box2dBowl.SCALE, y:this.body.GetPosition().y * Box2dBowl.SCALE},
				bpX : Number = positions.x - radius,
				bpY : Number = positions.y - radius,
				br : Number = (this.body.GetAngle() / Math.PI) * 180;

				this.ball.x = bpX + 25;
				this.ball.y = bpY + 20;
				this.ball.rotation = br;
			}
		}
	}
}
