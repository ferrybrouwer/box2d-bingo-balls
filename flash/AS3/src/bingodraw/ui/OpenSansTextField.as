package bingodraw.ui
{
	import flash.text.TextFormat;
	import flash.text.AntiAliasType;
	import flash.text.Font;
	import flash.text.TextField;

	/**
	 * @author ferrybrouwer
	 */
	public class OpenSansTextField extends TextField
	{
		[Embed(source="../assets/fonts/opensans-bold-webfont.ttf", 
		fontName = "OpenSans", 
		mimeType = "application/x-font", 
		fontWeight="bold", 
		fontStyle="normal", 
		advancedAntiAliasing="true", 
		embedAsCFF="false")]
		private var openSansBold : Class;
		[Embed(source="../assets/fonts/opensans-regular-webfont.ttf", 
		fontName = "OpenSans", 
		mimeType = "application/x-font", 
		fontWeight="normal", 
		fontStyle="normal", 
		advancedAntiAliasing="true", 
		embedAsCFF="false")]
		private var openSansRegular : Class;
		private var format : TextFormat = new TextFormat();

		public function OpenSansTextField()
		{
			super();

			Font.registerFont(openSansBold);
			Font.registerFont(openSansRegular);

			format.font = "OpenSans";
			size = 11;
			color = 0xff0000;

			this.embedFonts = true;
			this.antiAliasType = AntiAliasType.ADVANCED;
			this.multiline = false;
			this.selectable = false;
			this.defaultTextFormat = format;
		}

		public function set size(val : Number) : void
		{
			format.size = val;
			this.defaultTextFormat = format;
			this.setTextFormat(format);
		}

		public function set color(val : uint) : void
		{
			format.color = val;
			this.defaultTextFormat = format;
			this.setTextFormat(format);
		}

		public function set bold(val : Boolean) : void
		{
			format.bold = val;
			this.defaultTextFormat = format;
			this.setTextFormat(format);
		}

		public function set align(val : String) : void
		{
			format.align = val;
			this.defaultTextFormat = format;
			this.setTextFormat(format);
		}
	}
}
