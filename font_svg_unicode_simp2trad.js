/**
* 將 font 的 svg 文件中的 unicode 簡化字編碼轉成繁體編碼
*/


const fs = require('fs');
const cheerio = require('cheerio');

const ChineseAdjustor = require('adjust-chinese');
//const ChineseAdjustor = require('./adjustChineseToTC.js');


let tempT = [
	'個个'
];
let adjustor = new ChineseAdjustor(['traAdjustT','standardT','contextT',['個个']]);


let inSvg = './小篆_簡.svg';
let outSvg = './小篆_繁.svg';



let $ = cheerio.load(fs.readFileSync(inSvg));
for(let i=0; i<$('glyph').length; i++) {
	$('glyph')[i].attribs.unicode = adjustor.adjust($('glyph')[i].attribs.unicode);
	$('glyph')[i].attribs['glyph-name'] = adjustor.adjust($('glyph')[i].attribs.unicode);

}

fs.writeFileSync(outSvg, $.html());
