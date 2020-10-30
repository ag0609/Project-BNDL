//Reference Discramer
console.log("Booklive Japan ver20201028");

let content_root = document.getElementById("content");
let content_obv = new MutationObserver(contentChangeCallback);
let page_blob = [];
content_obv.observe(content_root, {'childList':true});

const getDetail = async function(bn, st=5, on="", ta=0) {
	console.debug("getDetail()", bn, st, on);
	let cty = parseInt(getQuery("cty")) || 1;
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
					let html = parser.parseFromString(h, "text/html");
					//bd.author = [].slice.call(html.getElementsByClassName('author-name')).map(e => e.innerHTML).join('×');
					let authors = html.querySelectorAll("dl.author");
					bd.author = [];
					let wt, pcl;
					for(let i=0;i<authors.length;i++) {
						try {
							const at = authors[i].getElementsByClassName('author-head')[0].innerText;
							const an = authors[i].getElementsByClassName('author-name')[0].innerText.replace(/(（.*?）|\s)/g, "");
							if(/キャラ/.test(at)) {
								//
							} else if(/^([原]?[著|作])$/g.test(at)) {
								if(wt == undefined) wt = document.createElementNS(null, 'Writer');
								wt.innerHTML = wt.innerHTML ? wt.innerHTML +", "+ an : an;
								if(bd.author.filter(x => x.p == 0).length < 2) bd.author.push({'p':0, 'type':at, 'name':an});
							} else if(/(著|画|マンガ|イラスト)/g.test(at)) {
								if(pcl == undefined) pcl = document.createElementNS(null, 'Penciller');
								pcl.innerHTML = pcl.innerHTML ? pcl.innerHTML +", "+ an : an;
								bd.author.push({'p':1, 'type':at, 'name':an});
							} else if(at != "") {
								if(wt == undefined) wt = document.createElementNS(null, 'Writer');
								wt.innerHTML = wt.innerHTML ? wt.innerHTML +", "+ an : an;
								bd.author.push({'p':4, 'type':at, 'name':an});
							};
						} catch(e){};
					}
					if(wt) {
						Ci.appendChild(wt);
						if(pcl) Ci.appendChild(pcl);
					} else if(pcl) {
						wt = document.createElementNS(null, 'Writer');
						wt.innerHTML = pcl.innerHTML;
						Ci.appendChild(wt);
					}
					bd.author.sort(function(a,b) { if(a.name < b.name) { return -1 } else if(a.name > b.name) { return 1 } return 0; }); //sort by name
					bd.author.sort(function(a,b) { return a.p - b.p; }); //sort by priority
					console.debug(bd.author);
					let author_filtered = bd.author.filter(e=>e.p<2);
					if(author_filtered.length) {
					        fn = '[' + author_filtered.splice(0,Math.min(author_filtered.length,3)).map(e=>e.name).join('×') + '] ' + fn;
					} else {
					        fn = '[' + bd.author.splice(0,Math.min(bd.author.length,3)).map(e=>e.name).join('×') + '] ' + fn;
					}
					console.log(fn);
					document.title = fn;
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
XMLHttpRequest.prototype.osend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function() {
	let thisobj = this;
	let args = arguments;
	let orsc = this.onreadystatechange;
	//console.log("XHR.send", this.__sentry_xhr__.url, arguments);
	if(/bibGetCntntInfo/ig.test(this.__sentry_xhr__.url)) {
		//
		this.onreadystatechange = async function() {
			//console.log("orsc", arguments);
			if(arguments[0].target.readyState == 4 && arguments[0].target.status == 200) {
				let infoJSON = JSON.parse(arguments[0].target.responseText);
				if(infoJSON.items[0]) {
					on = infoJSON.items[0].Title;
					const tt = document.createElementNS(null, 'Title');
					const st = document.createElementNS(null, 'Series');
					on = on.replace(/\s?【[^【】]*(無料|お試し|試し読み)[^【】]*】\s?/g, " ").replace(/^\s+|\s+$/gm,''); //[Only for Period] will left for  Search Engine
					await getDetail(on);
					on = on.replace(/\s?【[^【】]*(期間限定|特典)[^【】]*】\s?/g, " ").replace(/^\s+|\s+$/gm,'');; //Now I can remove them for series name
					const ser = on.replace(/^\s?(.*?)\s?(?:[：\:]{0,1}\s?([\d０-９]+)|[（\(]([\d０-９]+)[\)）]|[第]?([\d０-９]+)[巻話]?)$/, "$1");
					let num = infoJSON.items[0].ContentID.replace(/^(\d+)_(\d+)/, "$2") || halfwidthValue(on).replace(/.*?[第\:]?(\d+)[巻話\)]?$/, "$1");
					if(isNaN(parseInt(num))) { //Books may only have single volume, so no volume number
						fn = ser;
						num = 1;
					} else {
						fn = ser + " 第"+pad(num, 2)+"巻";
					}
						let nt = document.createElementNS(null, 'Number');
						nt.innerHTML = pad(num,2);
						Ci.appendChild(nt);
						tt.innerHTML = fn;
						Ci.appendChild(tt);
						st.innerHTML = ser;
						Ci.appendChild(st);
						let pct = document.createElementNS(null, 'PageCount');
						pct.innerHTML = totp;
						if(!mode) Ci.appendChild(pct);
						bndlBTN.disabled = false;
						btn.classList.add('extend');
						pc.classList.add("start");
						ss.play();
						_init_time = new Date() - _init_time;
						console.log("Initialization time used:", _init_time/1000, "sec");
				}
			}
			orsc.apply(this, arguments);
		}
	}
	XMLHttpRequest.prototype.osend.apply(this, arguments);
}
function wait(t) {
	return new Promise((resolve, reject) => {
		let wait = setInterval(() => {
			t.length && (clearInterval(wait) & resolve(t));
		}, 100);
	});
}
async function contentChangeCallback($_a, __$) {
	console.log("content changed");
	let totp = parseInt(document.getElementById("menu_slidercaption").innerHTML.split("/")[1]);
	pc.setAttribute("max", totp || 1);
	let content_div = Array.prototype.slice.call(content_root.getElementsByTagName("div")).filter(v => /content\-p\d+/.test(v.id));
	//console.log(content_div);
	for(let d=0; d<content_div.length; d++) {
		let page_no = content_div[d].id.replace(/^.*p(\d+)$/, "$1");
		if(page_blob[page_no] != undefined) {
			console.warn(page_no, "duplicated!", "skipping...");
			continue;
		}
		let img_list = await wait(content_div[d].getElementsByTagName("img"));
		let c = document.createElement("canvas");
		let ctx = c.getContext("2d");
		c.width = img_list[0].naturalWidth;
		c.height = img_list[0].naturalHeight*(img_list.length);
		//console.log(img_list);
		for(let i=0; i<img_list.length; i ++) {
			await wait(img_list[i].src)
			let img = img_list[i];
			ctx.drawImage(img, 0, img.naturalHeight*(i));
		}
		setTimeout(() => {
			c.toBlob((blob)=> {
				page_blob[page_no] = 1;
				zip.file(pad(page_no, 5)+".jpg", blob);
				let curp = zip.file(/.*\.jpg/).length;
				pc.setAttribute("value", curp);
				pc.setAttribute("data-label", curp+"/"+totp);
				if(startf) {
					if(curp >= totp) {
						to = setTimeout(function() {
							let pchk = 0;
							zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
							    pchk = metadata.percent.toFixed(2);
							    pc.setAttribute('value', pchk);
							}).then(function(blob) {
							    const Url = window.URL.createObjectURL(blob);
							    const e = new MouseEvent("click");
							    const a = document.createElement('a');
							    a.id = "bndl_dl";
							    a.innerHTML = 'Download';
							    a.download = fn;
							    a.href = Url;
							    a.dispatchEvent(e);
							    btn.appendChild(a);
							    //URL.revokeObjectURL(blob);
							    pc.classList.remove("start");
							    startf=0;
							});
						}, 1000);
					} else {
						firekey(document.body, 37);
					}
				} else {
					bndlBTN.disabled=false;
				}
			}, "image/jpeg", quality);
		}, 1000);
	}
	console.log(page_blob);
}
start = () => {
	startf=1;
	bndlBTN.disabled=true;
	btn.classList.add("start");
	btn.classList.add("extend");
	pc.classList.add("start");
	firekey(document.body, 37);
}
cancel = () => {
	if(startf) {
		btn.classList.remove("start");
		btn.classList.remove("extend");
		bndlBTN.disabled=false;
		startf=0;
	} else {
		pc.classList.remove("start");
		content_obv.disconnect();
		content_obv = null;
		document.body.removeChild(btn);
	}
}
