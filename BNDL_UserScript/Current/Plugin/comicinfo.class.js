ver_comicinfo = "20201130.1";

//
console.log("comicinfo", ver_comicinfo, "loaded");

function comicinfo() {
	let _XP = new DOMParser();
	let _XS = new XMLSerializer();
	let _XML = _XP.parseFromString('<?xml version="1.0" ?><ComicInfo></ComicInfo>', "application/xml");
	let _CI = _XML.getElementsByTagName('ComicInfo')[0];
	_CI.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
	_CI.setAttribute('xmlns:xsd', 'http://www.w3.org/2001/XMLSchema');
	series = document.createElementNS(null, 'Series');
	title = document.createElementNS(null, 'Title');
	_CI.appendChild(series);
	_CI.appendChild(title);
	this.ComicInfo = _CI.cloneNode(1);
	this.add = function(xpath2Tag, keyname, value="", force=0) {
		let p2t = xpath2Tag, kn = keyname, v = value;
		let tag = _XML.evaluate(p2t, _XML, null, 9, null);
		if(tag && tag.singleNodeValue) {
			if(!tag.singleNodeValue.getElementsByTagName(keyname).length  || force) {
				let newtag = document.createElementNS(null, kn);
				newtag.innerHTML = v;
				tag.singleNodeValue.appendChild(newtag);
			} else {
				this.set(p2t+"/"+kn, v);
			}
			this.ComicInfo = _CI.cloneNode(1);
			return 0;
		} else {
			//toastr["warning"](p2t + " not found!");
			console.error(p2t, "not found!");
			return 1;
		}
	}
	this.addPageCollection = function(PageCollection) {
		let pages = PageCollection;
		if(!pages && !pages.pageCollection) {
			console.error("Input Invalid!!");
			return 1;
		} else {
			_CI.appendChild(pages.pageCollection);
			this.ComicInfo = _CI.cloneNode(1);
			return 0;
		}
	}
	this.remove = function(xpath2Tag) {
		let p2t = xpath2Tag, kn = keyname, v = value;
		let tag = _XML.evaluate(p2t, _XML, null, 9, null);
		if(tag && tag.singleNodeValue) {
			tag.singleNodeValue.appendChild(newtag);
			this.ComicInfo = _CI.cloneNode(1);
			return 0;
		} else {
			//toastr["warning"](p2t + " not found!");
			console.error(p2t, "not found!");
			return 1;
		}
	}
	this.set = function(xpath2Tag, value="") {
		let p2t = xpath2Tag, v = value;
		let tag = _XML.evaluate(p2t, _XML, null, 9, null);
		if(tag && tag.singleNodeValue) {
			tag.singleNodeValue.innerHTML = v;
			this.ComicInfo = _CI.cloneNode(1);
			return 0;
		} else {
			//toastr["warning"](p2t + " not found!");
			console.error(p2t, "not found!");
			return 1;
		}
	}
	this.get = function(xpath2Tag) {
		let p2t = xpath2Tag;
		let tag = _XML.evaluate(p2t, _XML, null, 9, null);
		if(tag && tag.singleNodeValue) {
			return tag.singleNodeValue.innerHTML;
		} else {
			//toastr["warning"](p2t + " not found!");
			console.error(p2t, "not found!");
			return null;
		}
	}
	this.toString = function() {
		return _XS.serializeToString(_XML);
	}
}

function comicInfoPages(total=0) {
	let _P = document.createElementNS(null, 'Pages');
	this.pageCollection = _P.cloneNode(true);
	this.pages = _P.children;
	this.addPages = function(count, options=null) {
		let page = document.createElementNS(null, 'Page');
		let lastpage = _P.childElementCount;
		for(let p=0; p < count; p++) {
			let newpage = page.cloneNode();
			newpage.setAttribute('Image', lastpage+p);
			if(options) {
				for(let k in options) {
					newpage.setAttribute(k, options[k]);
				}
			}
			_P.appendChild(newpage)
		}
		this.pageCollection = _P.cloneNode(true);
	}
	this.setPageAttr = function(i, k ,v) {
		if(_P.childElementCount < i) return error("Page not found!");
		_P.children[i].setAttribute(k, v);
		this.pageCollection = _P.cloneNode(true);
	}
	this.getPageAttr = function(i, k, v=null) {
		if(_P.childElementCount < i) return error("Page not found!");
		if(v) {
			return _P.children[i].getAttribute(k) == v;
		} else {
			return _P.children[i].getAttribute(k);
		}
	}
	this.getPage = function(i) {
		if(_P.childElementCount < i) return error("Page not found!");
		return _P.children[i];
	}
	this.error = function(msg) {
		console.error(msg);
	}
	this.addPages(1, {'Type':'FrontCover'});
	this.addPages(total-1);
}
