package bingodraw.data
{
	import flash.external.ExternalInterface;

	public class Parameters
	{
		private var params : Object;
		private var testParams : Object;

		public function Parameters(obj : Object)
		{
			params = obj;
			testParams = {
				contextMenuName : "Emailbingo", 
				data : "{\"bingodraw\":true,\"balls\":[\"@\",\"5\",\"9\",\"3\",\"5\",\"6\",\"7\",\"8\",\"9\",\"2\",\"4\",\"1\"],\"cards\":[{\"labels\":[\"22\",\"32\",\"31\",\"4\",\"1\",\"0\",\"20\",\"52\",\"3\"],\"claimed\":false,\"disabled\":false},{\"labels\":[\"@\",\"@\",\"@\",\"@\",\"@\",\"@\",\"@\",\"@\",\"@\"],\"claimed\":true,\"disabled\":false},{\"labels\":[\"10\",\"4\",\"13\",\"2\",\"15\",\"7\",\"17\",\"18\",\"19\"],\"claimed\":false,\"disabled\":false},{\"labels\":[\"1\",\"2\",\"3\",\"4\",\"5\",\"6\",\"7\",\"8\",\"9\"],\"claimed\":true,\"disabled\":false},{\"labels\":[\"2\",\"29\",\"8\",\"1\",\"25\",\"9\",\"31\",\"23\",\"5\"],\"claimed\":true,\"disabled\":true}]}"
			};
		}

		/**
		 * Get parameter by name
		 * 
		 * @param name
		 * @return
		 */
		public function getParam(name : String) : *
		{
			var paramObj : Object = ExternalInterface.available ? params : testParams;
			if (typeof paramObj[name] == "undefined") paramObj[name] = false;
			if (paramObj[name] == "false") paramObj[name] = false;
			if (paramObj[name] == "true") paramObj[name] = true;
			return paramObj[name];
		}
	}
}