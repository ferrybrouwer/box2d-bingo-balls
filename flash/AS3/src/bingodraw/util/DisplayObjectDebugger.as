package bingodraw.util
{
	import flash.display.DisplayObject;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.events.KeyboardEvent;
	import flash.text.TextField;
	import flash.text.TextFormat;

	/**
	 * @author Ferrybrouwer
	 * Debug Class for debugging DisplayObjects
	 * ESC key show / hide debug panel
	 * SPACE key for toggle between debug modes
	 * ARROWS key move/rotate/scale
	 * CONTROL for scale mode to keep boundings
	 * SHIFT increase the value by exponential of two
	 */
	public class DisplayObjectDebugger
	{
		public static const MOVE : String = "move";
		public static const ROTATE : String = "rotate";
		public static const SCALE : String = "scale";
		private var stage : Stage;
		private var obj : DisplayObject;
		private var shiftState : Boolean;
		private var ctrlState : Boolean;
		private var debugPanel : Sprite;
		private var debugTextfield : TextField;
		private var type : String;
		private var typeArr : Array = [MOVE, ROTATE, SCALE];
		private var typeArr_index : int = 0;
		private var showPanel : Boolean = true;

		public function DisplayObjectDebugger(stage : Stage)
		{
			this.stage = stage;
		}

		public function debug(obj : DisplayObject, debugPanel : Boolean = true) : void
		{
			this.obj = obj;
			this.type = MOVE;
			stage.addEventListener(KeyboardEvent.KEY_DOWN, onKeyDown);
			stage.addEventListener(KeyboardEvent.KEY_UP, onKeyUp);

			if (debugPanel)
			{
				// create debug panel
				this.debugPanel = new Sprite();
				with (this.debugPanel.graphics)
				{
					beginFill(0xFFFFFF, .7);
					drawRect(0, 0, stage.stageWidth, 15);
					endFill();
				}

				// create textfields
				debugTextfield = new TextField();
				this.debugPanel.addChild(debugTextfield);
				debugText("Debugmode: " + type.toUpperCase());

				// add to stage
				stage.addChild(this.debugPanel);
			}
		}

		private function onKeyUp(event : KeyboardEvent) : void
		{
			if (event.keyCode == 16) shiftState = false;
			if (event.keyCode == 17) ctrlState = false;
			if (event.keyCode == 27)
			{
				showPanel = !showPanel;
				debugPanel.visible = showPanel;
			}
		}

		private function onKeyDown(event : KeyboardEvent) : void
		{
			if (event.keyCode == 32)
			{
				// SPACE toggle between types
				typeArr_index = (typeArr_index == typeArr.length - 1) ? 0 : typeArr_index + 1;
				type = typeArr[typeArr_index];
				debugText("Debugmode: " + type.toUpperCase() + ", x:" + obj.x + ", y:" + obj.y + ", rotation:" + obj.rotation + ", scaleX:" + obj.scaleX + ", scaleY:" + obj.scaleY);
				trace("Debugmode: " + type.toUpperCase() + " ------- \n     x:" + obj.x + "\n     y:" + obj.y + "\n     rotation:" + obj.rotation + "\n     scaleX:" + obj.scaleX + "\n     scaleY:" + obj.scaleY);
			}
			else
			{
				switch (type)
				{
					case MOVE:
						switch (event.keyCode)
						{
							case 37:
								obj.x -= (shiftState) ? 10 : 1;
								break;
							// left
							case 39:
								obj.x += (shiftState) ? 10 : 1;
								break;
							// right
							case 38:
								obj.y -= (shiftState) ? 10 : 1;
								break;
							// up
							case 40:
								obj.y += (shiftState) ? 10 : 1;
								break;
							// down
							case 16:
								shiftState = true;
								break; // shift
						}
						debugText("Debugmode: " + type.toUpperCase() + ", x:" + obj.x + ", y:" + obj.y);
						break;
					case ROTATE:
						switch (event.keyCode)
						{
							case 37:
								obj.rotation -= (shiftState) ? 10 : 1;
								break;
							// left
							case 39:
								obj.rotation += (shiftState) ? 10 : 1;
								break;
							// right
							case 16:
								shiftState = true;
								break; // shift
						}
						debugText("Debugmode: " + type.toUpperCase() + ", rotation:" + obj.rotation);
						break;
					case SCALE:
						switch (event.keyCode)
						{
							case 37:
								// left
								obj.scaleX -= (shiftState) ? 1 : .1;
								if (ctrlState) obj.scaleY -= (shiftState) ? 1 : .1;
								break;
							case 39:
								// right
								obj.scaleX += (shiftState) ? 1 : .1;
								if (ctrlState) obj.scaleY += (shiftState) ? 1 : .1;
								break;
							case 40:
								// down
								obj.scaleY -= (shiftState) ? 1 : .1;
								if (ctrlState) obj.scaleX -= (shiftState) ? 1 : .1;
								break;
							case 38:
								// up
								obj.scaleY += (shiftState) ? 1 : .1;
								if (ctrlState) obj.scaleX += (shiftState) ? 1 : .1;
								break;
							case 16:
								shiftState = true;
								break;
							// shift
							case 17:
								ctrlState = true;
								break; // control
						}
						debugText("Debugmode: " + type.toUpperCase() + ", scaleX:" + obj.scaleX + ", scaleY:" + obj.scaleY);
						break;
				}
			}
		}

		/**
		 * Set text in debugPanel
		 */
		private function debugText(str : String) : void
		{
			debugTextfield.text = str;
			var tf_format : TextFormat = new TextFormat();
			with (tf_format)
			{
				color = 0x000000;
				font = "Courier";
				size = 11;
			}
			debugTextfield.setTextFormat(tf_format);
			debugTextfield.width = debugTextfield.textWidth + 5;
		}
	}
}
