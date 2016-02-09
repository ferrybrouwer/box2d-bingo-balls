package bingodraw.ui
{
	import bingodraw.event.CardEvent;

	import com.greensock.TweenLite;
	import com.greensock.easing.Back;

	import flash.display.Sprite;
	import flash.display.Stage;

	/**
	 * @author ferrybrouwer
	 */
	public class Cards extends Sprite
	{
		private var _cards : Array = [];
		private var _stage : Stage;
		private var _bingodraw : Boolean;
		private var colors : Array = ['#bdcd00', '#01b1e4', '#ec7bab', '#ec7503', '#f9b200'];
		private var days : Array = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'];

		public function Cards(_stage : Stage, bingodraw : Boolean, cards : Array)
		{
			this._stage = _stage;
			this._bingodraw = bingodraw;
			this.x = 5;

			for ( var i : int = 0; i < cards.length; i++ )
			{
				var cardData : Object = cards[i],
				color : String = (cardData.disabled || bingodraw && !cardData.claimed) ? '#cecece' : colors[i],
				card : Card = new Card(bingodraw, cardData.labels, color, days[i], cardData.claimed, cardData.disabled);
				card.addEventListener(CardEvent.BINGO, cardHandler);
				card.addEventListener(CardEvent.HITS_ON_CARD, cardHandler);
				_cards.push(card);
				addChild(card);

				// set card init properties
				// first set transform origin properties, then all other properties
				var cardProperties : Object = this.getInitProps(card);
				card.transformOriginX = cardProperties.transformOriginX;
				card.transformOriginY = cardProperties.transformOriginY;
				for ( var prop:String in cardProperties )
				{
					if ( prop !== 'transformOriginX' && prop !== 'transformOriginY' )
					{
						card[prop] = cardProperties[prop];
					}
				}
			}
		}

		/**
		 * Strike labels on all cards
		 * @param label : String
		 * @param color : uint
		 * @return void
		 */
		public function strikeLabelsOnCards(label : String, color : uint) : void
		{
			for each ( var card:Card in this._cards )
			{
				card.strikeBall(label, color);
			}
		}

		/**
		 * Card Handler
		 * @param e : CardEvent
		 * @return void
		 */
		private function cardHandler(e : CardEvent) : void
		{
			switch (e.type)
			{
				case CardEvent.BINGO:
					break;
				case CardEvent.HITS_ON_CARD:
					break;
			}
		}

		/**
		 * Show cards
		 * @return void
		 */
		public function show() : void
		{
			for each ( var card : * in _cards )
			{
				var tweenProps : Object = (!_bingodraw && !card.claimed) ? this.getOnlyDayVisibleProps(card) : this.getCardVisibleProps(card);
				TweenLite.to(card, .4, tweenProps);
			}
		}

		/**
		 * Get initialize properties
		 * Used for TweenLite properties
		 * @param card : Card
		 * @return Object
		 */
		private function getInitProps(card : Card) : Object
		{
			var index : int = _cards.indexOf(card),
			totalCards : int = 5,
			props : Object = {x:function() : Number
			{
				var margin : int = 12,
				card_width : int = card.width + margin,
				middle_x : Number = _stage.stageWidth / 2 - card_width / 2,
				offset_x : Number = middle_x - (Math.floor(totalCards / 2) * card_width);
				return Math.round(offset_x + (index * card_width));
			}, transformOrigin:function() : Object
			{
				var transform_origin_x : Number = 100 - index * (100 / (totalCards - 1));
				return {x:transform_origin_x, y:0};
			}};

			return {transformOriginX:props.transformOrigin().x, transformOriginY:props.transformOrigin().y, x:props.x(), y:300, scaleY:0, scaleX:0};
		}

		/**
		 * Get properties when card must be visible
		 * Used for TweenLite properties
		 * @param card : Card
		 * @return Object
		 */
		private function getCardVisibleProps(card : Card) : Object
		{
			var index : int = _cards.indexOf(card),
			totalCards : int = 5,
			props : Object = {rotation:function() : Number
			{
				var rotation_step : int = 3,
				start_rotation : Number = -(Math.floor(totalCards / 2) * rotation_step);
				return Math.round(start_rotation + (index * rotation_step));
			}, y:function() : Number
			{
				var y_step : Number = Math.pow(Math.abs(index - Math.floor(totalCards / 2)), 2.3);
				return 15 + (y_step * 3);
			}};
			return {rotation:props.rotation(), y:props.y(), scaleY:1, scaleX:1, ease:Back.easeOut, delay:index * .12};
		}

		/**
		 * Get properties of card when only the day must be visible
		 * Used for TweenLite properties
		 * @param card : Card
		 * @return Object
		 */
		private function getOnlyDayVisibleProps(card : Card) : Object
		{
			var index : int = _cards.indexOf(card),
			props : Object = this.getCardVisibleProps(card),
			totalCards : int = 5,
			y_step : Number = Math.pow(Math.abs(index - Math.floor(totalCards / 2)), 2.3);
			props.y += 240 - (y_step * 5);
			return props;
		}

		/**
		 * Hide cards
		 * @return void
		 */
		public function hide() : void
		{
			for ( var i : int = 0; i < this._cards.length; i++)
			{
				var card : Card = this._cards[i],
				tweenProps : Object = getInitProps(card);
				tweenProps.ease = Back.easeIn;
				tweenProps.delay = i * .1;
				
				// delete x and y properties (problem with origin transform positions)
				if ( tweenProps.hasOwnProperty('x') ){
					tweenProps.originX = _stage.stageWidth/2;
					delete tweenProps.x;
				}
				if ( tweenProps.hasOwnProperty('y') ){
					tweenProps.originY = tweenProps.y;
					delete tweenProps.y;
				}
				TweenLite.to(card, .5, tweenProps);
			}
		}
	}
}