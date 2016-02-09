package bingodraw
{
	import bingodraw.data.ExternalInterfaceCommunication;
	import bingodraw.data.Parameters;

	import com.adobe.serialization.json.JSONDecoder;

	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.external.ExternalInterface;

	/**
	 * Model controller
	 * 
	 * @author Ferry Brouwer
	 */
	public class Model
	{
		private var _externalInterface : ExternalInterfaceCommunication;
		private var param : Parameters;
		private var _stage : Stage;
		private var _assets : Sprite;
		private var _data : Object;

		public function Model()
		{
			if (ExternalInterface.available)
			{
				_externalInterface = new ExternalInterfaceCommunication();
			}
		}

		/**
		 * Get the external interface communication class
		 * 
		 * @return {ExternalInterfaceCommunication}
		 */
		public function get externalInterface() : ExternalInterfaceCommunication
		{
			return _externalInterface;
		}

		/**
		 * Set parameters from LoaderInfo.parameters object
		 * 
		 * @param obj : Object
		 * @return void
		 */
		public function setParameters(obj : Object) : void
		{
			param = new Parameters(obj);
		}

		/**
		 * Get specified parameter
		 * 
		 * @param name : String
		 * @return mixed | String
		 */
		public function parameter(name : String) : *
		{
			return param.getParam(name);
		}

		/**
		 * Set stage object
		 * 
		 * @param stage : Stage
		 * @return void
		 */
		public function set stage(stage : Stage) : void
		{
			_stage = stage;
		}

		/**
		 * Get Stage object
		 * 
		 * @return Stage
		 */
		public function get stage() : Stage
		{
			return _stage;
		}

		/**
		 * Setter
		 * Set assets Sprite object
		 * 
		 * @param inSprite : Sprite
		 * @return void
		 */
		public function set assets(inSprite : Sprite) : void
		{
			_assets = inSprite;
		}

		/**
		 * Get bingo data
		 * @return Object
		 */
		public function bingoData() : Object
		{
			if ( !this._data )
			{
				var d : JSONDecoder = new JSONDecoder(parameter('data').replace(/[~]+/g, '"'), false);
				this._data = d.getValue();
			}
			return this._data;
		}

		/**
		 * Getter
		 * Get assets Sprite object
		 * 
		 * @return Sprite
		 */
		public function get assets() : Sprite
		{
			return _assets;
		}
	}
}