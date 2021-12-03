//Reference Discramer
console.log("BW Japan", "v20211204.2");
console.log("Reference:", "https://fireattack.wordpress.com/", "by fireattack");
let _detail$retry_ = 0;
let backup, control, menu, renderer, model;
//Check if reading a trial version of a book
let mode = 0;
let pop = false;
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
			console.log("%cIt was a cold and snowy day...%c", "background-color:skyblue");
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
	toast($(ptrialcountdown).text("00:00"), "warning", ptrialtime.lT > 0 ? ptrialtime.lT : 1000, "10 minutes countdown", {"htmlBody":true});
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
try {
	bndlBTN = tzrStartBTN;
	[tzr_start, tzr_stop] = [start, cancel];
} catch(e){};

const actlist = function(aaa, bbb=[]) {
    const albody = $("<div />");
    albody.css({'background':'black', width:'100%',height:'100%'});
    const tobj = toast(albody, "warning", -1, "Select Book Record", {"htmlBody":true});
    return new Promise((resolve) => {
    for(let i=0;i<aaa.length;i++) {
      let item = $("<div />");
      item.css({'background':'lightgrey','border':'solid 1px','userSelect':'none','cursor':'pointer'}).text(aaa[i]);
      item.hover(function(){$(this).css({'background':'grey'})},
                 function(){$(this).css({'background':'lightgrey'})});
      item.data({val:bbb[i]||i});
      item.click(function(){
      	resolve($(this).data("val"));
        tobj.data('close')();
      });
      albody.append(item);
    }
  });
}

//
let f, g;
const getDetail = async function(bn, st=5, on="", ta=null, bid=null) { //Bookname(keywords), search type, original Title, ???, bookID
	console.debug("getDetail()", bn, st, on, ta, bid);
	return new Promise(async function(resolve) {
		let cty = parseInt(getQuery("cty"));
		let bwhp = "https://bookwalker.jp/";
		let eventapi = "https://eventapi.bookwalker.jp/api/";
		let autocom = "https://bookwalker.jp/louis-api/autocomplete/";
		let cat = ta==null ? (cty ? 2 : 1) : ta; //category { 1 = Novel, 2 = Manga, 3 = Light Novel, 9 = Web Novel }
		if(mode==0 && model.attributes) bid='de'+model.attributes.contentId;
		if(!/[0-9a-f]{8}\-(?:[0-9a-f]{4}\-){3}[0-9a-f]{12}/.test(bid)) {
			if(!bid) {
				console.debug("getDetail()", autocom + "?category="+ cat +"&term=" + encodeURIComponent(bn));
				f = await new Promise((resolve) => {
					GM.xmlHttpRequest({
						method: "GET",
						url: autocom + "?category="+ cat +"&term=" + encodeURIComponent(bn),
						onload: async function(res) {
							let j = JSON.parse(res.responseText);
							if(j.contents) { //type 1 = Series, 2 = Artist, 3 = Company, 4 = Label, 5 = Book
								console.debug("getDetail(contents)", "auto_result:", j.contents.length);
								g = j["contents"];
								f= j.contents.filter(v => (new RegExp(escape(bn)+"(?:%(?:[0-9A-F]{2}|u[0-9A-F]{4})|$)+","i")).test(escape(v.value))).find(v => (v.type == st && (ta == 999 || !(/(期間限定|お試し|試し読み)/.test(v.value)))));
							} else {
								console.debug("getDetail()", "auto_result:", j.length);
								g = j;
								f = j.filter(v => (new RegExp(escape(bn)+"(?:%(?:[0-9A-F]{2}|u[0-9A-F]{4})|$)+","i")).test(escape(v.value))).find(v => (v.type == st && (ta == 999 || !(/(期間限定|お試し|試し読み)/.test(v.value)))));
							}
							console.debug("getDetail()", "find_result:", f != undefined ? f.length : false);
							resolve(f);
						}
					});
				});
			}
			let askhelp = 0;
			console.log("retried: "+ _detail$retry_);
			_detail$retry_++;
			if(!bid && f && _detail$retry_ < 20) { //have matched records
				if(g.length == 1 && st == 5) { //congrates! exact match found
					bid = "de" + f.typeId;
				} else if(g.length > 1) {
					let bookname = g.map(v=>v.value);
					let itemidx = await actlist(bookname);
					bid = g[itemidx] ? g[itemidx].typeId : null;
				}
			} else if(/^\d+$/.test(bid)) { //Series search
				console.debug("getDetail()", bwhp + "series/"+ bid +"/list/");
				if(st == 5) _detail$retry_ = 0;
				bid = await new Promise((resolve) => {
					GM.xmlHttpRequest({
						method: "GET",
						url: bwhp + "series/"+ bid +"/list/",
						onload: async function(reS) {
							let h = reS.responseText;
							let parser = new DOMParser();
							let html = parser.parseFromString(h, "text/html");
							let non, nno, auuid;
							let regex = new RegExp("[（）【】]", "g");
							let linklist = Array.from(html.querySelectorAll(".m-book-item__title > a[title]"));
							let bookname = linklist.map(v=>v.title);
							let maxpage = 1;
							try {
								let lili;
								lili = html.querySelector("li.o-pager-last > a");
								if(!lili) lili = html.querySelector("li.o-pager-next > a");
								if(lili) maxpage = lili.href.match(/page=(\d+)/)[1];
								maxpage = maxpage ? maxpage : 1;
							} catch{};
							while(!auuid && _detail$retry_ < 20) {
								_detail$retry_++;
								try {
									let tar;
									tar = Array.from(html.querySelectorAll("a[title*='"+ non +"']")).filter(v => !/(期間限定|お試し|試し読み)/.test(v.title));
									if(!tar.length) tar = Array.from(html.querySelectorAll("a[title*='"+ halfwidthValue(non) +"']")).filter(v => !/(期間限定|お試し|試し読み)/.test(v.title));
									if(tar.length == 1) {
										auuid = tar[0].href.split('/')[3] || null;
									} else if(tar.length > 1) {
										let itemidx = await actlist(bookname);
										auuid = linklist[itemidx].href.split('/')[3] || null;
									}
								} catch(e) {} //The name pattern changed!! maybe will add a blur search in future
							}
							if(!auuid) {
								let itemidx = await actlist(bookname);
								auuid = linklist[itemidx].href.split('/')[3] || null;
							}
							if(!auuid && maxpage > page) {
								ta = page+1;
							}
							return resolve(auuid);
						}
					});
				});
				return resolve(await getDetail(bn, 1, on, ta, bid));
			} else if(_detail$retry_ < 10) {
				on = on || bn;
				let regex = new RegExp("[（）【】]", "g");
				let idx = bn.length, res;
				while((res = regex.exec(bn)) != null) { console.log(regex.lastIndex); idx = regex.lastIndex-1 }
				bn = bn.substr(0, idx);
				console.log(idx, bn);
				return resolve(await getDetail(bn, st, on, 0));
			} else if(st == 5 && _detail$retry_ >= 10) { //Try search by series
				if(st == 5) _detail$retry_ = 0;
				return resolve(await getDetail(bn.replace(/^\s?(.*?)\s?(?:[：\:]{0,1}\s?[\d０-９]+|[（\(][\d０-９]+[\)）]|[第]?[\d０-９]+[巻話]?)$/g, "$1"), 1, bn));
			} else { //Strange... nothing found
				askhelp = 1;
			}
			if(askhelp) { //Try ask user for help
				let userbid = prompt("Sorry, Record not found. Please help search "+ bn +" at bwJP site and paste bookID or detail page link here");
				//de8a5395a0-df91-4c3c-a676-3c948fbc30ed
				if(/de[0-9a-f]{8}\-(?:[0-9a-f]{4}\-){3}[0-9a-f]{12}/.test(userbid)) {
					bid = userbid.match(/de[0-9a-f]{8}\-(?:[0-9a-f]{4}\-){3}[0-9a-f]{12}/);
				} else { //Giveup maybe the best choice for saving lives...
					if(model.attributes) bid='de'+model.attributes.contentId;
					Ci.add("/ComicInfo", 'Web', bwhp + bid + '/');
				}
			}
			return resolve(await getDetail(bn, st, on, ta, bid));
		} else {
			if(bid.startsWith("[")) return resolve(bid);
			if(!bid.startsWith("de")) bid = 'de'+bid;
			Ci.add("/ComicInfo", 'Web', bwhp + bid + '/');
			console.debug("getDetail()", bwhp + bid + '/');
			GM.xmlHttpRequest({
				method: "GET",
				url: bwhp + bid,
				onload: function(res) {
					let h = res.responseText;
					let parser = new DOMParser();
					let html = parser.parseFromString(h, "text/html");
					let authors = $(html).find("dl.p-author > dd");
					bd.author = [];
					let wt, pcl;
					for(let i=0;i<authors.length;i++) {
						try {
							const an = $(authors[i]).find("a").text().trim().split('・');
							const at = $(authors[i]).prev('dt').text().trim().replace(/(（.*?）|\s)/g, "") || "";
							an.forEach((v,i) => {
								if(/キャラ|設定/.test(at)) { //キャラクター原案
									bd.author.push({'p':4, 'type':at, 'name':v});
								} else if(/^(原[著作])$/g.test(at)) { //原作, 原著
									bd.author.push({'p':0, 'type':at, 'name':v});
								} else if(/^[著作][者]?$/.test(at)) { //著, 作, 著者, 作者
									bd.author.push({'p':1, 'type':at, 'name':v});
								} else if(/(画|マンガ|まんが|イラスト)/g.test(at)) { //画, 漫画, マンガ, イラスト
									bd.author.push({'p':2, 'type':at, 'name':v});
								} else if(at[i] != "") {
									bd.author.push({'p':5, 'type':at, 'name':v});
								}
							});
						} catch(e){};
					}
					bd.author = bd.author.sort(function(a,b) { return a.p - b.p; }).uniquify("name"); //sort by priority
					pcl = [];
					bd.author.forEach((v) => {
						if(!wt || (!wt && v.p == 1)) {
							wt = v.name;
						} else if(v.p < 4) {
							pcl.push(v.name);
						}
					});
					bd.writer = wt;
					bd.penciler = pcl;
					//bd.author.sort(function(a,b) { if(a.name < b.name) { return -1 } else if(a.name > b.name) { return 1 } return 0; }); //sort by name
					Ci.add("/ComicInfo", "Writer", wt);
					if(pcl.length) {
						pcl = pcl.uniquify().sort();
						Ci.add("/ComicInfo", "Penciller", pcl.join(', '));
					}
					let author_filtered = Array.isArray(wt) ? wt : [wt];
					author_filtered = author_filtered.concat(pcl).uniquify();
					console.table(author_filtered);
					let autag = '';
					if(author_filtered.length) {
						autag = '[' + author_filtered.splice(0,Math.min(author_filtered.length,3)).join('×') + '] ';
					} else {
						autag = '[' + bd.author.splice(0,Math.min(bd.author.length,3)).map(e=>e.name).join('×') + '] ';
					}
					bd.originalTitle = on || bn;
					fn = halfwidthValue(autag + (on || bn));
					bd.fileName = fn;
					console.log('getDetaik(fn): '+ fn);
					document.title = fn;
					const info = $(html).find(".p-information__data");
					const pD = info.find("dt:contains('配信開始日'):last").next().text();
					const pDate = pD.split('/');
					bd.publishDate = new Date(pDate[0], pDate[1]-1, pDate[2]);
					Ci.add("/ComicInfo", "Year", pDate[0]);
					Ci.add("/ComicInfo", "Month", pDate[1]);
					Ci.add("/ComicInfo", "Day", pDate[2]);
					console.debug("Published Date: %s/%s/%s", ...pDate);
					const imp = info.find("dt:contains('レーベル'):last").next().text();
					Ci.add("/ComicInfo", "Imprint", imp);
					const ser = info.find("dt:contains('シリーズ'):last").next().text();
					Ci.add("/ComicInfo", "Series", ser.replace(/([^（]+)\s*[（]?.*/, "$1").trim());
					Ci.add("/ComicInfo", "LanguageISO", "ja");
					Ci.add("/ComicInfo", "BlackAndWhite", "Yes");
					cty ? Ci.add("/ComicInfo", "Manga", "YesAndRightToLeft") : Ci.add("/ComicInfo", "Manga", "No");
					Ci.add("/ComicInfo", "Summary", $(html).find("p.p-summary__text").text().trim());
					toast('html:<a href="'+bwhp+bid+'" target="_blank">'+fn+'</a>', "info", 0, "Title");
					// TOC
					console.groupCollapsed("TOS");
					try {
						const toc = t1["toc_"];
						const tocidx = t1[t2];
						toc.forEach(function(v,i) {
							pages.setPageAttr(parseInt(tocidx[v.href]), "Bookmark", v.label);
							console.log(v.label, ":", parseInt(tocidx[v.href]));
						});
					} catch(e) {};
					console.groupEnd();
					return resolve(autag);
				}
			});
		}
	});
} // Get Detail of Book
function main() {
	console.log("main");
	let _sdb=[];
	const data = {labels:[],datasets:[{backgroundColor:'rgba(99,99,222,0.2)',borderColor:'rgba(99,99,222,0.8)',type:'line',label:'usetime',fill:'start',pointRadius:0,data:_pdb},
            	{backgroundColor:'rgba(99,222,99,0.2)',borderColor:'rgba(99, 222, 99, 0.8)',yAxisID:'y-axis-2',type:'line',label:'size',fill:'end',pointRadius:0,data:_sdb}]};
	const options = {scales:{responsive:true,xAxes:[{display:false}],
		yAxes:[{position:'left'},{id:'y-axis-2',reverse:true,position:'right'}],},
        	tooltips: {mode:'index',intersect:false},
        	hover: {mode: 'index',intersect: false}};
	const ptc = toastchart(data, options, 'Page Time');
	backup = r1[r2];
	r1[r2] = function () {
		let [targetCanvas, page, image, drawRect, flag] = arguments;
		let totp = ($('#pageSliderCounter').text()).split('/')[1] * 1;
		gtotp = totp;
		if(!pages) {
			pages = new comicInfoPages(totp);
		}
		let curp = page.index+1;
		gcurp = curp;
		if(_$canvas[curp] == undefined) {
			_$canvas[curp] = [];
			if(!_$canvas[1] && curp > 1) return control.moveToFirst();
		} else {
			if(retry && img$size[curp]) return control.moveToNext(); //Page Down
			if(startf && curp > startf && !img$size[curp-1]) return control.moveToPrevious(); //Page Up
		}
		if (image && !img$size[curp]) {
			console.groupCollapsed("Page", curp, "/", totp, "("+(zip.file(/.*/).length+1),"files zipped)");
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
					Ci.add("/ComicInfo", "ScanInfomation", scan);
					Ci.addPageCollection(pages);
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
						$(pcv).find('span').text("Done!");
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
						if(pop && document.hidden) popout("Collect Completed.", fn, "https://viewer.bookwalker.jp/favicon.ico");
						_job_time = new Date() - _job_time;
						console.log("Book Download Time:", _job_time/1000, "sec");
						toast($(a), "success", -1, "Job Done", {"htmlBody":true});
						setTimeout(function() {
							$(pc).hide();
							ss.pause();
							startf=0;
						}, 5000);
					});
				} else {
					_$timer = 0;
				}
				if(startf) {
					window.document.title = "["+curp+"/"+totp+"] "+on;
					control.moveToNext();
				} else {
					if(!wait && img$size[curp] > 20000) { //Detail collect will only do once and Cover should be larger than 20KB
						wait = 1;
						on = model.get('contentTitle') || $("#pagetitle").text();
						if(on.match(/\s?【[^【】]*(無料|お試し|試し読み)[^【】]*】\s?/)) mode=1;
						on = on.replace(/\s?【[^【】]*(無料|お試し|試し読み)[^【】]*】\s?/g, " ").replace(/^\s+|\s+$/gm,''); //[Only for Period] will left for BW Stupid Retarded Search Engine
						await getDetail(on);
						on = on.replace(/\s?【[^【】]*(限定|特典)[^【】]*】\s?/g, " ").replace(/^\s+|\s+$/gm,'');; //Now I can remove them for series name
						let ser = on.replace(/^\s?(.*?)\s?(?:[：\:]{0,1}\s?([\d０-９]+)|[（\(]([\d０-９]+)[\)）]|[第]?([\d０-９]+)[巻話]?)$/,  function(...args) {
							const [match, p, offset, string] = [args[0], args.slice(1, -2).filter(v=>v), args[args.length-2], args[args.length-1]];
							return p[0];
						});
						let num = on;
						if(Ci.get("/ComicInfo/Series")) num = num.replace(Ci.get("/ComicInfo/Series"), "");
						num = halfwidthValue(num);
						if(Number.hasOwnProperty("fromRoman")) num = num.replace(/\s([IVX]+)(\s.*)?$/i, function(m,p,q,r,o,s){return Number.fromRoman(p);});
						num = num.replace(/.*?[第\:]?(\d+)[巻話\)]?.*?$/, "$1");
						if(isNaN(parseInt(num))) { //Books may only have single volume, so no volume number
							num = 1;
						}
						Ci.add("/ComicInfo", "Number", pad(num,2));
						Ci.add("/ComicInfo", 'Title', on);
						if(!Ci.get("/ComicInfo/Series")) Ci.add("/ComicInfo", 'Series', ser);
						Ci.add("/ComicInfo", 'PageCount', totp);
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
			let cpt = (new Date() - _page_time)/1000;
			_sdb.push({x:curp-1,y:Math.round(img$size[curp])});
			ptc.updateChart({x:curp-1,y:cpt});
			console.log("Page generation time:", cpt, "sec");
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
	_page_time = new Date();
	control.moveToNext();
}
cancel = function() {
	if(startf) {
		$(bndlBTN).removeAttr("disabled");
		$(maindiv).removeClass('w-100 h-100');
		startf = 0;
		toast("", "warning", 5000, "Job Paused");
	} else {
		r1[r2] = backup;
		$(maindiv).remove();
		toast("", "danger", -1, "Job Canceled");
	}
}
let r1, r2="G1W", m1, m2="Z4p", t1, t2="L1u"; //The Legend Keys
const qwer = "%4e%46%42%52"; //The magic word
let asdf; //The throne of brave
const _$IfuBW_FFFF$_ = setInterval(function() {
	if(!asdf) asdf = (unsafeWindow ? unsafeWindow[decodeURI(qwer)] : window[decodeURI(qwer)]) || eval(decodeURI(qwer));
	r1 = asdf.a6G.a5x.prototype;
	m1 = asdf.a6G.Initializer;
	if(typeof r1 != "undefined" && typeof r1[r2] != "undefined" &&
       typeof m1[m2] != "undefined") {
		try {
			menu = m1[m2].menu;
			control = menu.a6l;
			model = menu.model;
			t1 = model.attributes.a2u.book.content.normal_default;
			renderer = m1[m2].renderer;
			clearInterval(_$IfuBW_FFFF$_);
			_page_time = _job_time = new Date();
			next = ()=>{control['moveToNext']()};
			prev = ()=>{control['moveToPrevious']()};
			main();
		} catch {
			console.debug('r1', r1, 'r2', r1[r2], 'm1', m1, 'm2', m1[m2], 'menu', menu, 'control', control, 'model', model, 'renderer', renderer);
		}
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
		toast(_$content, "danger", -1, "Job frozen?", {"htmlBody":true});
		clearInterval(___$loopcheckdead);
	}
}, 1000);
const path2var = function(patharr) {
	try {
		if(Array.isArray(patharr)) {
			let rtn = asdf;
			for(let i=0; i<patharr.length; i++) {
				if(patharr[i]) {
					rtn = rtn[patharr[i]];
				}
			}
			return rtn;
		}
	} catch(e) {};
	return undefined;
}
let stage = 0;
$(maindiv).show(500);
