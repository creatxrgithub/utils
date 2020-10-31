const fontkit = require('fontkit');
const fs = require('fs');
const path = require('path');

let outputFolder = '.';
let fonts = [




];
let rangStart = 32;
let rangeEnd = 300000;



for(let i=0; i<fonts.length; i++) {

	let ooUni = '';

	let fontFileName = fonts[i];
	let font = fontkit.openSync(fontFileName);
	let outputFileName = path.join(outputFolder,`${font.familyName}.svg`);
	let wstream = fs.createWriteStream(outputFileName);

	
	if(typeof(font.fonts) != 'undefined') {
		font = font.fonts[0];
	}


	let fontFace = `
		<font-face
			font-family="${font.familyName}.${font.version}"
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
	`;


	console.log(fontFace);

	console.log(font.numGlyphs);
	//console.log(font.characterSet);
	//console.log(font.availableFeatures);

	console.log(font.postscriptName);

	console.log(font.glyphForCodePoint(0x0041).advanceWidth);

	//process.exit(0);


	let curTime = new Date();

	wstream.write(`<?xml version="1.0" standalone="no"?>
	<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >
	<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
	<metadata>
	${font.copyright}
	Created by nodejs + fontkit at ${curTime.getFullYear()}-${curTime.getMonth()}-${curTime.getDate()} ${curTime.getHours()}:${curTime.getMinutes()}:${curTime.getSeconds()}
	By CREATXR,,,
	</metadata>
	<defs>
	<font id="${font.postscriptName}" horiz-adv-x="2048" >
		${fontFace}
	<missing-glyph
	d="M1843 -205h-1638v1966h1638v-1966zM1669 1655h-1288l645 -793zM1737 -16v1585l-643 -793zM957 776l-646 797v-1591zM1667 -98l-641 790l-643 -790h1284z" />
	`);


	for(let unicode=rangStart; unicode<rangEnd; unicode++) {
		if(font.hasGlyphForCodePoint(unicode)) {
			let glyph = font.glyphForCodePoint(unicode);
			let unicodeStr = unicode.toString(16).toUpperCase();
			/*
			let glyphName = '';
			if(unicode<0x10000) {
				glyphName = `uni${unicodeStr}`;
			} else {
				glyphName = `u${unicodeStr}`;
			}
			*/
			if(glyph.path.toSVG()=='') continue;
			ooUni += String.fromCharCode(unicode);
			if(font.unitsPerEm===glyph.advanceWidth) {
				wstream.write(`<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${glyph.path.toSVG()}" />\n`);
			} else {
				wstream.write(`<glyph glyph-name="&#x${unicodeStr};" unicode="&#x${unicodeStr};" d="${glyph.path.toSVG()}" horiz-adv-x="${glyph.advanceWidth}"/>\n`);
			}
		}
	}

	wstream.write(`</font></defs></svg>`);
	wstream.end();
	fs.writeFileSync(path.join(outputFolder,`${font.familyName}.txt`), ooUni);
}
