package bingodraw.event
{
	import flash.events.Event;

	/**
	 * @author ferrybrouwer
	 */
	public class CardEvent extends Event
	{
		public static const BINGO : String = "bingo";
		public static const HITS_ON_CARD : String = "hitsOnCard";
		public var points : Number;

		public function CardEvent(type : String, bubbles : Boolean = false, cancelable : Boolean = false, points : Number = Number.NaN)
		{
			super(type, bubbles, cancelable);
			points = this.points;
		}

		public override function clone() : Event
		{
			return new CardEvent(type, bubbles, cancelable, points);
		}

		public override function toString() : String
		{
			return formatToString("CardEvent", "type", "bubbles", "cancelable", "eventPhase", "points");
		}
	}
}
