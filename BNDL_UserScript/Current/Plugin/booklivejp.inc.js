//Reference Discramer
console.log("Booklive Japan ver20201028");

let content_root = document.getElementById("content");
let content_obv = new MutationObserver(contentChangeCallback);
let page_blob = [];
content_obv.observe(content_root, {'childList':true});

function wait(t) {
	return new Promise((resolve, reject) => {
		let wait = setInterval(() => {
			t.length && (clearInterval(wait) & resolve(t));
		}, 100);
	});
}
async function contentChangeCallback($_a, __$) {
	console.log("content changed");
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
				if(startf) firekey(document.body, 37);
			}, "image/jpeg", quality);
		}, 1000);
	}
	console.log(page_blob);
}