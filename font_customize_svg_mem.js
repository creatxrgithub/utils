'use strict'

/**
 * npm install fontkit svgpath svg-path-bounds
 *
 * 請自行修改需要的參數，比如：字體名、輸入文件名、輸入的字體文件名及要更改字符與方法等
 *
 * 生成 svg 文件後使用 fontforge 命令行
 * fontforge -lang=ff -c 'Open($1); Generate($2)' "$1" "$2"
 * 或用 fontforge 打開 .svg 文件生成 .ttf 字體就行了
 */


/*

第五個中文開始就對不齊了
mmmmmmmmmmmm
半角中文對齊半角中文對齊
MMMMMMMMMMMM
半角中文對齊半角中文對齊
WWWWWWWWWWWW
半角中文對齊半角中文對齊
wwwwwwwwwwww
半角中文對齊半角中文對齊
000000000000
	縮進縮進
    空格空格
999988776655
wwwwwwwwwwww
WWWWWWWWWWWW

 */

const fontkit = require('fontkit');
const fs = require('fs');
const pathUtil = require('svgpath');
const svgPathBounds = require('svg-path-bounds');


//let defFontName = 'I.MingCREATXR';
let defFontName = 'CREATXR_MING_MONO_思文明體等寬';
defFontName = 'CREATXR_MING_思文明體';
let defFontVersion = '701';  //i.ming + tlwg mono
let maxGlyphNum = 65533;  //字形總數不能超過 65535 需減去自行增加的字形數

let svgString='';

let outputFileName = `/home/creatxr/Documents/${defFontName}_${defFontVersion}.svg`;
fs.writeFileSync(outputFileName,'');


let baseUnitsPerEm = 2048;
let missingUnicode = [];
/**
 * define unicode ranges
 */
let ranges = [
//	{start:32, end:255},  // 32 = 0x20 是空格，應佔半個字符 baseUnitsPerEm/2
	{start:33, end:255},
	{start:0x2F00, end:0x2FD5},  //康熙部首
	{start:0x2E80, end:0x2EF3},  //部首擴展
	{start:0xF900, end:0xFAD9},  //兼容漢字
	{start:0x2F800, end:0x2FA1D},  //兼容擴展
	{start:0xE815, end:0xE86F},  //PUA(GBK)部件
	{start:0xE400, end:0xE5E8},  //部件擴展
	{start:0xE600, end:0xE6CF},  //PUA增補
	{start:0x31C0, end:0x31E3},  //漢字筆畫
	{start:0x2FF0, end:0x2FFB},  //漢字结构
	{start:0x3105, end:0x312F},  //漢語注音
	{start:0x31A0, end:0x31BA},  //注音擴展
	{start:0x3007, end:0x3007},  //〇
	{start:0x4E00, end:0x9FA5},  //基本漢字
	{start:0x9FA6, end:0x9FEF},  //基本漢字補充
	{start:0x3400, end:0x4DB5},  //擴展A
	{start:0x20000, end:0x2A6D6},  //擴展B
	{start:0x2A700, end:0x2B734},  //擴展C
	{start:0x2B740, end:0x2B81D},  //擴展D
	{start:0x2B820, end:0x2CEA1},  //擴展E
	{start:0x2CEB0, end:0x2EBE0},  //擴展F

];
/**
 * config your fonts here
 */
let fontCreatxrOld = '/media/creatxr/DATAL/SOFTS/fonts/I.MingCREATXR_700.ttf';
let fontMing = '/media/creatxr/DATAL/SOFTS/fonts/I.MingCP-7.01.ttf';
let fontHanaMinA = '/media/creatxr/DATAL/SOFTS/fonts/HanaMinA.ttf';
let fontHanaMinB = '/media/creatxr/DATAL/SOFTS/fonts/HanaMinB.ttf';
let fontKaiXinSong = '/media/creatxr/DATAL/SOFTS/fonts/KaiXinSong.ttf';
// TlwgMono.ttf 還是差些意思：不是黑體，兩字母不等寬於一全角漢字，需要作個轉換
//或找個合適的字體，比如 Anonymous_Pro.ttf 直接設一個屬性 horiz-adv-x
/** 這個較好 https://www.theleagueofmoveabletype.com/league-mono 等寬的字體要粗些，否則顯得太疏。*/
/** fontMonoHorizAdvX 設爲 0 則是自適應，非等寬；不設 undefined 或 null 則直接拷 */
let fontMonoHorizAdvX = 0;
let fontMono = '/usr/share/fonts/truetype/tlwg/TlwgMono.ttf';
//fontMono = '/usr/share/fonts/truetype/tlwg/TlwgMono-Bold.ttf';
//fontMono = '/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf';
//fontMono = fontCreatxrOld;
fontMono = '/media/creatxr/DATAL/SOFTS/fonts/Anonymous-Pro/Anonymous_Pro.ttf';
//再更改則基於這個版本，已作過居中調整的
fontMono = '/media/creatxr/DATAL/SOFTS/fonts/CREATXR_MING_MONO_701.ttf';
fontMono = '/usr/share/fonts/truetype/liberation/LiberationSansNarrow-Regular.ttf';
fontMono = '/media/creatxr/WORK/DEV/webapp.bak/fonts/segoeuil.ttf';  //for min space
fontMono = '/media/creatxr/DATAL/SOFTS/fonts/nk57-monospace/nk57-monospace-sc-lt.ttf';
fontMono = '/media/creatxr/DATAL/SOFTS/fonts/LeagueMono-2.220/static/TTF/LeagueMono-CondensedLight.ttf';  //for mono space
fontMono = '/media/creatxr/DATAL/SOFTS/fonts/LeagueMono-2.220/static/TTF/LeagueMono-CondensedThin.ttf';
fontMono = '/media/creatxr/DATAL/SOFTS/fonts/LeagueMono-2.220/static/TTF/LeagueMono-CondensedUltraLight.ttf'; //for min space



let fonts = {
		base: fontMing,
		ext: [
			fontHanaMinA,
			fontHanaMinB,
			fontKaiXinSong
		],  ///maybe require large heap size: node --max-old-space-size=8192 fontCustomize.js
		adjustive: [
			{
				//fontName: '../fonts/HanaMinA.ttf',
				fontName: fontCreatxrOld,
				//chars: '☉「」『』'
				chars: '☉'
			},

			{
				//fontName: '../fonts/HanaMinA.ttf',
				fontName: fontCreatxrOld,
				//由於一點明體有1-10與11-50的大小不一，所以更改。
				//黑底白字的未改❶❷❸❹❺❻❼❽❾❿➊➋➌➍➎➏➐➑➒➓⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴
				//白底黑字的將➊➋➌➍➎➏➐➑➒➓⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴字體大小統一，小號的不改
				chars: '➀➁➂➃➄➅➆➇➈➉⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿'
			},


			{
				//改用等寬字體
				//fontName: '../fonts/I.MingCREATXR_700.ttf',
				fontName: fontMono,
				horizAdvX: fontMonoHorizAdvX,
				//半角字符源自某種纖細的黑體
				//空格也要改
				//chars: '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſƒǺǻǼǽǾǿȘșȚțˆˇˉ˘˙˚˛˜˝;΄΅Ά·ΈΉΊΌΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώЀЁЂЃЄЅІЇЈЉЊЋЌЍЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюяѐёђѓєѕіїјљњћќѝўџѲѳҐґẀẁẂẃẄẅỲỳ‐‑–—―‗‘’‚‛“”„†‡•…‰′″‹›‼‾⁄ⁿ₣₤₧€℅ℓ№™Ω℮⅛⅜⅝⅞←↑→↓↔↕↨∂∆∏∑−∕∙√∞∟∩∫≈≠≡≤≥⌂⌐⌠⌡─│┌┐└┘├┤┬┴┼═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥╦╧╨╩╪╫╬▀▄█▌▐░▒▓■□▪▫▬▲►▼◄◊○●◘◙◦☺☻☼♀♂♠♣♥♦♪♫♬ﬁﬂ',
				chars: '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ'
			},

/*
			{
				//改用等寬字體
				//fontName: '../fonts/I.MingCREATXR_700.ttf',
				fontName: fontMono,
				//半角字符源自某種纖細的黑體
				//空格也要改
				chars: '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſƒǼǽǾǿȘșȚțˆˇ˘˙˚˛˜˝΄΅ΆΈΉΊΌΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώЁЂЃЄЅІЇЈЉЊЋЌЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюяёђѓєѕіїјљњћќўџҐґḂḃḊḋḞḟṀṁṖṗṠṡṪṫẀẁẂẃẄẅỲỳ–—―‘’‚“”„†‡•…‰‹›⁄€№™Ω∂∆∏∑−√∞∫≈≠≤≥⌃⌘⌤⌥⌦⍽⎈⏎␣─│┌┐└┘├┤┬┴┼═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥╦╧╨╩╪╫╬◆◊✓',
				//horizAdvX: 1024
				//horizAdvX: 0
			},
			//*/
/*
			{
				//改用等寬字體
				//fontName: '../fonts/I.MingCREATXR_700.ttf',
				fontName: fontCreatxrOld,
				chars: '0123456789`~!@#$%^&*{}[]()_+=-.,:;?<>|/\'\\ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
				//horizAdvX: 1024  //如果需要等寬，則在這設定寬度
			},
//*/
			{
				fontName: fontCreatxrOld,
				//源自開心宋體
				chars: '﹐﹑﹔﹕﹖﹗﹙﹚﹛﹜﹝﹞﹟﹠﹡﹢﹣﹤﹥﹦﹨﹩﹪﹫'
			},

			{
				fontName: fontCreatxrOld,
				chars: '。，、。；：？！（）｛｝〔〕＃＆＊＋－＜＞＝＼＄％＠《》〈〉／［］「」『』‘’“”气磙碌'
			},

			{
				fontName: fontCreatxrOld,
				chars: '◯☯⚊⚋⚌⚍⚎⚏☰☱☲☳☴☵☶☷䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿𝌀𝌁𝌂𝌃𝌄𝌅𝌆𝌇𝌈𝌉𝌊𝌋𝌌𝌍𝌎𝌏𝌐𝌑𝌒𝌓𝌔𝌕𝌖𝌗𝌘𝌙𝌚𝌛𝌜𝌝𝌞𝌟𝌠𝌡𝌢𝌣𝌤𝌥𝌦𝌧𝌨𝌩𝌪𝌫𝌬𝌭𝌮𝌯𝌰𝌱𝌲𝌳𝌴𝌵𝌶𝌷𝌸𝌹𝌺𝌻𝌼𝌽𝌾𝌿𝍀𝍁𝍂𝍃𝍄𝍅𝍆𝍇𝍈𝍉𝍊𝍋𝍌𝍍𝍎𝍏𝍐𝍑𝍒𝍓𝍔𝍕𝍖○ㄨ礻㗰𠳝'
				//'◯☯⚊⚋⚌⚍⚎⚏☰☱☲☳☴☵☶☷䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿𝌀𝌁𝌂𝌃𝌄𝌅𝌆𝌇𝌈𝌉𝌊𝌋𝌌𝌍𝌎𝌏𝌐𝌑𝌒𝌓𝌔𝌕𝌖𝌗𝌘𝌙𝌚𝌛𝌜𝌝𝌞𝌟𝌠𝌡𝌢𝌣𝌤𝌥𝌦𝌧𝌨𝌩𝌪𝌫𝌬𝌭𝌮𝌯𝌰𝌱𝌲𝌳𝌴𝌵𝌶𝌷𝌸𝌹𝌺𝌻𝌼𝌽𝌾𝌿𝍀𝍁𝍂𝍃𝍄𝍅𝍆𝍇𝍈𝍉𝍊𝍋𝍌𝍍𝍎𝍏𝍐𝍑𝍒𝍓𝍔𝍕𝍖○ㄨ
			},
/*
			{
				fontName: '../fonts/HanaMinB.ttf',
				chars: '𣲖'
			},
*/

			//*
			{
				fontName: fontCreatxrOld,
				//chars: '旣卽' // 源自開心宋體
				chars: ''  //「」字，在 ctext.org 中檢測爲自定義字符，當用「䥇」
			}
			//*/
		],
		alternative: [
			{
				//fontName: '/media/creatxr/DATAL/SOFTS/fonts/KaiXinSong.ttf',
				fontName: fontKaiXinSong,
				charsFrom: '﹨',
				charsTo: '／',
				rotate: 0,
				mirrorX: false,
				mirrorY: true,
			}  /*,

			{
				fontName: fontKaiXinSong,
				charsFrom: '﹤﹥',
				charsTo: '＜＞',
				rotate: 0,
				mirrorX: false,
				mirrorY: false,
			},
			*/
		]
};

/*這樣保證總字形不多于 65535*/
//*
for (let o of fonts.adjustive) {
	maxGlyphNum -= o.chars.length;
}
for (let o of fonts.alternative) {
	maxGlyphNum -= o.charsFrom.length;
}
//console.log(Object.entries(fonts.adjustive).length);


function matrixMirrorX(d) {
	let [left, top, right, bottom] = svgPathBounds(d);
	return pathUtil(d).translate(0,-bottom-top).scale(1,-1).rel().round(3).toString();
}

function matrixMirrorY(d) {
	let [left, top, right, bottom] = svgPathBounds(d);
	return pathUtil(d).translate(-right-left,0).scale(-1,1).rel().round(3).toString();
}

//三半角等於兩全角，或二半角等於一全角，卽可對齊中文與字母，或直接設一個屬性 horiz-adv-x
//效果不好
function matrixScaleWidth(d, percent) {
	let [left, top, right, bottom] = svgPathBounds(d);
	return pathUtil(d).scale(percent,1).rel().round(3).toString();  ///TODO:
}




if (fonts.base!=null) {

	let font = fontkit.openSync(fonts.base);
	baseUnitsPerEm = font.unitsPerEm;
	//font-family 的值不能有空格
	let fontFace = `
		<font-face
			font-family="${defFontName}_${defFontVersion}"
			font-weight="400"
			font-stretch="normal"
			units-per-em="${font.unitsPerEm}"
			panose-1="2 2 4 0 0 0 0 0 0 0"
			ascent="${font.ascent}"
			descent="${font.descent}"
			x-height="${font.xHeight}"
			cap-height="${font.capHeight}"
			bbox="${font.bbox.minX} ${font.bbox.minY} ${font.bbox.maxX} ${font.bbox.maxY}"
			underline-thickness="${font.underlineThickness}"
			underline-position="${font.underlinePosition}"
			unicode-range="U+000D-2CE75"
		  />
	`;  //更名可以加在 font-family 不能有空格


	console.log(fontFace);
	console.log(font.numGlyphs);
	console.log(font.familyName);
	console.log(font.postscriptName);


	let curTime = new Date();

	svgString = `<?xml version="1.0" standalone="no"?>
	<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >
	<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
	<metadata>
	${font.copyright}
	Created by nodejs + fontkit at ${curTime.getFullYear()}-${curTime.getMonth()}-${curTime.getDate()} ${curTime.getHours()}:${curTime.getMinutes()}:${curTime.getSeconds()}
	By CREATXR,,,
	</metadata>
	<defs>
	<font id="${defFontName}" horiz-adv-x="2048" >
		${fontFace}
	<missing-glyph
	d="M1843 -205h-1638v1966h1638v-1966zM1669 1655h-1288l645 -793zM1737 -16v1585l-643 -793zM957 776l-646 797v-1591zM1667 -98l-641 790l-643 -790h1284z" />
	<glyph glyph-name="&#x20;" unicode="&#x20;" d="" horiz-adv-x="${baseUnitsPerEm/2}"/>
	`;

	for (let range of ranges) {
		if (maxGlyphNum==0) break;
		for (let unicode=range.start; unicode<=range.end; unicode++) {
			if (maxGlyphNum==0) break;
			if (font.hasGlyphForCodePoint(unicode)) {
				let glyph = font.glyphForCodePoint(unicode);
				let unicodeStr = unicode.toString(16).toUpperCase();
				if (font.unitsPerEm===glyph.advanceWidth) {
					svgString = svgString.concat(`<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${glyph.path.toSVG()}" />\n`);
				} else {
					svgString = svgString.concat(`<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${glyph.path.toSVG()}" horiz-adv-x="${glyph.advanceWidth}"/>\n`);
				}
				maxGlyphNum--;
			} else {
				missingUnicode.push(unicode);
			}
		}
	}

} else {
	console.log('base font is not specified.');
	process.exit(0);
}


console.log('ext fonts begin ......');

if (fonts.ext.length>0 && missingUnicode.length>0) {
	for (let i=0; i<fonts.ext.length; i++) {
		if (maxGlyphNum==0) break;
		let extFont = fontkit.openSync(fonts.ext[i]);
		let scaleMultiple = baseUnitsPerEm/extFont.unitsPerEm;
		for (let i=0; i<missingUnicode.length; i++) {
			if (maxGlyphNum==0) break;
			if (missingUnicode[i]==null) continue;
			let unicodeStr = missingUnicode[i].toString(16).toUpperCase();
			if (extFont.hasGlyphForCodePoint(missingUnicode[i])) {
				let glyph = extFont.glyphForCodePoint(missingUnicode[i]);
				let adjusted = pathUtil(glyph.path.toSVG()).scale(scaleMultiple,scaleMultiple);
				if (extFont.unitsPerEm===glyph.advanceWidth) {
					svgString = svgString.concat(`<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" />\n`);
				} else {
					svgString = svgString.concat(`<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" horiz-adv-x="${glyph.advanceWidth*scaleMultiple}"/>\n`);
				}
				missingUnicode[i] = null;
				maxGlyphNum--;
			}
		}
	}
}


console.log('adjustive begin ......');

for (let i=0; i<fonts.adjustive.length; i++) {
	let adjustFont = fontkit.openSync(fonts.adjustive[i].fontName);
	let scaleMultiple =baseUnitsPerEm / adjustFont.unitsPerEm;
	for (let o of fonts.adjustive[i].chars) {
		let unicode = o.codePointAt(0);
		let unicodeStr = unicode.toString(16).toUpperCase();
		if (adjustFont.hasGlyphForCodePoint(unicode)) {
			let glyph = adjustFont.glyphForCodePoint(unicode);
			let adjusted = pathUtil(glyph.path.toSVG()).scale(scaleMultiple,scaleMultiple);
			/*//變換的效果不理想，最好找合適的，比如 Anonymous_Pro.ttf 可以直接復製過去
			if (!Number.isNaN(fonts.adjustive[i].horizAdvX) && (fonts.adjustive[i].horizAdvX != undefined)) {
				let [left, top, right, bottom] = svgPathBounds(glyph.path.toSVG());
				console.log(left, top, right, bottom);
				adjusted = pathUtil(glyph.path.toSVG()).scale(
//					fonts.adjustive[i].horizAdvX / (right-left),
//					baseUnitsPerEm / (right-left)
					fonts.adjustive[i].horizAdvX / adjustFont.unitsPerEm,
					baseUnitsPerEm / adjustFont.unitsPerEm
					);
			}
			//*/
			let newSvg = '';
			if (adjustFont.unitsPerEm===glyph.advanceWidth) {
				newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" />\n`;
			}
			//*
			else if (!Number.isNaN(fonts.adjustive[i].horizAdvX) && (fonts.adjustive[i].horizAdvX != undefined) && (fonts.adjustive[i].horizAdvX != null)) {
				if (fonts.adjustive[i].horizAdvX > 0 ) {
					newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" horiz-adv-x="${fonts.adjustive[i].horizAdvX}"/>\n`;
				} else {
					console.log(adjusted);
					let [left, top, right, bottom] = svgPathBounds(adjusted.toString());
					newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" horiz-adv-x="${right-left+200}"/>\n`;
				}
			}
			//*/
			else {
				newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" horiz-adv-x="${glyph.advanceWidth*scaleMultiple}"/>\n`;
			}

			let pattern = `<glyph[^/>]+unicode="&#x${unicodeStr};"[^/>]+/>\n`;
			let regexp = new RegExp(pattern, 'g');
			if (svgString.match(regexp)!=null) {
				svgString = svgString.replace(regexp, newSvg);
			} else {
				svgString = svgString.concat(newSvg);
				maxGlyphNum--;
			}
		}
	}
}

console.log('alternative begin ......');

for (let i=0; i<fonts.alternative.length; i++) {
	let ooFrom = [];
	let ooTo = [];
	for (let o of fonts.alternative[i].charsFrom) ooFrom.push(o);
	for (let o of fonts.alternative[i].charsTo) ooTo.push(o);
	if (ooFrom.length!=ooTo.length) {
		continue;
	}
	let adjustFont = fontkit.openSync(fonts.alternative[i].fontName);
	let scaleMultiple =baseUnitsPerEm / adjustFont.unitsPerEm;
	for (let j=0; j<ooFrom.length; j++) {
		let unicode = ooFrom[j].codePointAt(0);
		let unicodeStr = ooTo[j].codePointAt(0).toString(16).toUpperCase();
		if (adjustFont.hasGlyphForCodePoint(unicode)) {
			let glyph = adjustFont.glyphForCodePoint(unicode);
			let adjusted = pathUtil(glyph.path.toSVG()).scale(scaleMultiple,scaleMultiple);
			if (fonts.alternative[i].rotate!=0) adjusted = pathUtil(adjusted).rotate(fonts.alternative[i].rotate);
			if (fonts.alternative[i].mirrorX==true) adjusted = matrixMirrorX(adjusted.toString());
			if (fonts.alternative[i].mirrorY==true) adjusted = matrixMirrorY(adjusted.toString());
			let newSvg = '';
			if (adjustFont.unitsPerEm===glyph.advanceWidth) {
				newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" />\n`;
			} else {
				newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" horiz-adv-x="${glyph.advanceWidth*scaleMultiple}"/>\n`;
			}

			let pattern = `<glyph[^/>]+unicode="&#x${unicodeStr};"[^/>]+/>\n`;
			let regexp = new RegExp(pattern, 'g');
			if (svgString.match(regexp)!=null) {
				svgString = svgString.replace(regexp, newSvg);
			} else {
				svgString = svgString.concat(newSvg);
				maxGlyphNum--;
			}
		}
	}
}


svgString = svgString.concat(`</font></defs></svg>`);

console.log(maxGlyphNum);




let wstream = fs.createWriteStream(outputFileName, {flags:'as+'});
wstream.write(svgString);
wstream.end();
