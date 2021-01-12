//Reference Discramer
console.log("Bookwalker Japan", "v20210112.0");
console.log("Reference:", "https://blog.jixun.moe/intercept-bookwalker-tw-image", "by JiXun");
let _detail$retry_ = 0;
let backup;
//Check if reading a trial version of a book
let mode = 0;
if(window.location.hostname.match(/viewer-trial/)) { //A trial version of a book, we will not fully downloading this, we do only for book detail collect.
	console.warn("Trial viewer mode is running, this book is not a full version!!");
	mode = 1;
} else if(window.location.hostname.match(/ptrial/)) { //A Time-base limited book, timely we have daily 10 minutes novel reading scheme.
	console.warn("Ptrial viewer mode is running");
	mode = 2;
}
//10 minutes novel reading scheme
let ptrialtime = {"fT":0, "lT":0};
let interval = 250;
let ptrialtimer;
if(mode == 2) {
	let ptrialcountdown = document.createElement("div");
	if(localStorage.getItem("10min")) {
		console.log("10min exists");
		ptrialtime = JSON.parse(localStorage.getItem("10min"));
		console.log("Last Touch:", ptrialtime.fT, ", in string:", new Date(ptrialtime.fT).toString());
		let now = new Date();
		let jp5am = new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()-1,20,0,0)); //05:00 of GMT+9, at GMT+0 should be 20:00 of day before
		console.log("Japan 5am:", jp5am.getTime(),", in string:", jp5am.toString());
		if((now.getTime() - ptrialtime.fT) > (now.getTime() - jp5am.getTime())) { //first touch in record && 5am in Japan
			console.log("%cit is a cold and snowy day...%c", "background-color:skyblue");
			//First touch before 5am, so this is the first touch of today
			ptrialtime.fT = now.getTime();
			ptrialtime.lT = 600000; //10 minutes => 600 seconds in MilliSeconds
		}
	} else {
        	console.log("10min record not exists");
		//ptrialtime not in localStorage, initial one
		ptrialtime.fT = Date.now();
		ptrialtime.lT = 600000; //10 minutes => 600 seconds in MilliSeconds
		localStorage.setItem("10min", JSON.stringify(ptrialtime));
	}
	toast($(ptrialcountdown).addClass('position-fixed bg-lightgrey p-3').text("00:00"), "warning", ptrialtime.lT > 0 ? ptrialtime.lT : 1000, "10 minutes countdown");
	ptrialtimer = setInterval(function() {
		ptrialtime.lT -= interval;
		localStorage.setItem("10min", JSON.stringify(ptrialtime));
		let lefttime = new Date(Math.abs(ptrialtime.lT));
		$(ptrialcountdown).text(pad(lefttime.getMinutes(),2)+":"+pad(lefttime.getSeconds(),2));
		if(ptrialtime.lT == 60000) {
			if($(partialcountdown).queue() < 20) {
				$(ptrialcountdown).animate({backgroundColor:red}, 750);
				$(ptrialcountdown).animate({backgroundColor:lightgrey}, 750);
			}
		}
		/*if(ptrialtime.lT == 30000) {
			ptrialcountdown.style.color = "red";
		}*/
	}, interval);
}
//
const getDetail = async function(bn, st=5, on="", ta=0) {
	console.debug("getDetail()", bn, st, on);
	let cty = parseInt(getQuery("cty"));
	let bwhp = "https://bookwalker.jp/";
	let eventapi = "https://eventapi.bookwalker.jp/api/";
	let autocom = "https://bookwalker.jp/louis-api/autocomplete/";
	let cat = cty ? 2 : 0; //category { 1 = Novel, 2 = Manga, 3 = Light Novel, 9 = Web Novel }
	console.debug("getDetail()", autocom + "?category="+ cat +"&term=" + bn);
	GM.xmlHttpRequest({
		method: "GET",
		url: autocom + "?category="+ cat +"&term=" + bn,
		onload: async function(res) {
			let j = JSON.parse(res.responseText);
			let f;
			if(j.contents) { //type 1 = Series, 2 = Artist, 3 = Company, 4 = Label, 5 = Book
				console.debug("getDetail(contents)", "auto_result:", j.contents.length);
				f= j.contents.filter(v => (new RegExp(escape(bn)+"(?:%(?:[0-9A-F]{2}|u[0-9A-F]{4})|$)+","i")).test(escape(v.value))).find(v => (v.type == st && (ta == 999 || !(/(期間限定|お試し|試し読み)/.test(v.value)))));
			} else {
				console.debug("getDetail()", "auto_result:", j.length);
				f = j.filter(v => (new RegExp(escape(bn)+"(?:%(?:[0-9A-F]{2}|u[0-9A-F]{4})|$)+","i")).test(escape(v.value))).find(v => (v.type == st && (ta == 999 || !(/(期間限定|お試し|試し読み)/.test(v.value)))));
			}
			console.debug("getDetail()", "find_result:", f != undefined ? true : false);
			let bid;
			let askhelp = 0;
			if(f) { //have matched records
				if(st == 5) { //congrates! exact match found
					bid = "de" + f.typeId;
				} else { //Series search
					console.debug("getDetail()", bwhp + "series/"+ f.typeId +"/list/");
					bid = await new Promise((resolve) => {
						GM.xmlHttpRequest({
							method: "GET",
							url: bwhp + "series/"+ f.typeId +"/list/",
							onload: function(reS) {
								let h = reS.responseText;
								let parser = new DOMParser();
								let html = parser.parseFromString(h, "text/html");
								let non;
								try {
									switch(_detail$retry_) {
										case 1: //clean out whitespace
											non = on.replace(/\s/g, "");
											console.debug("getDetail()", on, "=>", non);
											break;
										case 2: //convert full-widthed character to half-widthed
											non = halfwidthValue(on);
											console.debug("getDetail()", on, "=>", non);
											break;
										default: //no retry or looped?
											non = on;
									}
									let auuid = document.evaluate(".//div[@title='"+ non +"']", html, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.getAttribute('data-uuid');
									resolve('de' + auuid);
								} catch(e) {
									switch(_detail$retry_) {
										case 2: //Free-in-Period books? let's try using full-tagged original title
											console.debug("getDetail()", "use document.title");
											return getDetail(document.title, 5, document.title, 999);
											break;
										default:
											_detail$retry_++;
											return getDetail(bn, st, on);
									}
								} //The name pattern changed!! maybe will add a blur search in future
							}
						});
					});
				}
			} else if(st == 5 && (j.length || j.contents)) { //Try search by series
				return await getDetail(bn.replace(/^\s?(.*?)\s?(?:[：\:]{0,1}\s?[\d０-９]+|[（\(][\d０-９]+[\)）]|[第]?[\d０-９]+[巻話]?)$/g, "$1"), 1, bn);
			} else { //Strange... nothing found
				askhelp = 1;
			}
			if(askhelp) { //Try ask user for help
				let userbid = prompt("Sorry, Record not found. Please help search "+ bn +" at bookwalker.jp and paste bookID or detail page link here");
				//de8a5395a0-df91-4c3c-a676-3c948fbc30ed
				if(/de[0-9a-f]{8}\-(?:[0-9a-f]{4}\-){3}[0-9a-f]{12}/.test(userbid)) {
					bid = userbid.match(/de[0-9a-f]{8}\-(?:[0-9a-f]{4}\-){3}[0-9a-f]{12}/);
				} else { //Giveup maybe the best choice for saving lives...
					Ci.add("/ComicInfo", 'Web', bwhp + bid + '/');
					return;
				}
			}
			Ci.add("/ComicInfo", 'Web', bwhp + bid + '/');
			console.debug("getDetail()", bwhp + bid + '/');
			GM.xmlHttpRequest({
				method: "GET",
				url: bwhp + bid,
				onload: function(res) {
					let h = res.responseText;
					let parser = new DOMParser();
					let html = parser.parseFromString(h, "text/html");
					//bd.author = [].slice.call(html.getElementsByClassName('author-name')).map(e => e.innerHTML).join('×');
					let authors = html.querySelectorAll("dl.author");
					bd.author = [];
					let wt, pcl;
					for(let i=0;i<authors.length;i++) {
						try {
							const at = authors[i].getElementsByClassName('author-head')[0].innerText.split('・');
							const an = authors[i].getElementsByClassName('author-name')[0].innerText.replace(/(（.*?）|\s)/g, "");
							at.forEach((v) => {
								if(/キャラ|設定/.test(v)) { //キャラクター原案
									bd.author.push({'p':4, 'type':v, 'name':an});
								} else if(/^([原][著作])$/g.test(v)) { //原作, 原著
									bd.author.push({'p':0, 'type':v, 'name':an});
								} else if(/^[著作][者]?$/.test) { //著, 作, 著者, 作者
									bd.author.push({'p':1, 'type':v, 'name':an});
								} else if(/(画|マンガ|イラスト)/g.test(v)) { //漫画, マンガ, イラスト
									bd.author.push({'p':2, 'type':v, 'name':an});
								} else if(v != "") {
									bd.author.push({'p':5, 'type':v, 'name':an});
								}
							});
						} catch(e){};
					}
					bd.author.sort(function(a,b) { return a.p - b.p; }); //sort by priority
					pcl = [];
					bd.author.forEach((v) => {
						if(!wt || (!wt && v.p == 1)) {
							wt = v.name;
						} else if(v.p < 4) {
							pcl.push(v.name);
						}
					});
					//bd.author.sort(function(a,b) { if(a.name < b.name) { return -1 } else if(a.name > b.name) { return 1 } return 0; }); //sort by name
					Ci.add("/ComicInfo", "Writer", wt);
					if(pcl.length) Ci.add("/ComicInfo", "Penciller", pcl.join(','));
					let author_filtered = [wt];
					author_filtered = author_filtered.concat(pcl.uniquify("name"));
					console.table(author_filtered);
					if(author_filtered.length) {
					        fn = '[' + author_filtered.splice(0,Math.min(author_filtered.length,3)).join('×') + '] ' + fn;
					} else {
					        fn = '[' + bd.author.splice(0,Math.min(bd.author.length,3)).map(e=>e.name).join('×') + '] ' + fn;
					}
					console.log(fn);
					document.title = fn;
					const pD = document.evaluate("//dt[text()='配信開始日']", html, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.nextElementSibling.innerText;
					const pDate = pD.split('/');
					Ci.add("/ComicInfo", "Year", pDate[0]);
					Ci.add("/ComicInfo", "Month", pDate[1]);
					Ci.add("/ComicInfo", "Day", pDate[2]);
					console.debug("Published Date: %s/%s/%s", ...pDate);
					Ci.add("/ComicInfo", "LanguageISO", "ja");
					Ci.add("/ComicInfo", "BlackAndWhite", "Yes");
					cty ? Ci.add("/ComicInfo", "Manga", "YesAndRightToLeft") : Ci.add("/ComicInfo", "Manga", "No");
					toast(fn, "info", 0, "Title");
				}
			});
		}
	});
} // Get Detail of Book
function main() {
	console.log("main");
	backup = unsafeWindow.NFBR.a6G.a5x.prototype.b9b;
	unsafeWindow.NFBR.a6G.a5x.prototype.b9b = function () {
		let [targetCanvas, page, image, drawRect, flag] = arguments;
		totp = ($('#pageSliderCounter').text()).split('/')[1] * 1;
		if(!pages) {
			pages = new comicInfoPages(totp);
		}
		curp = page.index+1;
		if(_$canvas[curp] == undefined) {
			_$canvas[curp] = [];
			if(!_$canvas[1] && curp > 1) return firekey($('#renderer')[0], 36); //Home
		} else {
			if(retry && img$size[curp]) return firekey($('#renderer')[0], 34); //Page Down
			if(startf && curp > startf && !img$size[curp-1]) return firekey($('#renderer')[0], 33); //Page Up
		}
		if (image && !img$size[curp]) {
			console.groupCollapsed("Page", curp, "/", totp);
			$(pcv).attr({"aria-valuemax":totp, "aria-valuenow":curp});
			$(pcv).find('span').text("Capture Canvas: "+curp +"/"+ totp);
			const c = document.createElement('canvas');
			$(c).addClass('position-fixed border border-success').css({left:'20vw', top:'30vh', height:'30vh', userSelect:'none', pointerEvents:'none', transition:'all ease 3s'}).attr({id:"p"+page.index});
			$(c).on("transitionend", function() {
				$(this).remove();
				$(this).ontransitionend = null;
			});
			setTimeout(function() {$(c).css({opacity:0,left:"-20vw"})}, 1000);
			$(c).attr({width:page.width, height:page.height}).appendTo('body');
			backup.call(this, c, page, image, {x:0, y:0, width:page.width, height:page.height}, flag);
			img$size[curp] = Math.round((c.toDataURL('image/jpeg')).length *3 /4);
			console.log("size:", Math.round(img$size[curp]/1024).toFixed(2), "KBytes");
			c.toBlob(async(v)=>{
				zip.file("P"+pad(curp, 5) + ".jpg", v);
				if(curp == 1) pages.setPageAttr(curp-1, 'Type', 'FrontCover');
				pages.setPageAttr(curp-1, 'ImageWidth', c.width);
				pages.setPageAttr(curp-1, 'ImageHeight', c.height);
				pages.setPageAttr(curp-1, 'ImageSize', v.size);
				//if((curp >= totp || mode == 1) && startf) {
				if(curp >= totp && startf) {
					if(mode != 1) {
						Ci.add("/ComicInfo", "ScanInfomation", scan);
						Ci.addPageCollection(pages);
					}
					zip.file("ComicInfo.xml", Ci.toString(), {type: "text/xml"});
					console.groupCollapsed('ComicInfo.xml');
					console.log(Ci.ComicInfo);
					console.groupEnd();
					$(pcv).addClass('bg-success').attr({"aria-valuemin":0, "aria-valuemax":100});
					console.groupCollapsed('Zip progress');
					let pchk = 0;
					let bchk = setInterval(function() {
						console.debug(pchk+'%');
						$(pcv).find('span').text("Generating zip...("+ pchk +"%)");
						window.document.title = "["+Math.ceil(pchk)+"%] "+on;
						//favicon.badge(Math.ceil(pchk), {'bgColor':'#6a7'});
					}, 1000);
					zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
						pchk = metadata.percent.toFixed(2);
						$(pcv).attr('aria-valuenow', pchk).css({width:pchk+"%"});
					}).then(function (blob) {
						clearInterval(bchk);
						console.groupEnd();
						startf = 0;
						const Url = window.URL.createObjectURL(blob);
						console.group("Zip URL(Debug Uses)")
						console.debug(Url);
						console.groupEnd();
						const e = new MouseEvent("click");
						const a = document.createElement('a');
						$(a).attr({download:fn+".zip", href:Url}).text('Download').appendTo($(maindiv));
						a.dispatchEvent(e);
						window.document.title = "\u2705" + on;
						if(document.hidden) popout("Collect Completed.", fn, "https://viewer.bookwalker.jp/favicon.ico");
						_job_time = new Date() - _job_time;
						console.log("Book Download Time:", _job_time/1000, "sec");
						toast($(a), "success", -1, "Job Done");
						setTimeout(function() {
							$(pc).attr('height', '0px');
							ss.pause();
							startf=0;
						}, 5000);
					});
				} else {
					_$timer = 0;
				}
				if(startf) {
					window.document.title = "["+curp+"/"+totp+"] "+on;
					firekey($('#renderer')[0], 34);
				} else {
					if(!wait && img$size[curp] > 20000) { //Detail collect will only do once and Cover should be larger than 20KB
						wait = 1;
						on = $("#pagetitle").text();
						on = on.replace(/\s?【[^【】]*(無料|お試し|試し読み)[^【】]*】\s?/g, " ").replace(/^\s+|\s+$/gm,''); //[Only for Period] will left for Bookwalker Stupid Retarded Search Engine
						await getDetail(on);
						on = on.replace(/\s?【[^【】]*(期間限定|特典)[^【】]*】\s?/g, " ").replace(/^\s+|\s+$/gm,'');; //Now I can remove them for series name
						const ser = on.replace(/^\s?(.*?)\s?(?:[：\:]{0,1}\s?([\d０-９]+)|[（\(]([\d０-９]+)[\)）]|[第]?([\d０-９]+)[巻話]?)$/, "$1");
						let num = halfwidthValue(on).replace(/.*?[第\:]?(\d+)[巻話\)]?$/, "$1");
						if(isNaN(parseInt(num))) { //Books may only have single volume, so no volume number
							fn = ser;
							num = 1;
						} else {
							fn = ser + " 第"+pad(num, 2)+"巻";
						}
						//Get Table of Contents(Bookmarks)
						//Encrypted in configuration_pack.json => configuration["nav-list"] => BUT NO SOLUTION YET
						//
						Ci.add("/ComicInfo", "Number", pad(num,2));
						Ci.add("/ComicInfo", 'Title', fn);
						Ci.add("/ComicInfo", 'Series', ser);
						if(mode != 1) Ci.add("/ComicInfo", 'PageCount', totp);
						$(bndlBTN).removeAttr("disabled");
						$(maindiv).attr({width:"100%", height:"100%"});
						$(pc).css({height:'25px'});
						ss.play();
						_init_time = new Date() - _init_time;
						console.log("Initialization time used:", _init_time/1000, "sec");
                        			stage = 1;
						toast("", "info", 10000, "Job Ready");
					}
				};
			}, 'image/jpeg', quality);
			console.log("Page generation time:", (new Date() - _page_time)/1000, "sec");
			_page_time = new Date();
			console.groupEnd();
		}
		if(!show_org) targetCanvas = $('canvas')[0];
		return backup.apply(this, [targetCanvas, page, image, drawRect, flag]);
	}
}
start = function() {
	$(bndlBTN).attr({disabled:true});
	$(maindiv).addClass('w-100 h-100');
	startf = ($('#pageSliderCounter').text()).split('/')[0] * 1;;
	firekey($('#renderer')[0], 34);
}
cancel = function() {
	if(startf) {
		$(bndlBTN).removeAttr("disabled");
		$(maindiv).removeClass('w-100 h-100');
		startf = 0;
		toast("", "warning", 5000, "Job Paused");
	} else {
		unsafeWindow.NFBR.a6G.a5x.prototype.b9b = backup;
		$(maindiv).remove();
		toast("", "danger", -1, "Job Canceled");
	}
}
const _$IfuBW_NFBR$_ = setInterval(function() {
	if(unsafeWindow.NFBR.a6G && unsafeWindow.NFBR.a6G.a5x.prototype.b9b) {
		clearInterval(_$IfuBW_NFBR$_);
		_page_time = _job_time = new Date();
		main();
	}
}, 100);
let nospreadinit;
const ___$nospeard = setInterval(async function() {
	if(!nospreadinit) {
		if($("#menu")[0].classList.contains("show")) {
			$("#showSettingPanel")[0].click();
			nospreadinit = $("#spread_false")[0];
		}
	} else {
		console.debug(nospreadinit);
		nospreadinit.click();
		clearInterval(___$nospeard);
	}
}, 100);
const ___$loopcheckdead = setInterval(function() {
	let dead = 0;
	if(stage == 0 && _init_time && Date.now() - _init_time > 30000) {
        console.error("init dead");
		dead = 1;
	} else if(startf && _page_time && Date.now() - _page_time > 30000) {
        console.error("page dead");
		dead = 1;
	}
	if(dead && !$('#dead_body').length) {
		let _$content = $('<div>').attr({id:'dead_body'});
		let a1 = $('<a>').attr({href:'#'}).text('Download Incomplete Archive');
		a1.on('click', function() {
			bndl_d.dlzip();
		});
		a1.appendTo(_$content);
		toast(_$content, "danger", -1, "Job frozen")
        clearInterval(___$loopcheckdead);
	}
}, 1000);
let stage = 0;
$(maindiv).show(500);
