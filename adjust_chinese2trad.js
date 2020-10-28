const ChineseAdjustor = require('adjust-chinese');
const findFiles = require('find-files-by-regular');
const fs = require('fs-extra');
const readlineSync = require('readline-sync');
const path = require('path');


let fileNamePattern = '\.txt$';
let pathPattern = '/home/creatxr/Documents/TXT';


let tempT = [
/** cbeta 大正藏 //*/
//改動：符號表
//['㮏',/㮈/g,/[\[﹝]木[\*﹡]?[奈柰][\]﹞]/g],['𤘽',/[\[﹝]牛[\*﹡]?句[\]﹞]/g],['𤙖',/[\[﹝]合[\*﹡]?牛[\]﹞]/g],['𪘨',/[\[﹝]齒[\*﹡]?來[\]﹞]/g],
//['',/\[[0-9a-zA-Z]+\]/g],['',/﹝[0-9a-zA-Z]+﹞/g],
//﹝辦﹣力﹢歹﹞
//'气氣','网網','祕秘','眞真','顚顛颠','愼慎','巓巔巅','鎭鎮镇','塡填','槇槙','鷆鷏',


//	['０','0'],['１','1'],['２','2'],['３','3'],['４','4'],['５','5'],['６','6'],['７','7'],['８','8'],['９','9'],

//	['①',/﹝?１﹞/g],['②',/﹝?２﹞/g],['③',/﹝?３﹞/g],['④',/﹝?４﹞/g],['⑤',/﹝?５﹞/g],['⑥',/﹝?６﹞/g],['⑦',/﹝?７﹞/g],['⑧',/﹝?８﹞/g],['⑨',/﹝?９﹞/g],['⑩',/﹝?１０﹞/g],['⑪',/﹝?１１﹞/g],['⑫',/﹝?１２﹞/g],['⑬',/﹝?１３﹞/g],['⑭',/﹝?１４﹞/g],['⑮',/﹝?１５﹞/g],['⑯',/﹝?１６﹞/g],['⑰',/﹝?１７﹞/g],['⑱',/﹝?１８﹞/g],['⑲',/﹝?１９﹞/g],['⑳',/﹝?２０﹞/g],


//	['1','一'],['2','二'],['3','三'],['4','四'],['5','五'],['6','六'],['7','七'],['8','八'],['9','九'],['0',/[零]/g],['$1.',/《([^《》]+)》/g],['第00$1季.',/第(\d+)季/g],['第00$1集.',/第(\d+)集/g],['',/\s*[﹣\-]\s*CCTV[纪录紀錄]/g],['',/\.-\.CCTV紀錄/g],


//'𝘈A','𝘉B','𝘊C','𝘋D','𝘌E','𝘍F','𝘎G','𝘏H','𝘐I','𝘑J','𝘒K','𝘓L','𝘔M','𝘕N','𝘖O','𝘗P','𝘘Q','𝘙R','𝘚S','𝘛T','𝘜U','𝘝V','𝘞W','𝘟X','𝘠Y','𝘡Z','𝘢a','𝘣b','𝘤c','𝘥d','𝘦e','𝘧f','𝘨g','𝘩h','𝘪i','𝘫j','𝘬k','𝘭l','𝘮m','𝘯n','𝘰o','𝘱p','𝘲q','𝘳r','𝘴s','𝘵t','𝘶u','𝘷v','𝘸w','𝘹x','𝘺y','𝘻z',










//'�●',

//	['﹝',/﹝﹝+/],['﹞',/﹞﹞+/],

//	['\n\n',/\s+/g]
];


let ocrInitT = [
	['',/[ ]+/g],
	['\n',/\s/g],
	['$1$2',/([^\n])\n([^\n])/g],
];



let dicts = [tempT];
//dicts = [ocrInitT];
//dicts = [ocrInitT,'abcT','traAdjustT','standardT','contextT','symbolT','notRenameT'];
//dicts = ['abcT','traAdjustT','standardT','contextT','symbolT','notRenameT',tempT];
//dicts = ['abcT','traAdjustT','standardT','contextT'];
//dicts = ['abcT','traAdjustT','standardT','contextT','symbolT'];
//dicts = ['traAdjustT','standardT','contextT','symbolT'];
//dicts = ['abcT','traAdjustT','standardT','contextT','symbolT',tempT];
//dicts = ['traAdjustT'];
//dicts = ['sectionT'];
//dicts = ['symbolT','notRenameT',tempT];
//dicts = ['symbolT',tempT];
//dicts = ['traAdjustT','standardT','contextT',tempT];


let job = {
    outputDictionary:false,
    encodingToUTF8:false,
    rename:false,
    adjust:false,
	token:false
};

if(process.argv.length<3) {
    console.log('has no job toT do !');
    process.exit(0);
} else {
    for(let i=2; i<process.argv.length; i++) {
        switch(process.argv[i]) {
            case '--dicts' :  job.dicts = true; break;
            case '--utf8' :  job.encodingToUTF8 = true; break;
            case '--rename' :  job.rename = true; break;
            case '--adjust' :  job.adjust = true; break;
			case '--token' :  job.token = true; break;
        }
    }
}

let files = findFiles(pathPattern,fileNamePattern);

if(job.encodingToUTF8==true) {
	for(let i=0; i<files.length; i++) {
		if(fs.statSync(files[i]).isDirectory()) continue;
		let content = fs.readFileSync(files[i]);
		//content.replace('','');  //TypeError: content.replace is not a function
		let newContent = ChineseAdjustor.encodingToUtf8(content);
		if(newContent==content) {
			//console.log('encoding pass');
			continue;
		} else {
			fs.writeFileSync(files[i], newContent);
			console.log(files[i]);
		}
	}
}

if((dicts.length!=1)||(dicts[0]!=tempT)) {
	console.log(dicts);
	if (readlineSync.keyInYN('Dictionary is not only "tempT", to cotinue?')) {
		console.log('continue......');
	} else {
		process.exit(0);
	}
}

/**
 * 調用預設的字典使用字串名（使用 eval() 機制，運行期檢查，變量在 ChineseAdjustor 已經導入）
 * 或導入字典再使用變量名傳入參數
 * 外部傳入的字典使用變量名（無法使用 eval() 機制，因爲 ChineseAdjustor 看不到）
 */
let adjustor = new ChineseAdjustor(dicts);
let daoistAdjustor = new ChineseAdjustor(['daoistTokenT']);


if(job.adjust==true) {
	for(let i=0; i<files.length; i++) {
		if(fs.statSync(files[i]).isDirectory()) continue;
//		let content = fs.readFileSync(files[i]); content = ChineseAdjustor.encodingToUtf8(content);
		let content = fs.readFileSync(files[i], 'utf8');  //要保證輸入的編碼是 utf8
		let newContent = adjustor.adjust(content);
//		if(path.basename(files[i],path.extname(files[i])).match(/([悟修]眞|[金大還]丹|丹道|[道雷]法|龍虎|大成捷要|天仙|道樞|丹\.|承道集)/g)!=null) {
		if(path.basename(files[i],path.extname(files[i])).match(/([道雷]法)/g)!=null) {
			//console.log(files[i]);
			newContent = daoistAdjustor.adjust(newContent);
		}
		if(newContent==content) {
			continue;
		} else {
			console.log(files[i], '......');
			fs.writeFileSync('adjustChineseDemo.log', `${files[i]}\n`, {flag:'a'});
			fs.writeFileSync(files[i], newContent);
			console.log(files[i]);
		}
	}
}


if(job.rename==true) {
	if(dicts.includes('notRenameT')) {
		console.log('Please Remove "notRenameT" from var "dicts" for rename files');
		process.exit(0);
	}
	console.log('Rename Files Begin: ');
	for(let i=files.length-1; i>=0; i--) {
		let newName = files[i];
//		console.log('old name: '+newName);

		newName = adjustor.adjust(newName);

		if(newName==files[i]) {
			console.log('RENAME PASS: '+files[i]);
			continue;
		}

		if(fs.existsSync(newName)) {
			newName += '___';
		}
		console.log('RENAME toT: '+newName);
		fs.moveSync(files[i], newName);
	}
}

if(job.dicts==true) {
	adjustor.outputDictionary('/media/creatxr/DATAW/WORK/webapp/cli/output/dict.ini');
}

console.log(tempT);
