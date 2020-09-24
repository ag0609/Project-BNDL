//Reference Discramer
console.log("Dlsite Play Japan");

let cache_size = 10;
let cl, tp;
let cc;
let zt;
let to;

function loadcache() {
	let cpobj = searchinJSON(zt.tree, tp, "path")[0].children;
	let fcs = Math.min(cache_size, cpobj.length);
	for(let i=0; i<Math.min(cpobj.length, fcs); i++) {
		let idx = i - Math.floor(fcs / 2);
		if(idx < 0) {
			idx += cpobj.length;
		}
		let hn = cpobj[idx].hashname;
		let hne = cpobj[idx].hashname.replace(/^.*(\..*?)$/, "$1");
		if(/(?:jp[e]?g|png|gif)/.test(hne)) { //Image
			if(img_list[hn].blob == null) {
				GM.xmlHttpRequest({
					method: "GET",
					url: img_list[hn].url,
					responseType: "blob",
					onload: function(res) {
						img_list[hn].blob = URL.createObjectURL(res.response);
						img_list[hn].img.onload = function() {
							//URL.revokeObject(img_list[hn].blob);
							console.log("cached", hn);
						}
						img_list[hn].img.src = img_list[hn].blob;
					}
				});
			}
		} else if(/pdf/.test(hne)) { //pdf
			let pdfroot = zt.playfile[hn].pdf.page;
			let fpcs = Math.min(cache_size, pdfroot.length);
			for(let p =0; p < fpcs; p++) {
				let idx = p - Math.floor(fpcs /2);
				if(idx < 0) {
					idx += pdfroot.length;
				}
				let hn = pdfroot[idx].optimized.name;
				let hne = pdfroot[idx].optimized.name.replace(/^.*(\..*?)$/, "$1");
				if(img_list[hn].blob == null && /(?:jp[e]?g|png|gif)/.test(hne)) { //Image
					GM.xmlHttpRequest({
						method: "GET",
						url: img_list[hn].url,
						responseType: "blob",
						onload: function(res) {
							img_list[hn].blob = URL.createObjectURL(res.response);
							img_list[hn].img.onload = function() {
								//URL.revokeObject(img_list[hn].blob);
								console.log("cached", hn);
							}
							img_list[hn].img.src = img_list[hn].blob;
						}
					});
				}
			}
		} else {
			console.log("skipped", hn);
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
									//"fn": pad(p+1, 5) + phne,
									"fn": p + phne,
									"count": 1,
									"maxcount":Math.ceil(pdfroot[p].optimized.width/128)*Math.ceil(pdfroot[p].optimized.height/128),
									"canvas":document.createElement('canvas'),
									"img":new Image(),
									"url":"https://play.dl.dlsite.com/content/work/"+type+"/"+bjs[0]+"/"+zt.workno+"/optimized/"+phn+"?px-time="+pt+"&px-hash="+ph,
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
								"maxcount":Math.ceil(zt.playfile[hn].image.optimized.width/128)*Math.ceil(zt.playfile[hn].image.optimized.height/128),
								"canvas":document.createElement('canvas'),
								"img":new Image(),
								"url":"https://play.dl.dlsite.com/content/work/"+type+"/"+bjs[0]+"/"+zt.workno+"/optimized/"+hn+"?px-time="+pt+"&px-hash="+ph,
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
				if(tp) {
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
	if(img_list[hn].fn != null) {
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
						zip.file(img_list[hn].fn, blob);
						URL.revokeObjectURL(blob);
						console.log(zip.file(/(.*)\.(.*)/).length+1, Object.keys(img_list).length);
						console.log("zipped file:", img_list[hn].fn);
						if(zip.file(/(.*)\.(.*)/).length >= Object.keys(img_list).length) {
							console.log(zip.file(/(.*)\.(.*)/).length, "/", zt.tree.length);
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
}
const cancel = function() {
	if(startf) {
		bndlBTN.disabled=false;
		startf=0;
	} else {
		CanvasRenderingContext2D.prototype.drawImage = CanvasRenderingContext2D.prototype.odI;
		XMLHttpRequest.prototype.send = XMLHttpRequest.prototype.osend;
		document.body.removeChild(btn);
	}
}
let img_list = [];
const hashcheck = setInterval(function() {
	if(cl != window.location.hash) {
		cl = window.location.hash;
		console.log("currentHash:", cl);
		if(/(tree|view)\/\S+/.test(cl)) {
			if(/view/.test(cl)) {
				let tpa = cl.split("%2F");
				tp = decodeURIComponent(tpa.splice(0,tpa.length-1).join("%2F").split(/view/)[1].substr(1));
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
