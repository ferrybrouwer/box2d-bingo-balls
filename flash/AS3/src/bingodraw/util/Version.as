package bingodraw.util
{
	import flash.display.Sprite;
	import flash.ui.ContextMenu;
	import flash.ui.ContextMenuItem;

	/**
	 * Add contextmenu with current version
	 * @author Ferry Brouwer
	 */
	public class Version
	{
		public static var NAME : String = "";
		public static var VERSION : String = "";

		public function Version(inContextMenuSprite : Sprite)
		{
			var cm : ContextMenu = new ContextMenu();
			cm.hideBuiltInItems();
			cm.customItems.push(new ContextMenuItem(NAME));
			cm.customItems.push(new ContextMenuItem(VERSION));
			inContextMenuSprite.contextMenu = cm;
		}

		public static function toString() : String
		{
			return "[NAME: " + NAME + ", VERSION: " + VERSION + "]";
		}
	}
}