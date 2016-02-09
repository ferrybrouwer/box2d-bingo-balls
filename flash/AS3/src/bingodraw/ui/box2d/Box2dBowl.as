package bingodraw.ui.box2d
{
	import Box2D.Common.Math.b2Vec2;
	import Box2D.Dynamics.b2DebugDraw;
	import Box2D.Dynamics.b2World;

	import flash.display.Sprite;
	import flash.events.Event;

	/**
	 * @author ferrybrouwer
	 */
	public class Box2dBowl extends Sprite
	{
		public static const SCALE : int = 30;
		private var _width : Number;
		private var _height : Number;
		private var world : b2World;
		private var _debug : Boolean = false;
		private var balls : Array = [];
		private var ground : Box2dGround;

		public function Box2dBowl(_width : Number, _height : Number)
		{
			world = _getWorld(0, 10);
			this._width = _width;
			this._height = _height;
			ground = new Box2dGround(world, _width, _height);
		}

		/**
		 * Get Box2d World
		 * @param int gravity_x
		 * @param int gravity_y
		 * @return b2World
		 */
		private function _getWorld(gravity_x : int, gravity_y : int) : b2World
		{
			var gravity : b2Vec2 = new b2Vec2(gravity_x || 0, gravity_y || 10),
			sleep : Boolean = true;

			return new b2World(gravity, sleep);
		}

		/**
		 * Add ball to box2d world
		 * @param label : String
		 * @param color : uint
		 * @return void
		 */
		public function addBall(label : String, color : uint) : void
		{
			var ball : Box2dBall = new Box2dBall(world, label, color);
			balls.push(ball);
			addChild(ball);
		}

		/**
		 * Setter debug property
		 * @param val : Boolean
		 */
		public function set debug(val : Boolean) : void
		{
			_debug = val;

			if ( _debug )
			{
				// add debug sprite
				var debugSprite : Sprite = new Sprite();
				addChild(debugSprite);

				// setup debug draw in box2d
				var debugDraw : b2DebugDraw = new b2DebugDraw();
				debugDraw.SetSprite(debugSprite);
				debugDraw.SetDrawScale(SCALE);
				debugDraw.SetLineThickness(1.0);
				debugDraw.SetAlpha(1);
				debugDraw.SetFillAlpha(0.4);
				debugDraw.SetFlags(b2DebugDraw.e_shapeBit);
				world.SetDebugDraw(debugDraw);
			}
		}

		/**
		 * Getter debug property
		 * @return Boolean
		 */
		public function get debug() : Boolean
		{
			return _debug;
		}

		/**
		 * Update world
		 * @return void
		 */
		public function updateWorld() : void
		{
			this.addEventListener(Event.ENTER_FRAME, enterFrameHandler);
		}

		/**
		 * Stop update world
		 * @return void
		 */
		public function stopUpdateWorld() : void
		{
			if ( this.hasEventListener(Event.ENTER_FRAME) )
			{
				this.removeEventListener(Event.ENTER_FRAME, enterFrameHandler);
			}
		}

		/**
		 * EnterFrame eventHandler
		 * @param event : Event
		 * @return void
		 */
		private function enterFrameHandler(event : Event) : void
		{
			// update ball positions
			for ( var i : int = 0; i < this.balls.length; i++ )
			{
				this.balls[i].update();
			}

			// update the world
			var timeStep : Number = 1 / 30,
			velocityIterations : int = 6,
			positionIterations : int = 2;

			world.Step(timeStep, velocityIterations, positionIterations);
			world.ClearForces();
			if ( this.debug )
			{
				this.world.DrawDebugData();
			}
		}
	}
}
