//Reference Discramer
console.log("Dlsite Play Japan ver20201008");

let cache_size = 10, cache = {};
let cl, tp, wn;
let cc, cn;
let zt;
let to;
let pm;

let URL = window.webkitURL || window.URL;
let autoplay, spread;

function loadcache(startidx=0, path=tp) {
    let cpobj, cp;
    try {
        cpobj = searchinJSON(zt.tree, path, "path")[0].children;
        if(cache[path] == undefined) cache[path] = {"used":0};
        cp = cache[path];
    } catch(e) {
        console.warn("loadcache()", "path", path, "invaild, using current tree path.");
        if(tp && tp != "") {
            cpobj = /\.pdf/i.test(tp) ? (/\//.test(tp) ? searchinJSON(zt.tree, searchPath(zt.tree, tp.replace(/^.*\/([^\/]+\.[^\/]+)$/, "$1"), "name"), "name")[0].children : zt.tree) : searchinJSON(zt.tree, tp, "path")[0].children;
            if(cache[tp] == undefined) cache[tp] = {"used":0};
            cp = cache[tp];
        } else {
            cpobj = zt.tree;
            if(cache["tree"] == undefined) cache["tree"] = {"used":0};
            cp = cache["tree"];
        }
    }
    let fcs = Math.min(cache_size, cpobj.length - startidx);
    let skipped=0;
    for(let i=0; (i<fcs && skipped+startidx<cpobj.length);) {
        let idx = (startidx+skipped) + Math.ceil(i%2 ? (i/2) : -(i/2));
        //console.log("treeidx:", idx);
        idx = idx < 0 ? (idx%cpobj.length)+cpobj.length : idx >= cpobj.length ? (idx%cpobj.length) : idx;
        if(cpobj[idx].type != "file") {
            i++;
            continue;
        }
        let hn = cpobj[idx].hashname;
        let hne = cpobj[idx].hashname.replace(/^.*(\..*?)$/, "$1");
        if(/(?:jp[e]?g|png|gif)/.test(hne)) { //Image
            if(img_list[hn].blob == null && !img_list[hn].caching && fcs - cp.used > 0) {
                i++;
                cp.used++;
                img_list[hn].caching = 1;
                console.log("loadcache()", "start cache", hn, fcs, cp.used, img_list[hn].fn);
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
                    if(img_list[hn].blob == null && !img_list[hn].caching && fpcs - cp.used > 0) {
                        p++;
                        cp.used++;
                        img_list[hn].caching = 1;
                        console.log("loadcache()", "start cache", hn, fpcs, cp.used, img_list[hn].fn);
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
        console.debug("XHR.send", "ziptree found");
        img_list = [];
        zip = new JSZip();
        let tmpa = this.__sentry_xhr__.url.split('?');
        let query = tmpa[1];
        let bjs = tmpa[0].split('/').filter(v => /^(BJ|RJ)/.test(v));
        let type = "books";
        if(/RJ/.test(bjs[0])) {
            type = "doujin";
        }
        console.log("Content Type:", type);
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
                                    "path": searchPath(zt.tree, hn, "hashname") ? searchPath(zt.tree, hn, "hashname") + "/" + searchinJSON(zt.tree, hn, "hashname")[0].name : searchinJSON(zt.tree, hn, "hashname")[0].name,
                                    "count": 1,
                                    "maxcount":Math.ceil(pdfroot[p].optimized.width/128)*Math.ceil(pdfroot[p].optimized.height/128),
                                    "canvas":document.createElement('canvas'),
                                    "img":new Image(),
                                    "url":"https://play.dl.dlsite.com/content/work/"+type+"/"+bjs[0]+"/"+zt.workno+"/optimized/"+phn+"?"+query,
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
                                "fn": searchinJSON(zt.tree, hn, "hashname")[0].name,
                                "count":1,
                                "path": searchPath(zt.tree, hn, "hashname"),
                                "maxcount":Math.ceil(zt.playfile[hn].image.optimized.width/128)*Math.ceil(zt.playfile[hn].image.optimized.height/128),
                                "canvas":document.createElement('canvas'),
                                "img":new Image(),
                                "url":"https://play.dl.dlsite.com/content/work/"+type+"/"+bjs[0]+"/"+zt.workno+"/optimized/"+hn+"?"+query,
                                "caching":0,
                                "blob":null
                            };
                            img_list[hn].canvas.width = zt.playfile[hn].image.optimized.width;
                            img_list[hn].canvas.height = zt.playfile[hn].image.optimized.height;
                            img_list[hn].img.classList.add("pswp__preload");
                            img_list[hn].img.crossOrigin = "anonymous";
                        }
                    } catch(e) { console.warn(e.message); };
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
            if($("#bndl-debug").length && $("#bndl-debug")[0].getAttribute("showorg")) {
                CanvasRenderingContext2D.prototype.odI.apply(thisobj, args);
            }
            if(img_list[hn].count >= img_list[hn].maxcount && img_list[hn].count < 1000) {
                img_list[hn].count = 999;
                setTimeout(function() {
                    img_list[hn].canvas.toBlob(async(blob) => {
                        zip.folder(img_list[hn].path).file(img_list[hn].fn, blob);
                        URL.revokeObjectURL(blob);
                        let pm = searchinJSON(zt.tree, img_list[hn].path, "path")[0].children || zt.tree;
                        console.log(zip.folder(img_list[hn].path).file(/(.*)\.(.*)/).length, pm.length);
                        console.log("zipped file:", img_list[hn].fn);
                        cache[img_list[hn].path].used--;
                        loadcache(0, img_list[hn].path);
                        if(zip.folder(img_list[hn].path).file(/(.*)\.(.*)/).length >= pm.length) {
                            console.log(zip.folder(img_list[hn].path).file(/(.*)\.(.*)/).length, pm.length);
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
function searchPath(root, value, key="") {
    let res;
    if(key=="") {
        res = new RegExp(".+%22path%22%3A%22(.*?)%22.*?"+encodeURIComponent(":\""+value+"\""), "").exec(encodeURIComponent(JSON.stringify(root)));
    } else {
        res = new RegExp(".+%22path%22%3A%22(.*?)%22.*?"+encodeURIComponent("\""+key+"\":\""+value+"\""), "").exec(encodeURIComponent(JSON.stringify(root)));
    }
    return res ? decodeURIComponent(res[1]) : "";
}
function getCurrentCanvas() {
    let tf = cc.style.transform.replace(/\-/g, "");
    return document.evaluate("//div[@class='pswp__item'][contains(@style, '"+tf+"')]//canvas", cc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
function clearBlob() {
    for(let k in img_list) {
        if(img_list[k].blob != undefined) {
            URL.revokeObject(img_list[k].blob);
        }
    }
}
start = function() {
    startf=1;
    btn.classList.add('extend');
    btn.classList.add('start');
    if(autoplay.length) autoplay[0].click();
}
cancel = function() {
    if(startf) {
        bndlBTN.disabled=false;
        btn.classList.remove('extend');
        btn.classList.remove('start');
        startf=0;
        if(autoplay.length) autoplay[0].click();
    } else {
        CanvasRenderingContext2D.prototype.drawImage = CanvasRenderingContext2D.prototype.odI;
        XMLHttpRequest.prototype.send = XMLHttpRequest.prototype.osend;
        document.body.removeChild(btn);
    }
}
var img_list = [];
let hideimg;
const hashcheck = setInterval(function() {
    if(cl != window.location.hash) {
        cl = window.location.hash;
        console.log("currentHash:", cl);
        let bjs = cl.split('/').filter(v => /^(BJ|RJ)/.test(v));
        if(wn != bjs[0]) { console.log("workno changed, resetting tree", "(", wn, "=>", bjs[0], ")"); wn = bjs[0]; tp = ""; clearBlob(); }
        if(/(tree|view)\/\S+/.test(cl)) {
            if(/view/.test(cl)) {
                btn.style.display = "flex";
                let tpa = cl.split("%2F");
                if(tpa.length > 1) {
                    if(tpa[tpa.length-1] == "pdf") {
                        tp = decodeURIComponent(tpa.splice(0,tpa.length).join("%2F").split(/view/)[1].substr(1));
                    } else {
                        tp = decodeURIComponent(tpa.splice(0,tpa.length-1).join("%2F").split(/view/)[1].substr(1));
                    }
                } else {
                    tp = "";
                }
            } else {
                btn.style.display = "none";
                clearInterval(hideimg);
                if(!$("#bndl-debug").length && $("#bndl-debug")[0].getAttribute("showorg")) {
                    hideimg = setInterval(function() {
                        if($("div.thumbnail").length) {
                            for(let t=0; t<$("div.thumbnail").length; t++) {
                                //console.log($("div.thumbnail")[t]);
                                $("div.thumbnail")[t].style.opacity = 0;
                            }
                            clearInterval(hideimg);
                        }
                    }, 100);
                }
                tp = decodeURIComponent(cl.split(/tree/)[1].substr(1));
            }
            console.log("treePath:", tp);
            if(zt) {
                loadcache();
            } else {
                console.log("zt not ready");
            }
        } else {
            clearInterval(hideimg);
            if(!$("#bndl-debug").length && $("#bndl-debug")[0].getAttribute("showorg") == 0) {
                hideimg = setInterval(function() {
                    if($("div.thumbnail").length) {
                        for(let t=0; t<$("div.thumbnail").length; t++) {
                            //console.log($("div.thumbnail")[t]);
                            $("div.thumbnail")[t].style.opacity = 0;
                        }
                        clearInterval(hideimg);
                    }
                }, 100);
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
        bndlBTN.disabled=false;
    }
}, 100);
