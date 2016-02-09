package bingodraw.ui
{
	import bingodraw.event.CardEvent;

	import com.greensock.TweenLite;
	import com.greensock.easing.Elastic;

	import mx.core.BitmapAsset;

	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.filters.DropShadowFilter;
	import flash.text.TextFormatAlign;

	/**
	 * @author ferrybrouwer
	 */
	public class Card extends Sprite
	{
		private var labels : Array;
		private var strikedLabels : Array = [];
		private var container : Sprite = new Sprite();
		private var _transformOriginX : Number = 0;
		private var _transformOriginY : Number = 0;
		private var bingodraw : Boolean;
		public var color : uint;
		public var day : String;
		public var claimed : Boolean;
		public var disabled : Boolean;
		[Embed(source="../assets/bingo.png")]
		private static var bingoAsset : Class;

		public function Card(bingodraw : Boolean, labels : Array, color : String, day : String, claimed : Boolean, disabled : Boolean)
		{
			this.bingodraw = bingodraw;
			this.labels = labels;
			this.color = uint(color.replace('#', '0x'));
			this.day = day;
			this.claimed = claimed;
			this.disabled = disabled;

			// draw basic card shapes
			container.graphics.beginFill(this.color);
			container.graphics.drawRoundRect(0, 0, 187, 350, 15);
			container.graphics.endFill();

			// draw white background / black lines and card title
			container.addChild(getWhiteBackground());
			container.addChild(getBlackLines());
			container.addChild(getCardTitle());
			container.addChild(getLabels());

			// show cross if color is grey
			if ( this.color === 0xcecece && this.bingodraw )
			{
				container.addChild(getCross());
			}

			// add container for changing transform origin X and Y values
			addChild(container);

			// add shadow
			this.filters = [new DropShadowFilter(3, 135, 0, .3, 10, 10)];
		}

		/**
		 * Strike label
		 * @param label : String
		 * @param color	: uint
		 * @return void
		 */
		public function strikeBall(label : String, color : uint) : void
		{
			// overwrite ball color when card is grey
			if ( this.color === 0xcecece )
			{
				color = this.color;
			}
			
			// get only labels values of the objects in strikedLabels
			var pluckedStrikedLabels : Array = [];
			for each ( var obj:Object in strikedLabels )
			{
				pluckedStrikedLabels.push(obj.label);
			}

			// strike only if label isn't in the striked labels
			// strike only if label is found in given labels array
			if ( strikedLabels.indexOf(label) === -1 && this.labels.indexOf(label) !== -1 )
			{
				strikedLabels.push({label:label, color:color});
				pluckedStrikedLabels.push(label);

				// update points last label
				var hitsOnCard : int = 0;
				for ( var i : int = 0; i < this.labels.length; i++ )
				{
					if ( this.labels[i] === label )
					{
						hitsOnCard++;
						showBall(label, color, i);
					}
				}
				
				if ( this.claimed && !this.disabled )
				{
					// get labels remain
					var labelsRemain : Array = [];
					for each ( var _l:String in this.labels )
					{
						if ( pluckedStrikedLabels.indexOf(_l) === -1 )
						{
							labelsRemain.push(_l);
						}
					}
				
					// if all labels are striked (no labels remain to strike), show bingo
					if ( labelsRemain.length === 0 )
					{
						showBingoAsset();
						dispatchEvent(new CardEvent(CardEvent.BINGO, true));
					}
					
					// dispatch hits on card
					dispatchEvent(new CardEvent(CardEvent.HITS_ON_CARD, true, false, hitsOnCard));
				}
			}
		}

		/**
		 * Show bingo asset
		 * @return void
		 */
		public function showBingoAsset() : void
		{
			var s : Sprite = new Sprite();
			var b : BitmapAsset = new bingoAsset() as BitmapAsset;
			b.smoothing = true;
			b.x = -b.width / 2;
			b.y = -b.height / 2;
			s.addChild(b);
			s.x = 95;
			s.y = 120;
			container.addChild(s);

			TweenLite.from(s, .8, {scaleX:0, scaleY:0, ease:Elastic.easeOut, delay:.4});
		}

		/**
		 * Show ball on card
		 * @param label : String
		 * @param color : uint
		 * @param index : int
		 * @return void
		 */
		public function showBall(label : String, color : uint, index : int) : void
		{
			// add ball to card
			var ball : Ball = new Ball(label, color);
			ball.rotation = -20 + (Math.random() * 40);
			Sprite(container.getChildByName('labels')).addChild(ball);

			// position
			var rowIndex : int = Math.floor(index / 3),
			columnIndex : int = index % 3;

			ball.x = columnIndex * 49 + 25;
			ball.y = rowIndex * 49 + 16;

			// animate in
			TweenLite.from(ball, .8, {scaleX:0, scaleY:0, ease:Elastic.easeOut});
		}

		/**
		 * Set transform origin X
		 * @param val : Number
		 * @return void
		 */
		public function set transformOriginX(val : Number) : void
		{
			_transformOriginX = val;
		}

		/**
		 * Get transform origin X
		 * @return Number
		 */
		public function get transformOriginX() : Number
		{
			return _transformOriginX;
		}

		/**
		 * Set transform origin Y
		 * @param val : Number
		 * @return void
		 */
		public function set transformOriginY(val : Number) : void
		{
			_transformOriginY = val;
		}

		/**
		 * Get transform origin Y
		 * @return Number
		 */
		public function get transformOriginY() : Number
		{
			return _transformOriginY;
		}

		/**
		 * Override x value 
		 * Calculate with origin transform X
		 * @param val : Number
		 * @return void
		 */
		public override function set x(val : Number) : void
		{
			super.x = val + _transformOriginX;
			container.x = -_transformOriginX;
		}

		/**
		 * Override y value
		 * Calculate with origin transform Y
		 * @param val : Number
		 * @return void
		 */
		public override function set y(val : Number) : void
		{
			super.y = val + _transformOriginY;
			container.y = -_transformOriginY;
		}

		/**
		 * Set only super y
		 * @param val : Number
		 * @return void
		 */
		public function set originY(val : Number) : void
		{
			super.y = val;
		}

		public function get originY() : Number
		{
			return super.y;
		}

		public function get originX() : Number
		{
			return super.x;
		}

		/**
		 * Set only super x
		 * @param val : Number
		 * @return void
		 */
		public function set originX(val : Number) : void
		{
			super.x = val;
		}

		/**
		 * Get card title textfield with embedded open sans font
		 * @return OpenSansTextField
		 */
		public function getCardTitle() : OpenSansTextField
		{
			var tf : OpenSansTextField = new OpenSansTextField();
			with (tf)
			{
				color = this.color;
				bold = true;
				size = 18;
				text = this.day.toUpperCase();
				width = tf.textWidth + 5;
				x = 16;
				y = 15;
			}
			return tf;
		}

		/**
		 * Get white background
		 * @return Shape
		 */
		private function getWhiteBackground() : Shape
		{
			var innerWhite : Shape = new Shape();
			innerWhite.graphics.beginFill(0xffffff);
			innerWhite.graphics.drawRoundRect(0, 0, 167, 197, 15);
			innerWhite.graphics.endFill();
			innerWhite.x = innerWhite.y = 10;
			return innerWhite;
		}

		/**
		 * Draw black lines
		 * @return Shape
		 */
		private function getBlackLines() : Shape
		{
			var blackLines : Shape = new Shape();
			blackLines.graphics.lineStyle(1);

			// x line 1
			blackLines.graphics.moveTo(11, 89);
			blackLines.graphics.lineTo(158, 89);

			// x line 2
			blackLines.graphics.moveTo(11, 138);
			blackLines.graphics.lineTo(158, 138);

			// y line 1
			blackLines.graphics.moveTo(60, 41);
			blackLines.graphics.lineTo(60, 188);

			// y line 2
			blackLines.graphics.moveTo(109, 41);
			blackLines.graphics.lineTo(109, 188);

			// position
			blackLines.x = 9;
			blackLines.y = 11;

			return blackLines;
		}

		/**
		 * Get labels
		 * @return Sprite
		 */
		private function getLabels() : Sprite
		{
			var c : Sprite = new Sprite();
			c.name = "labels";

			var columns : int = 3,
			rows : int = 3;

			for (var i : int = 0; i < this.labels.length; i++)
			{
				var rowIndex : int = Math.floor(i / rows),
				columnIndex : int = i % columns;

				var t : OpenSansTextField = new OpenSansTextField();
				t.text = this.labels[i];
				t.color = 0x000000;
				t.bold = true;
				t.size = 18;
				t.width = 49;
				t.align = TextFormatAlign.CENTER;
				t.x = columnIndex * 49;
				t.y = rowIndex * 49;
				c.addChild(t);
			}
			c.x = 20;
			c.y = 60;
			return c;
		}

		/**
		 * Get cross shape
		 * @return Sprite
		 */
		private function getCross() : Sprite
		{
			var s : Sprite = new Sprite();

			// first rectangle of cross
			var rect1 : Shape = new Shape();
			rect1.graphics.beginFill(0xdb3d03);
			rect1.graphics.drawRect(-85, -4, 170, 8);
			rect1.graphics.endFill();
			rect1.rotation = 45;
			s.addChild(rect1);

			// second rectangle of cross
			var rect2 : Shape = new Shape();
			rect2.graphics.beginFill(0xdb3d03);
			rect2.graphics.drawRect(-85, -4, 170, 8);
			rect2.graphics.endFill();
			rect2.rotation = -45;
			s.addChild(rect2);

			s.x = 93;
			s.y = 124;
			return s;
		}
	}
}
