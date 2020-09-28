//Reference Discramer
console.log("Dlsite Play Japan");

let cache_size = 10, cache_used = 0;
let cl, tp;
let cc;
let zt;
let to;

let URL = window.webkitURL ? window.webkitURL : window.URL;
let autoplay, spread;

function loadcache(startidx=0, path=tp) {
	let cpobj;
	try {
		cpobj = searchinJSON(zt.tree, path, "path")[0].children;
	} catch(e) {
		console.warn("loadcache()", "path", path, "invaild, using current tree path.");
		if(tp && tp != "") {
			cpobj = searchinJSON(zt.tree, tp, "path")[0].children;
		} else {
			cpobj = zt.tree;
		}
	}
	let fcs = Math.min(cache_size, cpobj.length - startidx);
	let skipped=0;
	for(let i=0; (i<fcs && skipped+startidx<cpobj.length);) {
		let idx = (startidx+skipped) + Math.ceil(i%2 ? (i/2) : -(i/2));
		//console.log("treeidx:", idx);
		idx = idx < 0 ? (idx%cpobj.length)+cpobj.length : idx >= cpobj.length ? (idx%cpobj.length) : idx;
		let hn = cpobj[idx].hashname;
		let hne = cpobj[idx].hashname.replace(/^.*(\..*?)$/, "$1");
		if(/(?:jp[e]?g|png|gif)/.test(hne)) { //Image
			if(img_list[hn].blob == null && !img_list[hn].caching && fcs - cache_used > 0) {
				i++;
				cache_used++;
				img_list[hn].caching = 1;
				console.log("loadcache()", "start cache", hn, fcs, cache_used, img_list[hn].fn);
				GM.xmlHttpRequest({
					method: "GET",
					url: img_list[hn].url,
					responseType: "blob",
					onload: function(res) {
						img_list[hn].blob = URL.createObjectURL(res.response);
						img_list[hn].img.onload = function() {
							img_list[hn].caching = 0;
							console.log("loadcache()", "file cached", hn);
						}
						img_list[hn].img.src = img_list[hn].blob;
					}
				});
			} else {
				//console.log("loadcache()", "cache exsits - skipped", hn);
				skipped++;
			}
		} else if(/pdf/.test(hne)) { //pdf
			i++;
			let pskipped = 0;
			let pdfroot = zt.playfile[hn].pdf.page;
			let fpcs = Math.min(cache_size, pdfroot.length - startidx);
			for(let p =0; p < fpcs && pskipped+startidx<pdfroot.length;) {
				let idx = (startidx+pskipped) +Math.ceil(p%2 ? (p/2) : -(p/2));
				//console.log("pidx:", idx);
				idx = idx < 0 ? (idx%pdfroot.length)+pdfroot.length : idx >= pdfroot.length ? (idx%pdfroot.length) : idx;
				let hn = pdfroot[idx].optimized.name;
				let hne = pdfroot[idx].optimized.name.replace(/^.*(\..*?)$/, "$1");
				if(/(?:jp[e]?g|png|gif)/.test(hne)) { //Image
					if(img_list[hn].blob == null && !img_list[hn].caching && fpcs - cache_used > 0) {
						p++;
						cache_used++;
						img_list[hn].caching = 1;
						console.log("loadcache()", "start cache", hn, fpcs, cache_used, img_list[hn].fn);
						GM.xmlHttpRequest({
							method: "GET",
							url: img_list[hn].url,
							responseType: "blob",
							onload: function(res) {
								img_list[hn].blob = URL.createObjectURL(res.response);
								img_list[hn].img.onload = function() {
									img_list[hn].caching = 0;
									console.log("loadcache()", "file cached", hn);
								}
								img_list[hn].img.src = img_list[hn].blob;
							}
						});
					} else {
						pskipped++;
						//console.log("loadcache()", "cache exsits - skipped", hn);
					}
				} else {
					pskipped++;
					console.debug("loadcache()", "unsupported extension - skipped", hn);
				}
			}
		} else {
			skipped++;
			console.debug("loadcache()", "unsupported extension - skipped", hn);
		}
	}
}
XMLHttpRequest.prototype.osend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function() {
	let thisobj = this;
	let args = arguments;
	let orsc = this.onreadystatechange;
	//console.log("XHR.send", this.__sentry_xhr__.url, arguments);
	if(/ziptree/ig.test(this.__sentry_xhr__.url)) {
		img_list = [];
		zip = new JSZip();
		let tmpa = this.__sentry_xhr__.url.split('=');
		let ph = tmpa[tmpa.length-1];
		let pt = tmpa[tmpa.length-2].split('&')[0] *1;
		let bjs = tmpa[0].split('/').filter(v => /^(BJ|RJ)/.test(v));
		let type = "books";
		if(/RJ/.test(bjs[0])) {
			type = "doujin";
		}
		this.onreadystatechange = async function() {
			//console.log("orsc", arguments);
			if(arguments[0].target.readyState == 4 && arguments[0].target.status == 200) {
				zt = JSON.parse(arguments[0].target.responseText);
				let imgarr;
				console.log("ziptree", zt);
				for(let i in zt.playfile) {
					try {
						let hn = i;
						if(imgarr == undefined) {
							//console.log(searchinJSON(zt.tree, "hashname", hn));
						}
						if(/\.pdf$/.test(hn)) {
							console.log("pdf file", hn, "detected");
							let pdfroot = zt.playfile[hn].pdf.page;
							for(let p =0; p < pdfroot.length; p++) {
								let phn = pdfroot[p].optimized.name;
								let phne = pdfroot[p].optimized.name.replace(/^.*(\..*?)$/, "$1");
								img_list[phn] = {
									"fn": pad(p+1, 5) + phne,
									//"fn": (p+1) + phne,
									"path": tp,
									"count": 1,
									"maxcount":Math.ceil(pdfroot[p].optimized.width/128)*Math.ceil(pdfroot[p].optimized.height/128),
									"canvas":document.createElement('canvas'),
									"img":new Image(),
									"url":"https://play.dl.dlsite.com/content/work/"+type+"/"+bjs[0]+"/"+zt.workno+"/optimized/"+phn+"?px-time="+pt+"&px-hash="+ph,
									"caching":0,
									"blob":null
								};
								img_list[phn].canvas.width = pdfroot[p].optimized.width;
								img_list[phn].canvas.height = pdfroot[p].optimized.height;
								img_list[phn].img.classList.add("pswp__preload");
								img_list[phn].img.crossOrigin = "anonymous";
							}
						} else {
							img_list[hn] = {
								"fn":searchinJSON(zt.tree, hn, "hashname")[0].name,
								"count":1,
								"path": tp,
								"maxcount":Math.ceil(zt.playfile[hn].image.optimized.width/128)*Math.ceil(zt.playfile[hn].image.optimized.height/128),
								"canvas":document.createElement('canvas'),
								"img":new Image(),
								"url":"https://play.dl.dlsite.com/content/work/"+type+"/"+bjs[0]+"/"+zt.workno+"/optimized/"+hn+"?px-time="+pt+"&px-hash="+ph,
								"caching":0,
								"blob":null
							};
							img_list[hn].canvas.width = zt.playfile[hn].image.optimized.width;
							img_list[hn].canvas.height = zt.playfile[hn].image.optimized.height;
							img_list[hn].img.classList.add("pswp__preload");
							img_list[hn].img.crossOrigin = "anonymous";
						}
					} catch(e) {};
				}
				console.log(img_list);
				if(tp != null) {
					await loadcache();
				} else {
					console.log("tp not ready");
				}
			}
			orsc.apply(this, arguments);
		}
	}
	XMLHttpRequest.prototype.osend.apply(this, arguments);
}
CanvasRenderingContext2D.prototype.odI = CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage = function() {
	let thisobj = this;
	let args = arguments;
	let hn = args[0].src.match(/[0-9a-z]+\.(?:jp[e]?g|png|gif)/)[0];
	if(img_list[hn].blob != null) {
		let ctx = img_list[hn].canvas.getContext('2d');
		let wait = setInterval(()=>{
			clearInterval(wait);
			img_list[hn].count++;
			args[0] = img_list[hn].img;
			CanvasRenderingContext2D.prototype.odI.apply(ctx, args);
			if(document.getElementById('bndl-debug') && document.getElementById('bndl-debug').getAttribute("showorg") == "1") {
				CanvasRenderingContext2D.prototype.odI.apply(thisobj, args);
			}
			if(img_list[hn].count >= img_list[hn].maxcount) {
				img_list[hn].count = 0;
				setTimeout(function() {
					img_list[hn].canvas.toBlob(async(blob) => {
						zip.folder(img_list[hn].path).file(img_list[hn].fn, blob);
						URL.revokeObjectURL(blob);
						console.log(zip.folder(img_list[hn].path).file(/(.*)\.(.*)/).length, Object.keys(img_list).length);
						console.log("zipped file:", img_list[hn].fn);
						cache_used--;
						loadcache(0, img_list[hn].path);
						if(zip.folder(img_list[hn].path).file(/(.*)\.(.*)/).length >= Object.keys(img_list).length) {
							console.log(zip.folder(img_list[hn].path).file(/(.*)\.(.*)/).length, "/", zt.tree.length);
							if(!to) {
								to = setTimeout(function() {
									zip.generateAsync({type:"blob"})
										.then(function(blob) {
										const Url = window.URL.createObjectURL(blob);
										const e = new MouseEvent("click");
										const a = document.createElement('a');
										a.innerHTML = 'Download';
										a.download = zt.workno + ".zip";
										a.href = Url;
										a.dispatchEvent(e);
										URL.revokeObjectURL(blob);
									});
								}, 1000);
							}
						}
					}, quality);
				}, 1000);
			}
		}, 1000); //too small may got result drawImage cannot finish its job before launch
	} else {
		setTimeout(function() {
			CanvasRenderingContext2D.prototype.drawImage.apply(this, args);
		}, 100);
	}
}
function clearBlob() {
	for(let k in img_list) {
		if(img_list[k].blob != undefined) {
			URL.revokeObject(img_list[k].blob);
		}
	}
}
function searchinJSON(root, value, key="",res=[]) {
	if(key && encodeURIComponent(root[key]) == encodeURIComponent(value)) {
		res.push(root);
	} else if ((key && encodeURIComponent(JSON.stringify(root)).match(encodeURIComponent("\""+key+"\":\""+value+"\""))) ||
			   (key == "" && encodeURIComponent(JSON.stringify(root)).match(encodeURIComponent(":\""+value+"\"")))) {
		for(let k in root) {
			let newroot = root[k];
			let result = searchinJSON(newroot, value, key, res);
			if(result.length > 0 && result != undefined) {
				return result;
			}
		}
	}
	return res;
}
function getCurrentCanvas() {
	let tf = cc.style.transform.replace(/\-/g, "");
	return document.evaluate("//div[@class='pswp__item'][contains(@style, '"+tf+"')]//canvas", cc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
const start = function() {
	startf=1;
	if(autoplay.length) autoplay[0].click();
}
const cancel = function() {
	if(startf) {
		bndlBTN.disabled=false;
		startf=0;
		if(autoplay.length) autoplay[0].click();
	} else {
		CanvasRenderingContext2D.prototype.drawImage = CanvasRenderingContext2D.prototype.odI;
		XMLHttpRequest.prototype.send = XMLHttpRequest.prototype.osend;
		document.body.removeChild(btn);
	}
}
var img_list = [];
const hashcheck = setInterval(function() {
	if(cl != window.location.hash) {
		cl = window.location.hash;
		console.log("currentHash:", cl);
		if(/(tree|view)\/\S+/.test(cl)) {
			if(/view/.test(cl)) {
				let tpa = cl.split("%2F");
				if(tpa.length > 1) {
					tp = decodeURIComponent(tpa.splice(0,tpa.length-1).join("%2F").split(/view/)[1].substr(1));
				} else {
					tp = "";
				}
			} else {
				tp = decodeURIComponent(cl.split(/tree/)[1].substr(1));
			}
			console.log("treePath:", tp);
			if(zt) {
				loadcache();
			} else {
				console.log("zt not ready");
			}
		}
	}
}, 50);
	const butcheck = setInterval(function() {
	if($(".view-controls").length) {
		autoplay = $(".toggle-autoplay").detach();
		spread = $(".toggle-spread-pages").detach();
		console.log("controls catcha:", autoplay, spread);
		if(spread[0].classList.contains("on")) { spread.click(); }
		clearInterval(butcheck);
	}
}, 100);
