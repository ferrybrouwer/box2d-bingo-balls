package bingodraw.ui
{
	import flashx.textLayout.formats.TextAlign;

	import mx.core.BitmapAsset;

	import flash.display.Shape;
	import flash.display.Sprite;

	/**
	 * @author ferrybrouwer
	 */
	public class Ball extends Sprite
	{
		private var label : String;
		private var color : uint;
		
		[Embed(source="../assets/ball-shadow.png")]
		private static var shadowAsset : Class;

		/**
		 * Ball constructor
		 * @param label : String
		 * @param color : uint
		 */
		public function Ball(label : String, color : uint)
		{
			this.label = label;
			this.color = color;

			// add shape
			addChild(getBallShape());
			addChild(getLabel());

			// add shadow as bitmap asset (instead of DropShadowFilter for performance improvement)
			var b : BitmapAsset = new shadowAsset() as BitmapAsset;
			b.smoothing = true;
			b.x = -20;
			b.y = -20;
			addChild(b);
		}

		/**
		 * Get ball shape
		 * @return Shape
		 */
		private function getBallShape() : Shape
		{
			var s : Shape = new Shape();

			// draw the outer colored circle
			s.graphics.beginFill(color);
			s.graphics.drawCircle(0, 0, 20);
			s.graphics.endFill();

			// draw the inner white circle
			s.graphics.beginFill(0xffffff);
			s.graphics.drawCircle(2, 2, 13);
			s.graphics.endFill();
			return s;
		}

		private function getLabel() : OpenSansTextField
		{
			var tf : OpenSansTextField = new OpenSansTextField();
			tf.text = label;
			tf.color = (this.color === 0xcecece) ? 0xcecece : 0x000000;
			tf.bold = true;
			tf.size = 14;
			tf.width = 40;
			tf.align = TextAlign.CENTER;
			tf.x = -18;
			tf.y = -10;
			return tf;
		}
	}
}
