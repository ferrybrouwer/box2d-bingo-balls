package bingodraw.ui
{
	import bingodraw.ui.box2d.Box2dBowl;

	import com.greensock.TweenLite;
	import com.greensock.easing.Elastic;

	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.filters.DropShadowFilter;

	/**
	 * @author ferrybrouwer
	 */
	public class Bowl extends Sprite
	{
		public var _width : Number;
		public var _height : Number;
		private var box2d : Box2dBowl;
		private var bowlSprite : Sprite;
		private var bowlWhiteSPrite : Sprite;

		/**
		 * Bowl Constructor
		 * @param width : Number
		 * @param height : Number
		 */
		public function Bowl(_width : Number, _height : Number)
		{
			this._width = _width;
			this._height = _height;

			// draw shapes
			_drawBowlWhiteSprite();
			_drawBowlSprite();

			// add box2d physics world
			box2d = new Box2dBowl(_width, _height);
			box2d.debug = false;
			addChild(box2d);
		}

		/**
		 * Draw the bowl white sprite
		 * @return void
		 */
		private function _drawBowlWhiteSprite() : void
		{
			bowlWhiteSPrite = new Sprite();
			bowlWhiteSPrite.addChild(getCurveWhite());
			bowlWhiteSPrite.y = _height;
			bowlWhiteSPrite.filters = [new DropShadowFilter(3, 0, 0, .4, 12, 12)];
			addChild(bowlWhiteSPrite);
		}

		/**
		 * Draw the bowl sprite
		 * @return void
		 */
		private function _drawBowlSprite() : void
		{
			bowlSprite = new Sprite();
			bowlSprite.addChild(getCurveGrey());
			bowlSprite.addChild(getCurveWhite());
			bowlSprite.y = _height;
			bowlSprite.scaleY = 0;
			bowlSprite.alpha = 0;
			bowlSprite.filters = [new DropShadowFilter(3, 0, 0, .4, 12, 12)];
			addChild(bowlSprite);
		}

		/**
		 * Add ball to box2d
		 * @param label : String
		 * @param color : uint
		 */
		public function addBall(label : String, color : uint) : void
		{
			box2d.addBall(label, color);
		}

		/**
		 * Show bowl
		 * Start updating world box2d positions
		 * @return void
		 */
		public function show() : void
		{
			box2d.updateWorld();
			TweenLite.to(bowlSprite, 1.4, {scaleY:1, alpha:1, ease:Elastic.easeInOut});
		}
		
		/**
		 * Stop update world
		 * @return void
		 */
		public function stopUpdateWorld() : void
		{
			box2d.stopUpdateWorld();
		}

		/**
		 * Get curve shape white
		 * @return Shape
		 */
		private function getCurveWhite() : Shape
		{
			var s : Shape = new Shape();
			s.graphics.beginFill(0xffffff);
			s.graphics.moveTo(0, 44);
			s.graphics.curveTo(_width / 2, _height + 44, _width, 44);
			s.graphics.lineTo(_width, _height);
			s.graphics.lineTo(0, _height);
			s.graphics.lineTo(0, 44);
			s.y = -_height;
			return s;
		}

		/**
		 * Get curved shape grey
		 * @return Shape
		 */
		private function getCurveGrey() : Shape
		{
			var s : Shape = new Shape();
			s.graphics.beginFill(0xf4f4f4);
			s.graphics.moveTo(0, 0);
			s.graphics.curveTo(_width / 2, _height, _width, 0);
			s.graphics.lineTo(_width, _height);
			s.graphics.lineTo(0, _height);
			s.graphics.lineTo(0, 0);
			s.y = -_height;
			return s;
		}
	}
}
