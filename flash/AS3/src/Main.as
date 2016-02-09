package
{
	import bingodraw.AppController;
	import bingodraw.Model;
	import bingodraw.util.Version;

	import com.adobe.serialization.json.JSONDecoder;
	import com.hexagonstar.util.debug.Debug;

	import flash.display.Sprite;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.Event;
	import flash.events.TimerEvent;
	import flash.system.Security;
	import flash.utils.Timer;

	[SWF(backgroundColor="0x000000", frameRate="60", width="1600", height="320")]
	public class Main extends Sprite
	{
		public function Main()
		{
			// set security
			Security.allowDomain("*");
			Security.allowInsecureDomain("*");

			// set stage properties
			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.align = StageAlign.TOP_LEFT;

			// check when stage is ready
			addEventListener(Event.ADDED_TO_STAGE, onStage);
			function onStage(e : Event) : void
			{
				removeEventListener(Event.ADDED_TO_STAGE, onStage);
				var t : Timer = new Timer(10, 1);
				t.addEventListener(TimerEvent.TIMER, start);
				t.start();
			}
		}

		private function start(event : TimerEvent) : void
		{
			Timer(event.currentTarget).removeEventListener(TimerEvent.TIMER, start);
			
			printParametersInAlcon();

			// create MVC
			var model : Model = new Model();
			model.stage = this.stage;
			model.setParameters(this.loaderInfo.parameters);

			// create controller
			var controller : AppController = new AppController(model);
			addChild(controller);

			// set contextMenu
			Version.NAME = "Emailbingo";
			Version.VERSION = "Version 1.0";
			new Version(this);
		}

		/**
		 * Print incoming parameters (for debugging)
		 * @return void
		 */
		private function printParametersInAlcon() : void
		{
			var params : String = "";
			for ( var i:String in this.loaderInfo.parameters )
			{
				params += '\n   ' + i + ' : ' + this.loaderInfo.parameters[i];
			}
			if ( params !== '' ){
				Debug.trace("Parameters: " + params);
			}
			
			if ( this.loaderInfo.parameters.data )
			{
				var d : JSONDecoder = new JSONDecoder(this.loaderInfo.parameters.data.replace(/[~]+/g, '"'), false);
				var obj:Object = d.getValue();
				Debug.traceObj(obj);
			}
		}
	}
}
