package bingodraw.data
{
	import bingodraw.event.ExternalInterfaceEvent;

	import com.hexagonstar.util.debug.Debug;

	import flash.events.EventDispatcher;
	import flash.external.ExternalInterface;

	/**
	 * @author ferrybrouwer
	 */
	public class ExternalInterfaceCommunication extends EventDispatcher
	{
		/*
		  _____      _ _        __                            _                   _____           _       _   
		 / ____|    | | |      / _|                          | |                 / ____|         (_)     | |  
		| |     __ _| | |___  | |_ _ __ ___  _ __ ___        | | __ ___   ____ _| (___   ___ _ __ _ _ __ | |_ 
		| |    / _` | | / __| |  _| '__/ _ \| '_ ` _ \   _   | |/ _` \ \ / / _` |\___ \ / __| '__| | '_ \| __|
		| |___| (_| | | \__ \ | | | | | (_) | | | | | | | |__| | (_| |\ V / (_| |____) | (__| |  | | |_) | |_ 
		 \_____\__,_|_|_|___/ |_| |_|  \___/|_| |_| |_|  \____/ \__,_| \_/ \__,_|_____/ \___|_|  |_| .__/ \__|
		                                                                                           | |        
		                                                                                           |_|                
		 */
		public function ExternalInterfaceCommunication()
		{
			ExternalInterface.addCallback("hideCards", hideCards);
			ExternalInterface.addCallback("showCards", showCards);
			ExternalInterface.addCallback("showBowl", showBowl);
			ExternalInterface.addCallback("addBall", addBall);
			ExternalInterface.addCallback("strikeLabelsOnCards", strikeLabelsOnCards);
		}
		
		/**
		 * Hide cards
		 * From JS
		 * @return void
		 */
		private function hideCards() : void
		{
			Debug.trace("received call from js [hideCards]");
			dispatchEvent(new ExternalInterfaceEvent(ExternalInterfaceEvent.HIDE_CARDS, true, false));
		}
		
		/**
		 * Show cards
		 * From JS
		 * @return void
		 */
		private function showCards() : void
		{
			Debug.trace("received call from js [showCards]");
			dispatchEvent(new ExternalInterfaceEvent(ExternalInterfaceEvent.SHOW_CARDS, true, false));
		}
		
		/**
		 * Show bowl
		 * From JS
		 * @return void
		 */
		private function showBowl() : void
		{
			Debug.trace("received call from js [showBowl]");
			dispatchEvent(new ExternalInterfaceEvent(ExternalInterfaceEvent.SHOW_BOWL, true, false));
		}
		
		/**
		 * Add ball to box2d
		 * From JS
		 * @param label : String
		 * @param color : uint
		 * @return void
		 */
		private function addBall(label : String, color : String) : void
		{
			Debug.trace("received call from js [addBall] with properties: \nlabel: " + label + "\ncolor: " + color);
			dispatchEvent(new ExternalInterfaceEvent(ExternalInterfaceEvent.ADD_BALL, true, false, {label:label, color:uint(color.replace('#', '0x'))}));
		}

		/**
		 * Strike labels on all cards
		 * From JS
		 * @param label : String
		 * @param color : uint
		 * @return void
		 */
		private function strikeLabelsOnCards(label : String, color : String) : void
		{
			Debug.trace("received call from js [strikeLabelsOnCards] with properties: \nlabel: " + label + "\ncolor: " + color);
			dispatchEvent(new ExternalInterfaceEvent(ExternalInterfaceEvent.STRIKE_LABELS_ON_CARDS, true, false, {label:label, color:uint(color.replace('#', '0x'))}));
		}


		/*
		  _____      _ _       _               _                   _____           _       _   
		 / ____|    | | |     | |             | |                 / ____|         (_)     | |  
		| |     __ _| | |___  | |_ ___        | | __ ___   ____ _| (___   ___ _ __ _ _ __ | |_ 
		| |    / _` | | / __| | __/ _ \   _   | |/ _` \ \ / / _` |\___ \ / __| '__| | '_ \| __|
		| |___| (_| | | \__ \ | || (_) | | |__| | (_| |\ V / (_| |____) | (__| |  | | |_) | |_ 
		 \_____\__,_|_|_|___/  \__\___/   \____/ \__,_| \_/ \__,_|_____/ \___|_|  |_| .__/ \__|
		                                                                            | |        
		                                                                            |_|        
		 */
	}
}
