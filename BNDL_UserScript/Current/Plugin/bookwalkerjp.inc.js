//Reference Discramer
console.log("Reference: https://blog.jixun.moe/intercept-bookwalker-tw-image by JiXun");
const getDetail = async function(bn, st=5, on="", ta=0) {
	console.debug("getDetail()", bn, st, on);
	let cty = parseInt((new URLSearchParams(window.location.search)).get('cty'));
	let bwhp = "https://bookwalker.jp/";
	let eventapi = "https://eventapi.bookwalker.jp/api/";
	let autocom = "https://bookwalker.jp/louis-api/autocomplete/";
	let cat = cty ? 2 : 0; //category 1 = Novel, 2 = Manga, 3 = Light Novel, 9 = Web Novel
	console.debug("getDetail()", autocom + "?category="+ cat +"&term=" + bn);
	GM.xmlHttpRequest({
		method: "GET",
		url: autocom + "?category="+ cat +"&term=" + bn,
		onload: async function(res) {
			let j = JSON.parse(res.responseText);
			let f;
			if(j.contents) { //type 1 = Series, 2 = Artist, 3 = Company, 4 = Label, 5 = Book
				console.debug("getDetail(contents)", "auto_result:", j.contents.length);
				f= j.contents.filter(v => (new RegExp(escape(bn)+"(?:%(?:[0-9A-F]{2}|u[0-9A-F]{4})|$)+","i")).test(escape(v.value))).find(v => (v.type == st && (ta || !(/(期間限定|お試し|試し読み)/.test(v.value)))));
			} else {
				console.debug("getDetail()", "auto_result:", j.length);
				f = j.filter(v => (new RegExp(escape(bn)+"(?:%(?:[0-9A-F]{2}|u[0-9A-F]{4})|$)+","i")).test(escape(v.value))).find(v => (v.type == st && (ta || !(/(期間限定|お試し|試し読み)/.test(v.value)))));
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
								try {
									let auuid = document.evaluate(".//div[@title='"+ on +"']", html, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.getAttribute('data-uuid');
									resolve('de' + auuid);
								} catch(e) { return getDetail(document.title, 5, document.title, 1) } //The name pattern changed!! maybe will add a blur search in future
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
				if(/^[\/]?de/.test(userbid)) {
					bid = userbid.match(/de[0-9a-z\-]+/);
				} else { //Giveup maybe the best choice for saving lives...
					let web = document.createElementNS(null, 'Web');
					web.innerHTML = bwhp + bid + '/';
					Ci.appendChild(web);
					return;
				}
			}
			let web = document.createElementNS(null, 'Web');
			web.innerHTML = bwhp + bid + '/';
			Ci.appendChild(web);
			console.debug("getDetail()", bwhp + bid + '/');
			GM.xmlHttpRequest({
				method: "GET",
				url: bwhp + bid,
				onload: function(res) {
					let h = res.responseText;
					let parser = new DOMParser();
					let html = parser.parseFromString(h, "text/html")
					//bd.author = [].slice.call(html.getElementsByClassName('author-name')).map(e => e.innerHTML).join('×');
					let authors = html.querySelectorAll("div.authors");
					bd.author = [];
					for(let i=0;(i<authors.length && authors.length>2);i++) {
						try {
							const at = authors[i].getElementsByClassName('author-head')[0].innerText;
							const an = authors[i].getElementsByClassName('author-name')[0].innerText.replace(/(（.*?）|\s)/g, "");
							if(/(原作|著)/g.test(at)) {
								let wt = document.createElementNS(null, 'Writer');
								wt.innerHTML = an;
								Ci.appendChild(wt);
								if(bd.author.filter(x => x.p == 0).length < 2) bd.author.push({'p':0, 'type':at, 'name':an});
							} else if(/(作画|漫画|イラスト)/g.test(at)) {
								let pcl = document.createElementNS(null, 'Penciller');
								pcl.innerHTML = an;
								Ci.appendChild(pcl);
								bd.author.push({'p':1, 'type':at, 'name':an});
							} else if(/キャラ/.test(at)) {
								//
							} else if(at != "") {
								let wt = document.createElementNS(null, 'Writer');
								wt.innerHTML = an;
								Ci.appendChild(wt);
								bd.author.push({'p':4, 'type':at, 'name':an});
							};
						} catch(e){};
					}
					bd.author.sort(function(a,b) { if(a.name < b.name) { return -1 } else if(a.name > b.name) { return 1 } return 0; }); //sort by name
					bd.author.sort(function(a,b) { return a.p - b.p; }); //sort by priority
					console.debug(bd.author);
					if(bd.author.length <= 3) {
						fn = '[' + bd.author.map(e=>e.name).join('×') + '] ' + fn;
					} else {
						fn = '[' + bd.author.splice(0,3).map(e=>e.name).join('×') + '] ' + fn;	
					}
					const pD = document.evaluate("//dt[text()='配信開始日']", html, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.nextElementSibling.innerText;
					let Yt = document.createElementNS(null, 'Year');
					let Mt = document.createElementNS(null, 'Month');
					let Dt = document.createElementNS(null, 'Day');
					[Yt.innerHTML, Mt.innerHTML, Dt.innerHTML] = pD.split('/');
					console.debug("Published Date:", pD, Yt.innerHTML, Mt.innerHTML, Dt.innerHTML);
					Ci.appendChild(Yt);
					Ci.appendChild(Mt);
					Ci.appendChild(Dt);
				}
			});
		}
	});
} // Get Detail of Book
const halfwidthValue = (value) => {return value.replace(/[\uff01-\uff5e]/g, fullwidthChar => String.fromCharCode(fullwidthChar.charCodeAt(0) - 0xfee0)).replace(/\u3000/g, '\u0020')}
function main() {
	const backup = unsafeWindow.NFBR.a6G.a5x.prototype.b9b;
	unsafeWindow.NFBR.a6G.a5x.prototype.b9b = function () {
		let [targetCanvas, page, image, drawRect, flag] = arguments;
		const totp = (document.getElementById('pageSliderCounter').innerHTML).split('/')[1] * 1;
		let curp = page.index+1;
		if(_$canvas[curp] == undefined) {
			_$canvas[curp] = [];
			if(!start && curp > 1) return firekey(document.getElementById('renderer'), 36); //Home
		} else {
			if(retry && img$size[curp]) return firekey(document.getElementById('renderer'), 34); //Page Down
			if(curp > 1 && !img$size[curp-1]) return firekey(document.getElementById('renderer'), 33); //Page Up
		}
		if (image && !img$size[curp]) {
			console.groupCollapsed("Page", curp, "/", totp);
			pc.setAttribute("max", totp);
			pc.setAttribute("value", curp);
			pc.setAttribute("data-label", "Capture Canvas: "+curp +"/"+ totp);
			const c = document.createElement('canvas');
			c.id = "P" + page.index;
			c.style = "position: fixed; transition: ease 3s; left: 20vw; top: 30vh; opacity:1; height:30vh; user-select: none; pointer-events: none; border: 2px solid green;";
			c.ontransitionend = function() {
				document.body.removeChild(c);
				c.ontransitionend = null;
			}
			setTimeout(function() {c.style.opacity = 0; c.style.left = "-20vw";}, 1000);
			c.width = page.width;
			c.height = page.height;
			document.body.appendChild(c);
			backup.call(this, c, page, image, {x:0, y:0, width:page.width, height:page.height}, flag);
			img$size[curp] = Math.round((c.toDataURL('image/jpeg')).length *3 /4);
			console.log("size:", Math.round(img$size[curp]/10.24)/100, "KBytes");
			c.toBlob(async(v)=>{
				zip.file("P"+pad(curp, 5) + ".jpg", v)
				let page = document.createElementNS(null, 'Page');
				if(curp == 1) page.setAttribute('Type', 'FrontCover');
				page.setAttribute('ImageWidth', c.width);
				page.setAttribute('ImageHeight', c.height);
				page.setAttribute('ImageSize', v.size);
				page.setAttribute('Image', curp-1);
				pages.appendChild(page);
				if(curp >= totp && start) {
					Ci.appendChild(scan);
					Ci.appendChild(pages);
					let serializer = new XMLSerializer();
					let xmlStr = '<?xml version="1.0"?>\n' + serializer.serializeToString(xml);
					zip.file("ComicInfo.xml", xmlStr, {type: "text/xml"});
					console.groupCollapsed('ComicInfo.xml');
					console.log(Ci);
					console.groupEnd();
					pc.classList.add('zip');
					pc.setAttribute("min", 0);
					pc.setAttribute("max", 100);
					console.groupCollapsed('Zip progress');
					let pchk = 0;
					let bchk = setInterval(function() {
						console.debug(pchk+'%');
						pc.setAttribute("data-label", "Generating zip...("+ pchk +"%)");
						window.document.title = "["+Math.ceil(pchk)+"%] "+on;
						//favicon.badge(Math.ceil(pchk), {'bgColor':'#6a7'});
					}, 1000);
					zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
						pchk = metadata.percent.toFixed(2);
						pc.setAttribute('value', pchk);
					}).then(function (blob) {
						clearInterval(bchk);
						console.groupEnd();
						start = 0;
						const Url = window.URL.createObjectURL(blob);
						console.group("Zip URL(Debug Uses)")
						console.debug(Url);
						console.groupEnd();
						const e = new MouseEvent("click");
						const a = document.createElement('a');
						a.innerHTML = 'Download';
						a.download = fn +".zip";
						a.href = Url;
						a.dispatchEvent(e);
						btn.appendChild(a);
						window.document.title = "\u2705" + on;
						_job_time = new Date() - _job_time;
						console.log("Book Download Time:", _job_time/1000, "sec");
						setTimeout(function() {
							pc.classList.remove('start');
							pc.classList.remove('zip');
							ss.pause();
						}, 5000);
					});
				} else {
					_$timer = 0;
				}
				if(start) {
					window.document.title = "["+curp+"/"+totp+"] "+on;
					firekey(document.getElementById('renderer'), 34);
				} else {
					if(!wait && img$size[curp] > 20000) { //Detail collect will only do once and Cover should be larger than 20KB
						wait = 1;
						on = document.title;
						const tt = document.createElementNS(null, 'Title');
						const st = document.createElementNS(null, 'Series');
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
						let nt = document.createElementNS(null, 'Number');
						nt.innerHTML = pad(num,2);
						Ci.appendChild(nt);
						tt.innerHTML = fn;
						Ci.appendChild(tt);
						st.innerHTML = ser;
						Ci.appendChild(st);
						let pct = document.createElementNS(null, 'PageCount');
						pct.innerHTML = totp;
						Ci.appendChild(pct);
						bndlBTN.disabled = false;
						btn.classList.add('extend');
						pc.classList.add("start");
						ss.play();
						_init_time = new Date() - _init_time;
						console.log("Initialization time used:", _init_time/1000, "sec");
					}
				};
			}, 'image/jpeg', quality);
			console.log("Page generation time:", (new Date() - _page_time)/1000, "sec");
			_page_time = new Date();
			console.groupEnd();
		}
		if(!show_org) targetCanvas = document.createElement('canvas');
		return backup.apply(this, [targetCanvas, page, image, drawRect, flag]);
	}
}
const _$IfuBW_NFBR$_ = setInterval(function() {
	if(unsafeWindow.NFBR.a6G && unsafeWindow.NFBR.a6G.a5x.prototype.b9b) {
		clearInterval(_$IfuBW_NFBR$_);
		_page_time = _job_time = new Date();
		main();
	}
}, 100);
