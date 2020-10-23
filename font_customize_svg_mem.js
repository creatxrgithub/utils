/**
 * npm install fontkit svgpath svg-path-bounds
 *
 * 請自行修改需要的參數，比如：字體名、輸入文件名、輸入的字體文件名及要更改字符與方法等
 *
 * 生成 svg 文件後使用 fontforge 命令行
 * fontforge -lang=ff -c 'Open($1); Generate($2)' "$1" "$2"
 * 或用 fontforge 打開 .svg 文件生成 .ttf 字體就行了
 */

const fontkit = require('fontkit');
const fs = require('fs');
const pathUtil = require('svgpath');
const svgPathBounds = require('svg-path-bounds');


let defFontName = 'I.MingCREATXR';
let defFontVersion = '700';
let maxGlyphNum = 65535;  //字形總數不能超過 65535 需減去自行增加的字形數

let svgString='';

let outputFileName = `/home/creatxr/Documents/${defFontName}_${defFontVersion}.svg`;
fs.writeFileSync(outputFileName,'');


let baseUnitsPerEm = 2048;
let missingUnicode = [];
/**
 * define unicode ranges
 */
let ranges = [
	{start:32, end:255},
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
let fonts = {
		base: '../fonts/I.MingCP-7.00.ttf',
		ext: [
			'../fonts/HanaMinA.ttf',
			'../fonts/HanaMinB.ttf',
			'../fonts/KaiXinSong.ttf'
		],  ///maybe require large heap size: node --max-old-space-size=8192 fontCustomize.js
		adjustive: [
			{
				//fontName: '../fonts/HanaMinA.ttf',
				fontName: '../fonts/I.MingCREATXR.ttf',
				chars: '☉'
			},

			{
				fontName: '../fonts/I.MingCREATXR.ttf',
				chars: '0123456789`~!@#$%^&*{}[]()_+=-.,:;?<>|/\'\\ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
			},
			{
				fontName: '../fonts/I.MingCREATXR.ttf',
				chars: '﹐﹑﹔﹕﹖﹗﹙﹚﹛﹜﹝﹞﹟﹠﹡﹢﹣﹤﹥﹦﹨﹩﹪﹫'
			},
			{
				fontName: '../fonts/I.MingCREATXR.ttf',
				chars: '。，、。；：？！（）｛｝〔〕＃＆＊＋－＜＞＝＼＄％＠《》〈〉／［］「」『』‘’“”气磙碌'
			},

			{
				fontName: '../fonts/I.MingCREATXR.ttf',
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
				fontName: '../fonts/KaiXinSong.ttf',
				//chars: '旣卽'
				chars: ''  //「」字，在 ctext.org 中檢測爲自定義字符，當用「䥇」
			}
			//*/
		],
		alternative: [
			{
				fontName: '../fonts/KaiXinSong.ttf',
				charsFrom: '﹨',
				charsTo: '／',
				rotate: 0,
				mirrorX: false,
				mirrorY: true,
			}  /*,

			{
				fontName: '../fonts/KaiXinSong.ttf',
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
for(let o of fonts.adjustive) {
	maxGlyphNum -= o.chars.length;
}
for(let o of fonts.alternative) {
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





if(fonts.base!=null) {

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
	`;

	for(let range of ranges) {
		if(maxGlyphNum==0) break;
		for(let unicode=range.start; unicode<=range.end; unicode++) {
			if(maxGlyphNum==0) break;
			if(font.hasGlyphForCodePoint(unicode)) {
				let glyph = font.glyphForCodePoint(unicode);
				let unicodeStr = unicode.toString(16).toUpperCase();
				if(font.unitsPerEm===glyph.advanceWidth) {
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

if(fonts.ext.length>0 && missingUnicode.length>0) {
	for(let i=0; i<fonts.ext.length; i++) {
		if(maxGlyphNum==0) break;
		let extFont = fontkit.openSync(fonts.ext[i]);
		let scaleMultiple = baseUnitsPerEm/extFont.unitsPerEm;
		for(let i=0; i<missingUnicode.length; i++) {
			if(maxGlyphNum==0) break;
			if(missingUnicode[i]==null) continue;
			let unicodeStr = missingUnicode[i].toString(16).toUpperCase();
			if(extFont.hasGlyphForCodePoint(missingUnicode[i])) {
				let glyph = extFont.glyphForCodePoint(missingUnicode[i]);
				let adjusted = pathUtil(glyph.path.toSVG()).scale(scaleMultiple,scaleMultiple);
				if(extFont.unitsPerEm===glyph.advanceWidth) {
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

for(let i=0; i<fonts.adjustive.length; i++) {
	let adjustFont = fontkit.openSync(fonts.adjustive[i].fontName);
	let scaleMultiple =baseUnitsPerEm / adjustFont.unitsPerEm;
	for(let o of fonts.adjustive[i].chars) {
		let unicode = o.codePointAt(0);
		let unicodeStr = unicode.toString(16).toUpperCase();
		if(adjustFont.hasGlyphForCodePoint(unicode)) {
			let glyph = adjustFont.glyphForCodePoint(unicode);
			let adjusted = pathUtil(glyph.path.toSVG()).scale(scaleMultiple,scaleMultiple);
			let newSvg = '';
			if(adjustFont.unitsPerEm===glyph.advanceWidth) {
				newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" />\n`;
			} else {
				newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" horiz-adv-x="${glyph.advanceWidth*scaleMultiple}"/>\n`;
			}

			let pattern = `<glyph[^/>]+unicode="&#x${unicodeStr};"[^/>]+/>\n`;
			let regexp = new RegExp(pattern, 'g');
			if(svgString.match(regexp)!=null) {
				svgString = svgString.replace(regexp, newSvg);
			} else {
				svgString = svgString.concat(newSvg);
				maxGlyphNum--;
			}
		}
	}
}

console.log('alternative begin ......');

for(let i=0; i<fonts.alternative.length; i++) {
	let ooFrom = [];
	let ooTo = [];
	for(let o of fonts.alternative[i].charsFrom) ooFrom.push(o);
	for(let o of fonts.alternative[i].charsTo) ooTo.push(o);
	if(ooFrom.length!=ooTo.length) {
		continue;
	}
	let adjustFont = fontkit.openSync(fonts.alternative[i].fontName);
	let scaleMultiple =baseUnitsPerEm / adjustFont.unitsPerEm;
	for(let j=0; j<ooFrom.length; j++) {
		let unicode = ooFrom[j].codePointAt(0);
		let unicodeStr = ooTo[j].codePointAt(0).toString(16).toUpperCase();
		if(adjustFont.hasGlyphForCodePoint(unicode)) {
			let glyph = adjustFont.glyphForCodePoint(unicode);
			let adjusted = pathUtil(glyph.path.toSVG()).scale(scaleMultiple,scaleMultiple);
			if(fonts.alternative[i].rotate!=0) adjusted = pathUtil(adjusted).rotate(fonts.alternative[i].rotate);
			if(fonts.alternative[i].mirrorX==true) adjusted = matrixMirrorX(adjusted.toString());
			if(fonts.alternative[i].mirrorY==true) adjusted = matrixMirrorY(adjusted.toString());
			let newSvg = '';
			if(adjustFont.unitsPerEm===glyph.advanceWidth) {
				newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" />\n`;
			} else {
				newSvg = `<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${adjusted}" horiz-adv-x="${glyph.advanceWidth*scaleMultiple}"/>\n`;
			}

			let pattern = `<glyph[^/>]+unicode="&#x${unicodeStr};"[^/>]+/>\n`;
			let regexp = new RegExp(pattern, 'g');
			if(svgString.match(regexp)!=null) {
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
