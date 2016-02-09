package bingodraw.event
{
	import flash.events.Event;

	/**
	 * @author ferrybrouwer
	 */
	public class ExternalInterfaceEvent extends Event
	{
		public static const ADD_BALL : String = "addBall";
		public static const STRIKE_LABELS_ON_CARDS : String = "strikeLabelsOnCards";
		public static const SHOW_BOWL : String = "showBowl";
		public static const HIDE_CARDS : String = "hideCards";
		public static const SHOW_CARDS : String = "showCards";
		public var properties : Object;

		public function ExternalInterfaceEvent(type : String, bubbles : Boolean = false, cancelable : Boolean = false, properties : Object = null)
		{
			super(type, bubbles, cancelable);
			this.properties = properties;
		}

		public override function clone() : Event
		{
			return new ExternalInterfaceEvent(type, bubbles, cancelable, properties);
		}

		public override function toString() : String
		{
			return formatToString("ExternalInterfaceEvent", "type", "bubbles", "cancelable", "eventPhase", "properties");
		}
	}
}
