package bingodraw.ui.box2d
{
	import Box2D.Dynamics.b2FixtureDef;
	import Box2D.Collision.Shapes.b2PolygonShape;
	import Box2D.Common.Math.b2Vec2;
	import Box2D.Dynamics.b2Body;
	import Box2D.Dynamics.b2BodyDef;
	import Box2D.Dynamics.b2World;

	import flash.display.Sprite;

	/**
	 * @author ferrybrouwer
	 */
	public class Box2dGround extends Sprite
	{
		private var world : b2World;
		private var bodies : Array;
		private var _width : Number;
		private var _height : Number;
		private var _x : Number;
		private var _y : Number;

		public function Box2dGround(world : b2World, _width : Number, _height : Number)
		{
			this.world = world;
			this._width = _width;
			this._height = _height;

			this._buildBodies();
			this.x = 0;
			this.y = 44;
		}

		/**
		 * Draw vector in body
		 * @param points : Array
		 * @return void
		 */
		private function drawVectorInBody(body : b2Body, points : Array) : void
		{
			var lastPoint : Object;

			for each ( var obj:Object in points )
			{
				if (lastPoint)
				{
					var edgeShape : b2PolygonShape = new b2PolygonShape(),
					fromVector : b2Vec2 = new b2Vec2(lastPoint.x / Box2dBowl.SCALE, lastPoint.y / Box2dBowl.SCALE),
					toVector : b2Vec2 = new b2Vec2(obj.x / Box2dBowl.SCALE, obj.y / Box2dBowl.SCALE);
					edgeShape.SetAsEdge(fromVector, toVector);
					body.CreateFixture2(edgeShape);
				}
				lastPoint = obj;
			}
		}

		/**
		 * Build all static bodies
		 * @return void
		 */
		private function _buildBodies() : void
		{
			this.bodies = [];
			this.bodies.push(this._createCurvedStaticBody('bottom', this._height - 45));
			this.bodies.push(this._createCurvedStaticBody('top', this._height - 45));
			this.bodies.push(this._createRightWall('rightwall'));
			this.bodies.push(this._createLeftWall('leftwall'));
		}

		/**
		 * Destroy all bodies from world
		 * @return void
		 */
		private function _destroyAllBodiesFromWorld() : void
		{
			for each ( var body:b2Body in this.bodies )
			{
				this.world.DestroyBody(body);
			}
		}

		/**
		 * Create static curved body
		 * @param id : String
		 * @param controllY : int
		 * @return b2Body
		 */
		private function _createCurvedStaticBody(id : String, controllY : int) : b2Body
		{
			// create body definition
			var bd : b2BodyDef = new b2BodyDef();
			bd.type = b2Body.b2_staticBody;
			bd.userData = {id:id};

			var points : Array = [],
			points_x : Array = [];

			for (var i : int = 0; i < 4; i++)
			{
				var x : Number = ((this.width / 3) * i);
				points_x.push(x);
			}

			var pontoA : b2Vec2 = new b2Vec2(points_x[0], 0),
			pontoB : b2Vec2 = new b2Vec2(points_x[1], controllY),
			pontoC : b2Vec2 = new b2Vec2(points_x[2], controllY),
			pontoD : b2Vec2 = new b2Vec2(points_x[3], 0),
			x2 : Number, 
			y2 : Number;

			for (var t : Number = 0; t < 1.01; t += 0.01)
			{
				var ax : Number = Math.pow((1 - t), 3) * pontoA.x,
				ay : Number = Math.pow((1 - t), 3) * pontoA.y,
				bx : Number = 3 * t * Math.pow((1 - t), 2) * pontoB.x,
				by : Number = 3 * t * Math.pow((1 - t), 2) * pontoB.y,
				cx : Number = 3 * Math.pow(t, 2) * (1 - t) * pontoC.x,
				cy : Number = 3 * Math.pow(t, 2) * (1 - t) * pontoC.y,
				dx : Number = Math.pow(t, 3) * pontoD.x,
				dy : Number = Math.pow(t, 3) * pontoD.y;

				x2 = ax + bx + cx + dx;
				y2 = ay + by + cy + dy;
				points.push({x:x2, y:y2});
			}

			// shrimp existing points
			var newPoints : Array = [];
			for (var c : int = 0; c < points.length; c++)
			{
				if (c == 0 || c == points.length - 1 || c == (points.length - 1) / 2)
				{
					newPoints.push(points[c]);
				}
				else
				{
					if (c % 20 == 0)
					{
						newPoints.push(points[c]);
					}
				}
			}
			points = newPoints;

			// return body which contains a vector shape drawn points
			var body : b2Body = this.world.CreateBody(bd);
			drawVectorInBody(body, points);
			return body;
		}

		/**
		 * Create left wall inserting balls static body
		 * @param id : String
		 * @return b2Body
		 */
		private function _createLeftWall(id : String) : b2Body
		{
			// create body definition
			var bd : b2BodyDef = new b2BodyDef();
			bd.type = b2Body.b2_staticBody;
			bd.userData = {id:id};

			// position
			bd.position.x = -100 / Box2dBowl.SCALE;
			bd.position.y = (this.height + 70) / Box2dBowl.SCALE;

			// return body which contains a vector shape drawn points
			var body : b2Body = this.world.CreateBody(bd);
			drawVectorInBody(body, [{x:0, y:-100}, {x:10, y:0}, {x:15, y:20}, {x:25, y:40}, {x:40, y:60}, {x:60, y:70}, {x:100, y:80}]);
			return body;
		}

		/**
		 * Create right wall stop ball from falling out of screen
		 * @param id : String
		 * @return b2Body
		 */
		private function _createRightWall(id : String) : b2Body
		{
			// create body definition
			var bd : b2BodyDef = new b2BodyDef();
			bd.type = b2Body.b2_staticBody;
			bd.userData = {id:id};

			// position
			bd.position.x = (this.width + 10) / Box2dBowl.SCALE;
			bd.position.y = (this.height + 70) / Box2dBowl.SCALE;

			// create fixture and set shape polygonshape (box) to it
			var pd : b2PolygonShape = new b2PolygonShape();
			pd.SetAsBox(10 / Box2dBowl.SCALE, 35 / Box2dBowl.SCALE);
			var fd : b2FixtureDef = new b2FixtureDef();
			fd.shape = pd;

			// append body definition to the world (creating the body)
			var body : b2Body = this.world.CreateBody(bd);
			body.CreateFixture(fd);

			return body;
		}

		/**
		 * Override setter x method
		 * Set x positions of all ground bodies
		 * @param val : Number
		 * @return void
		 */
		public override function set x(val : Number) : void
		{
			_x = val;

			for each ( var body:b2Body in this.bodies )
			{
				switch (body.GetUserData().id)
				{
					case 'bottom':
						body.SetPosition(new b2Vec2(val / Box2dBowl.SCALE, body.GetPosition().y));
						break;
					case 'top':
						body.SetPosition(new b2Vec2(val / Box2dBowl.SCALE, body.GetPosition().y));
						break;
					case 'rightwall':
						body.SetPosition(new b2Vec2((this.width + val + 10) / Box2dBowl.SCALE, body.GetPosition().y));
						break;
					case 'leftwall':
						body.SetPosition(new b2Vec2((val - 100) / Box2dBowl.SCALE, body.GetPosition().y));
						break;
				}
			}
		}

		/**
		 * Override getter x method
		 * Get x position
		 * @return Number
		 */
		public override function get x() : Number
		{
			return _x || super.x;
		}

		/**
		 * Override setter y method
		 * @param val : Number
		 * @return void
		 */
		public override function set y(val : Number) : void
		{
			_y = val;

			for each ( var body:b2Body in this.bodies )
			{
				switch (body.GetUserData().id)
				{
					case 'bottom':
						body.SetPosition(new b2Vec2(body.GetPosition().x, (val + 1) / Box2dBowl.SCALE));
						break;
					case 'top':
						body.SetPosition(new b2Vec2(body.GetPosition().x, (val - 42) / Box2dBowl.SCALE));
						break;
					case 'rightwall':
						body.SetPosition(new b2Vec2(body.GetPosition().x, (val - 30) / Box2dBowl.SCALE));
						break;
					case 'leftwall':
						body.SetPosition(new b2Vec2(body.GetPosition().x, (val - 80) / Box2dBowl.SCALE));
						break;
				}
			}
		}

		/**
		 * Override getter y method
		 * Get y position
		 * @return Number
		 */
		public override function get y() : Number
		{
			return _y || super.y;
		}

		/**
		 * Override setter width method
		 * @param val : Number
		 * @return void
		 */
		public override function set width(val : Number) : void
		{
			_width = val;

			this._destroyAllBodiesFromWorld();
			this._buildBodies();
		}

		/**
		 * Override getter width method
		 * Get width
		 * @return Number
		 */
		public override function get width() : Number
		{
			return _width || super.width;
		}

		/**
		 * Override setter height method
		 * @param val : Number
		 * @return void
		 */
		public override function set height(val : Number) : void
		{
			_height = val;

			this._destroyAllBodiesFromWorld();
			this._buildBodies();
		}

		/**
		 * Override getter height method
		 * Get height
		 * @return Number
		 */
		public override function get height() : Number
		{
			return _height || super.height;
		}
	}
}
