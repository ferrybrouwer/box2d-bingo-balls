package bingodraw
{
	import bingodraw.event.ExternalInterfaceEvent;
	import bingodraw.ui.Bowl;
	import bingodraw.ui.Cards;
	import com.hexagonstar.util.debug.Debug;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.external.ExternalInterface;
	import flash.utils.setTimeout;

	/**
	 * AppController Class
	 * This class controlls every model- and userinteraction
	 */
	public class AppController extends Sprite
	{
		private var model : Model;
		private var bowl : Bowl;
		private var cards : Cards;

		public function AppController(model : Model)
		{
			this.model = model;

			// attach external interface events
			if ( ExternalInterface.available )
			{
				this.model.externalInterface.addEventListener(ExternalInterfaceEvent.SHOW_BOWL, externalInterfaceHandler);
				this.model.externalInterface.addEventListener(ExternalInterfaceEvent.ADD_BALL, externalInterfaceHandler);
				this.model.externalInterface.addEventListener(ExternalInterfaceEvent.STRIKE_LABELS_ON_CARDS, externalInterfaceHandler);
				this.model.externalInterface.addEventListener(ExternalInterfaceEvent.HIDE_CARDS, externalInterfaceHandler);
				this.model.externalInterface.addEventListener(ExternalInterfaceEvent.SHOW_CARDS, externalInterfaceHandler);
			}

			// add blue background
			var background : Shape = new Shape();
			background.graphics.beginFill(0x01b1e4);
			background.graphics.drawRect(0, 0, model.stage.stageWidth, model.stage.stageHeight);
			background.graphics.endFill();
			addChild(background);

			// add cards
			this.cards = new Cards(model.stage, model.bingoData().bingodraw, model.bingoData().cards);
			addChild(this.cards);

			// add bowl
			this.bowl = new Bowl(model.stage.stageWidth, 135);
			this.bowl.y = model.stage.stageHeight - 125;
			addChild(this.bowl);

			// run a test
//			cards.show();
//			executeTest();
		}

		/**
		 * External interface handler
		 * @param event : ExternalInterfaceEvent
		 * @return void
		 */
		private function externalInterfaceHandler(event : ExternalInterfaceEvent) : void
		{
			switch (event.type)
			{
				case ExternalInterfaceEvent.SHOW_BOWL:
					bowl.show();
					break;
				case ExternalInterfaceEvent.ADD_BALL:
					bowl.addBall(event.properties.label, event.properties.color);
					break;
				case ExternalInterfaceEvent.STRIKE_LABELS_ON_CARDS:
					cards.strikeLabelsOnCards(event.properties.label, event.properties.color);
					break;
				case ExternalInterfaceEvent.HIDE_CARDS:
					cards.hide();
					bowl.stopUpdateWorld();
					break;
				case ExternalInterfaceEvent.SHOW_CARDS:
					cards.show();
					break;
			}
		}

		/**
		 * Execute test
		 * @return void
		 */
		private function executeTest() : void
		{
			var balls : Array = model.bingoData().balls,
			colors : Array = [0xbdcd00, 0x01b1e4, 0xec7bab, 0xec7503, 0xf9b200],
			showBowl : Function = function() : void
			{
				bowl.show();
				for ( var i : int = 0; i < balls.length; i++ )
				{
					var ball : String = balls[i],
					color : uint = colors[Math.floor(Math.random() * colors.length)];

					addBall(ball, color, i);
				}
			},
			addBall : Function = function(label : String, color : uint, index : int) : void
			{
				var strikeLabels : Function = function() : void
				{
					cards.strikeLabelsOnCards(label, color);
				},
				addBox2dBall : Function = function() : void
				{
					bowl.addBall(label, color);
					setTimeout(strikeLabels, 2000);
				};
				setTimeout(addBox2dBall, 3000 * index);
			};

			setTimeout(showBowl, 1000);
		}
	}
}
	