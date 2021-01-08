//Reference Discramer
console.log("Dlsite Play Japan ver20210108.1");

//User Configuration
let retry_max = 25; //Maximum retry when drawImage
let delay_max = 2500; //in miliseconds, please keep it over 2 seconds(2000) or blanks output may occurs
let pdf_minw = 1000, pdf_minh = 1500; //in pixel, minimum resolution of pdf rendering output
let cache_size = 10; //number of images will be cached before viewer load image, set 5 or above to avoiding CORS error ocuurs
//

const packtype = [];
packtype[0] = "Raw";
packtype[9] = "DLST (DRM)";
packtype[10] = "CPD (CypherGuard)";
packtype[17] = "DLSite Play Only";

const agecat = [];
agecat[1] = "All";
agecat[2] = "R15+";
agecat[3] = "R18+";

let cache = {};
let cl, tp, wn;
let cc, cn;
let zt, dt, pl, pr;
let to, bc;
let pm;

let URL = window.webkitURL || window.URL;
let autoplay, spread, next, prev;

let dIdelay = 2500 / retry_max;
if(pdfjsLib)
    pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

function loadcache(startidx=0, path=tp) {
    let cpobj, cp;
    let tree = zt.value(["tree"]);
    try {
        if(/\.pdf$/.test(path)) {
            cpobj = zt.value(zt.find(path.split("/").slice(0, -1).join("/"), "path", ["tree"])).children;
        } else {
            cpobj = zt.value(zt.find(path, "path", ["tree"])).children;
        }
        if(cache[path] == undefined) cache[path] = {"used":0};
        cp = cache[path];
    } catch(e) {
        console.debug("loadcache()", "path", path, "invaild, using current tree path.");
        if(tp && tp != "") {
            let namepath = zt.find(tp.replace(/^.*\/([^\/]+\.[^\/]+)$/, "$1"), "name", ["tree"]);
            namepath = namepath.length > 2 && namepath.length - namepath.lastIndexOf("children") == 2 ? -2 : -1;
            cpobj = /\.pdf/i.test(tp) ? ((/\//.test(tp) ? zt.value(zt.find(zt.value(namepath).path, "name", ["tree"])).children : tree)) : zt.value(zt.find(tp, "path", ["tree"])).children;
            if(cache[tp] == undefined) cache[tp] = {"used":0};
            cp = cache[tp];
        } else {
            cpobj = tree;
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
            if(!img_list[hn].path) {
                let namepath = zt.find(hn, "hashname", ["tree"]);
                namepath = namepath.length > 2 && namepath.length - namepath.lastIndexOf("children") == 2 ? -2 : -1;
                img_list[hn].path = namepath.path;
            }
            if(!(new RegExp(img_list[hn].path, "")).test(path)) { i++; continue; }
            if(img_list[hn].blob == null && !img_list[hn].caching && fcs - cp.used > 0) {
                i++;
                cp.used++;
                img_list[hn].caching = 1;
                console.debug("loadcache()", "start cache", hn, fcs, cp.used, img_list[hn].fn);
                GM.xmlHttpRequest({
                    method: "GET",
                    url: img_list[hn].url,
                    responseType: "blob",
                    onload: function(res) {
                        img_list[hn].blob = URL.createObjectURL(res.response);
                        img_list[hn].img.onload = function() {
                            img_list[hn].caching = 0;
                            console.debug("loadcache()", "file cached", hn);
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
            if(!img_list[hn].path) {
                let namepath = zt.value(zt.find(hn, "hashname", ["tree"]));
                namepath = namepath.length > 2 && namepath.length - namepath.lastIndexOf("children") == 2 ? -2 : -1;
                img_list[hn].path = namepath.path;
            }
            if(!(new RegExp(zt.value(zt.find(hn, "hashname", ["tree"])).name, "")).test(path)) continue;
            let pskipped = 0;
            let pdfhn = hn;
            let pdfroot = zt.value(["playfile", hn, "pdf", "page"]);
            let fpcs = Math.min(cache_size, pdfroot.length - startidx);
            for(let p =0; p < fpcs && pskipped+startidx<pdfroot.length;) {
                let idx = (startidx+pskipped) +Math.ceil(p%2 ? (p/2) : -(p/2));
                idx = idx < 0 ? (idx%pdfroot.length)+pdfroot.length : idx >= pdfroot.length ? (idx%pdfroot.length) : idx;
                let hn = pdfroot[idx].optimized.name;
                let hne = pdfroot[idx].optimized.name.replace(/^.*(\..*?)$/, "$1");
                if(/(?:jp[e]?g|png|gif)/.test(hne)) { //Image
                    if(img_list[hn].path ) {
                        img_list[hn].path = img_list[pdfhn].path + "/" + img_list[pdfhn].fn || pdfhn;
                    }
                    if(img_list[hn].blob == null && !img_list[hn].caching && fpcs - cp.used > 0) {
                        p++;
                        cp.used++;
                        img_list[hn].caching = 1;
                        console.debug("loadcache()", "start cache", hn, fpcs, cp.used, img_list[hn].fn[0]);
                        GM.xmlHttpRequest({
                            method: "GET",
                            url: img_list[hn].url,
                            responseType: "blob",
                            onload: function(res) {
                                img_list[hn].blob = URL.createObjectURL(res.response);
                                img_list[hn].img.onload = function() {
                                    img_list[hn].caching = 0;
                                    console.debug("loadcache()", "file cached", hn);
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
    let params, url = "";
    //console.log("XHR.send", this.__sentry_xhr__, arguments);
    if(/download_token/.test(this.__sentry_xhr__.url)) {
        console.debug("%cXHR send %s", "background-color:lime, color:darkgreen", "download_token found");
        this.onreadystatechange = async function() {
            if(arguments[0].target.readyState == 4 && arguments[0].target.status == 200) {
                dt = JSON.parse(arguments[0].target.responseText);
                console.debug(dt);
                const getDetail = () => {
                    pr = pl.works.find(x => x.workno == dt.workno);
                    console.debug(pr);
                    let tags = pr.tags;
                    console.log("%cPackage Type: %s - %s", (pr.dl_format?"background-color:LemonChiffon; color:DarkOrange":"background-color:PaleGreen; color:Green"), pr.file_type, packtype[pr.dl_format]);
                    let ptime = new Date(pr.regist_date);
                    Ci.add("/ComicInfo", "Year", ptime.getFullYear());
                    Ci.add("/ComicInfo", "Month", ptime.getMonth()+1);
                    Ci.add("/ComicInfo", "Day", ptime.getDate());
                    Ci.add("/ComicInfo", "Title", pr.work_name);
                    Ci.add("/ComicInfo", "Series", pr.work_name.replace(/^\s?(.*?)\s?(?:[：\:]{0,1}\s?([\d０-９]+)|[（\(]([\d０-９]+)[\)）]|[第]?([\d０-９]+)[巻話]?)$/, "$1"));
                    Ci.add("/ComicInfo", "Number", pad((halfwidthValue(pr.work_name).match(/[第\:]?\d+[巻話\)]?/g) || ["1"])[0].match(/\d+/g)[0] || 1, 2));
                    Ci.add("/ComicInfo", "Imprint", pr.maker_name);
                    Ci.add("/ComicInfo", "Writer", pr.author_name || (tags && tags.find(v=>v.class == "created_by") ? tags.find(v=>v.class == "created_by").name : null) || pr.maker_name);
                    Ci.add("/ComicInfo", "LanguageISO", "ja");
                    Ci.add("/ComicInfo", "Manga", pr.work_type == "MNG" ? "YesAndRightToLeft" : "No");
                    if(pr.age_category && agecat[pr.age_category] != undefined) Ci.add("/ComicInfo", "AgeRating", agecat[pr.age_category]);
                    Ci.add("/ComicInfo", "Web", "https://dlsite.com/books/"+pr.workno);
                    fn = "[" + (pr.author_name || (tags != null && tags.find(v=>v.class == "created_by") ? pr.maker_name + " (" + tags.find(v=>v.class == "created_by").name + ")" : null) || pr.maker_name) + "] " + pr.work_name+" ("+pr.workno+")";
                    fn = fn.replace(/\s?【[^【】]*(無料|お試し|試し読み)[^【】]*】\s?/g, " ").replace(/\s?【[^【】]*(期間限定|特典)[^【】]*】\s?/g, " ").replace(/^\s+|\s+$/gm, '');
                    console.log("%cFilename: %s", "background-color:azure", fn);
                }
                if(!pl) { //purchase list not granted
                    GM.xmlHttpRequest({
                        method: "GET",
                        url: "https://play.dlsite.com/api/dlsite/purchases?sync=true&limit=1000",
                        onload: function(res) {
                            pl = JSON.parse(res.responseText);
                            getDetail();
                        }
                    });
                } else {
                    getDetail();
                }
                orsc.apply(this, arguments);
            }
        }
    } else if(/ziptree/ig.test(this.__sentry_xhr__.url)) {
        console.debug("%cXHR send %s", "background-color:lime, color:darkgreen", "ziptree found");
        img_list = [];
        zip = new JSZip();
        this.onreadystatechange = async function() {
            //console.log("orsc", arguments);
            if(arguments[0].target.readyState == 4 && arguments[0].target.status == 200) {
                //zt = JSON.parse(arguments[0].target.responseText);
                zt = new JSONHandler(arguments[0].target.responseText);
                let tree = zt.value(["tree"]), playfile = zt.value(["playfile"]);
                if(!pl) fn = zt.value(["workno"]) + ".zip";
                let imgarr;
                console.debug("ziptree:", zt.value([]));
                for(let i in playfile) {
                    try {
                        let hn = i;
                        if(imgarr == undefined) {
                            //console.log(searchinJSON(zt.tree, "hashname", hn));
                        }
                        if(/\.pdf$/.test(hn)) {
                            console.debug("pdf file", hn, "detected");
                            img_list[hn] = {"fn":zt.value(zt.find(hn, "hashname", ["tree"])), path:null};
                            let pdfroot = playfile[hn].pdf.page;
                            for(let p =0; p < pdfroot.length; p++) {
                                let phn = pdfroot[p].optimized.name;
                                let phne = pdfroot[p].optimized.name.replace(/^.*(\..*?)$/, "$1");
                                if(img_list[phn]) {
                                    img_list[phn].fn.push(pad(p+1,5)+phne);
                                } else {
                                    img_list[phn] = {
                                        "fn":[pad(p+1,5) + phne],
                                        "path":null,
                                        "pdf" :hn,
                                        "count":0,
                                        "maxcount":Math.ceil(pdfroot[p].optimized.width/128)*Math.ceil(pdfroot[p].optimized.height/128),
                                        "canvas":document.createElement('canvas'),
                                        "img":new Image(),
                                        "url":dt.url+"optimized/"+phn+"?token="+dt.params.token+"&expiration="+dt.params.expiration,
                                        "params":dt.params,
                                        "caching":0,
                                        "blob":null
                                    };
                                    $(img_list[hn].canvas).attr(width:playfile[hn].image.optimized.width, height:playfile[hn].image.optimized.height);
                                    $(img_list[hn].img).addClass("pswp__preload").attr("crossOrigin","anonymous");
                                }
                            }
                        } else if(/\.(?:jp[e]?g|png|bmp)$/.test(hn)) {
                            img_list[hn] = {
                                "fn":zt.value(zt.find(hn, "hashname", ["tree"]).slice(0, -1)).filter(a=>a.hashname==hn).map(v=>v.name),
                                "count":0,
                                "path":null,
                                "maxcount":Math.ceil(playfile[hn].image.optimized.width/128)*Math.ceil(playfile[hn].image.optimized.height/128),
                                "canvas":document.createElement('canvas'),
                                "img":new Image(),
                                "url":dt.url+"optimized/"+hn+"?token="+dt.params.token+"&expiration="+dt.params.expiration,
                                "params":dt.params,
                                "caching":0,
                                "blob":null
                            };
                            $(img_list[hn].canvas).attr(width:playfile[hn].image.optimized.width, height:playfile[hn].image.optimized.height);
                            $(img_list[hn].img).addClass("pswp__preload").attr("crossOrigin","anonymous");
                        }
                    } catch(e) { console.error("Parsing ztree.json failed.", e.message); };
                }
                console.debug("Pharsed List:", img_list);
                if(tp != null) {
                    await loadcache();
                } else {
                    console.debug("%ctp not ready", "background-color: yellow");
                }
            }
            orsc.apply(this, arguments);
        }
    }
    XMLHttpRequest.prototype.osend.apply(this, arguments);
}
CanvasRenderingContext2D.prototype.odI = CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.hdI = function() {
    let thisobj = this;
    let args = arguments;
    let tree = zt.value(["tree"]), playfile = zt.value(["playfile"]);
    let hn;
    if(args[0].src)
        hn = args[0].src.match(/[0-9a-z]+\.(?:jp[e]?g|png|gif)/)[0];
    if(hn && img_list[hn].blob != null) {
        let ctx = img_list[hn].canvas.getContext('2d');
        setTimeout(()=>{
            img_list[hn].count++;
            args[0] = img_list[hn].img;
            CanvasRenderingContext2D.prototype.odI.apply(ctx, args);
            if(debug_enable && show_org) {
                CanvasRenderingContext2D.prototype.odI.apply(thisobj, args);
            }
            if(img_list[hn].count >= img_list[hn].maxcount && img_list[hn].fn.length) {
                if(img_list[hn].count == img_list[hn].maxcount) {
                    let path = img_list[hn].path || tp || "tree";
                    cache[path].used--;
                    loadcache(0, path);
                }
                clearTimeout(img_list[hn].wait);
                img_list[hn].wait = setTimeout(() => {
                    if(startf) next();
                    img_list[hn].canvas.toBlob(async(blob) => {
                        for(let f=0; f<img_list[hn].fn.length; f++) {
                            zip.folder(img_list[hn].path).file(img_list[hn].fn[f], blob);
                            console.log("zipped file:", img_list[hn].fn[f]);
                        }
                        let pm = /\.pdf$/.test(window.location.hash) ? playfile[img_list[hn].pdf].pdf.page : (tp ? zt.value(zt.find(img_list[hn].path, "path", ["tree"])).children : tree);
                        let zm = zip.folder(img_list[hn].path).file(/(.*)\.(.*)/);
                        let curp = zm.length;
                        let totp = pm.length;
                        if(!pages && totp > 1) {
                            pages = new comicInfoPages(totp);
                        }
                        //tag page info here
                        pages.setPageAttr(curp-1, "ImageWidth", img_list[hn].canvas.width);
                        pages.setPageAttr(curp-1, "ImageHeight", img_list[hn].canvas.height);
                        pages.setPageAttr(curp-1, "ImageSize", blob.size);
                        //
                        URL.revokeObjectURL(blob);
                        URL.revokeObjectURL(img_list[hn].blob);
                        $(pcv).attr("aria-valuemax", totp);
                        $(pcv).attr("aria-valuenow", curp);
                        console.log(curp+"/"+totp);
                        $(pcv).find('span').text(curp+"/"+totp);
                        if(curp >= totp) {
                            if(!to) {
                                if(pages) Ci.addPageCollection(pages);
                                $(pcv).addClass('bg-success');
                                $(pcv).attr("aria-valuemin", 0);
                                $(pcv).attr("aria-valuemax", 100);
                                zip.file("ComicInfo.xml", Ci.toString(), {type: "text/xml"});
                                console.groupCollapsed('Zip progress');
                                console.log("Progress will be hidden at debug level");
                                let pchk = 0;
                                let bchk = setInterval(function() {
                                    console.debug(pchk+'%');
                                    $(pcv).find('span').text("Generating zip...("+ pchk +"%)");
                                    //window.document.title = "["+Math.ceil(pchk)+"%] "+on;
                                    //favicon.badge(Math.ceil(pchk), {'bgColor':'#6a7'});
                                }, 1000);
                                console.groupEnd();
                                to = setTimeout(function() {
                                    console.time("Zip Generate");
                                    zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
                                        pchk = metadata.percent.toFixed(2);
                                        $(pcv).attr('aria-valuenow', pchk.toFixed(2));
                                    }).then(function(blob) {
                                        clearInterval(bchk);
                                        console.timeEnd("Zip Generate");
                                        console.groupEnd();
                                        const Url = window.URL.createObjectURL(blob);
                                        const e = new MouseEvent("click");
                                        const a = document.createElement('a');
                                        $(a).attr({id:"bndl_dl",
                                                    download:fn,
                                                    href:Url
                                                 }).text('Download'); 
                                        a.dispatchEvent(e);
                                        toast($(a), "success", 0, "Job Done");
                                        //URL.revokeObjectURL(blob);
                                        $(pc).css({height:'0px'});
                                        $(pcv).removeClass('bg-success');
                                        $(pcv).find('span').text('');
                                        console.timeEnd('Job Time');
                                        startf=0;
                                        $(bndlBTN).attr({disabled:false});
                                    }).catch(e => {
                                        console.error("JSZip generate zip failed");
                                        console.error(e.message);
                                        console.groupEnd();
                                    });
                                }, 2000);
                            }
                        }
                    }, "image/jpeg", quality);
                }, 500);
            }
        }, 500); //too small may got result drawImage cannot finish its job before launch
    } else {
        setTimeout(function() {
            CanvasRenderingContext2D.prototype.drawImage.apply(this, args);
        }, 100);
    }
}
CanvasRenderingContext2D.prototype.drawImage = CanvasRenderingContext2D.prototype.hdI;
function getCurrentCanvas() {
    let tf = cc.style.transform.replace(/\-/g, "");
    return document.evaluate("//div[@class='pswp__item'][contains(@style, '"+tf+"')]//canvas", cc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
function clearBlob() {
    for(let k in img_list) {
        if(img_list[k].blob != undefined) {
            URL.revokeObjectURL(img_list[k].blob);
        }
    }
}
function zip2pdf2img(url=null) {
    if(!url) {
        //download zip
        console.debug("start downloading", "https://play.dlsite.com/api/download?workno=" + pr.workno);
        console.groupCollapsed("Download Progress");
        let org_tit = document.title;
        GM.xmlHttpRequest({
            method: "GET",
            responseType: 'blob',
            url: "https://play.dlsite.com/api/download?workno=" + pr.workno,
            onprogress: function(p) {
                let per = (p.loaded / p.total)*100
                console.debug("%.2d%", per.toFixed(2));
                document.title = "["+per.toFixed(2)+"%] Downloading Zip...";
            },
            onload: function(res) {
                console.groupEnd();
                console.debug("Download Completed");
                CanvasRenderingContext2D.prototype.drawImage = CanvasRenderingContext2D.prototype.odI;
                document.title = "Pharsing Zip File...";
                JSZip.loadAsync(res.response).then((dlzip)=> {
                    return dlzip.file(/.*pdf$/)[0].async("base64");
                }).then((v) => {
                    res = null;
                    document.title = "Parsing PDF File...";
                    console.debug("passing data to PDF.js");
                    let p = pdfjsLib.getDocument({data:atob(v)});
                    p.promise.then(async(d)=>{
                        v = null;
                        let curp = 1;
                        let loop;
                        if(!pages && d.numPages > 0) {
                            pages = new comicInfoPages(d.numPages);
                        }
                        function pageRen(f) {
                            console.group(curp +"/"+ d.numPages);
                            document.title = "["+curp +"/"+ d.numPages+"] Converting...";
                            let scale = 1;
                            let vp = f.getViewport({'scale':scale,});
                            while(vp.width < pdf_minw || vp.height < pdf_minh) {
                                scale+=0.2;
                                vp = f.getViewport({'scale':scale,});
                            }
                            let canvas = document.createElement('canvas');
                            let ctx = canvas.getContext('2d');
                            canvas.width = vp.width;
                            canvas.height = vp.height;
                            //document.body.appendChild(canvas);
                            f.render({canvasContext: ctx, viewport: vp});
                            let retry =0;
                            loop ? null : loop = setInterval(() => {
                                canvas.toBlob(async(blob) => {
                                    console.log("Scaled: %dx(%dx%d)", scale, vp.width, vp.height);
                                    console.log("Size: %dx(%d)", blob.size, (vp.width*vp.height) / blob.size);
                                    if(retry < retry_max && (vp.width*vp.height) / blob.size > 150) {
                                        retry++;
                                        throw "file too small! Retrying";
                                    }
                                    clearInterval(loop);
                                    loop = 0;
                                    retry = 0;
                                    //tag page info here
                                    pages.setPageAttr(curp-1, "ImageWidth", vp.width);
                                    pages.setPageAttr(curp-1, "ImageHeight", vp.height);
                                    pages.setPageAttr(curp-1, "ImageSize", blob.size);
                                    //
                                    zip.file("P"+pad(curp, 5)+".jpg", blob);
                                    console.log("zipped", "P"+pad(curp, 5)+".jpg");
                                    URL.revokeObjectURL(blob);
                                    f.cleanup();
                                    canvas.remove();
                                    console.groupEnd()
                                    if(curp < d.numPages) {
                                        d.getPage(++curp).then(pageRen);
                                    } else {
                                        d.cleanup();
                                        p = null;
                                        console.log(p);
                                        if(pages) Ci.addPageCollection(pages);
                                        console.time("Zip Generate");
                                        CanvasRenderingContext2D.prototype.drawImage = CanvasRenderingContext2D.prototype.hdI;
                                        zip.file("ComicInfo.xml", Ci.toString(), {type: "text/xml"});
                                        console.groupCollapsed('Zip progress');
                                        console.log("Progress will be hidden at debug level");
                                        let pchk = 0;
                                        let bchk = setInterval(function() {
                                            console.debug(pchk+'%');
                                            $(pcv).find('span').text("Generating zip...("+ pchk +"%)");
                                            //window.document.title = "["+Math.ceil(pchk)+"%] "+on;
                                            //favicon.badge(Math.ceil(pchk), {'bgColor':'#6a7'});
                                        }, 1000);
                                        zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
                                            pchk = metadata.percent.toFixed(2);
                                            document.title = "["+ pchk +"%] Generating Zip...";
                                            pc.setAttribute('value', pchk);
                                        }).then((blob) => {
                                            clearInterval(bchk);
                                            console.debug('100%');
                                            console.timeEnd("Zip Generate");
                                            console.groupEnd();
                                            const Url = window.URL.createObjectURL(blob);
                                            const e = new MouseEvent("click");
                                            const a = document.createElement('a');
                                            $(a).attr({id:"bndl_dl",
                                                        download:fn,
                                                        href:Url
                                                      }).text('Download'); 
                                            a.dispatchEvent(e);
                                            document.title = org_tit;
                                            URL.revokeObjectURL(blob);
                                            $(pc).css({height:'0px'});
                                            $(pcv).removeClass('bg-success');
                                            $(pcv).find('span').text('');
                                            toast($(a), "success", 0, "Job Success");
                                            console.timeEnd('Job Time');
                                            startf=0;
                                            $(bndlBTN).attr({disabled:false});
                                        }).catch(e => {
                                            console.error("JSZip generate zip failed");
                                            console.error(e.message);
                                            console.groupEnd();
                                        });
                                    }
                                }, 'image/jpeg', quality);
                            }, dIdelay);
                        }
                        d.getPage(curp).then(pageRen);
                    });
                });
            }
        });
    } else {
        //use local file?
    }
}
debug.zip2img = zip2pdf2img;
start = function() {
    let cango=0;
    if(pr) {
        if(pr.dl_format == 0) {
            if(confirm("This product is not DRM protected. Using HTML5 Downloader only collect down-scaled quality images.\nAre you sure want to continue?")) {
                cango=1;
            }
        } else if(pr.dl_format == 17) {
            cango=1;
        }
    }
    if(cango) {
        startf=1;
        $(bndlBTN).attr({disabled:true});
        $(maindiv).addClass('w-100 h-100');
        $(pc).css({height:'16px'});
        ss.play();
        //if(autoplay.length) autoplay[0].click();
        console.time('Job Time');
        if(next) next();
    }
}
cancel = function() {
    if(startf) {
        $(bndlBTN).attr({disabled:false});
        $(maindiv).removeClass('w-100 h-100');
        startf=0;
        ss.pause();
        //if(autoplay.length) autoplay[0].click();
    } else {
        CanvasRenderingContext2D.prototype.drawImage = CanvasRenderingContext2D.prototype.odI;
        XMLHttpRequest.prototype.send = XMLHttpRequest.prototype.osend;
        $(maindiv).remove();
    }
}
var img_list = [];
let hideimg;
const hashcheck = setInterval(function() {
    if(cl != window.location.hash) {
        cl = window.location.hash;
        console.log("currentHash:", cl);
        let bjs = cl.split('/').filter(v => /^(BJ|RJ)/.test(v));
        if(wn && wn != bjs[0]) { console.groupEnd(); }
        if(wn != bjs[0]) { console.log("workno changed, resetting tree", "(", wn, "=>", bjs[0], ")"); wn = bjs[0]; Ci.innerHTML=""; zt=null; tp = null; clearBlob(); if(bjs[0]) console.group(wn); }
        if(/(tree|view)\/\S+/.test(cl)) {
            if(/view/.test(cl)) {
                butcheck();
                console.time("Ready Time");
                $(maindiv).removeClass('w-100 h-100').show();
                if($("#bndl_dl") != null) { let a = $("#bndl_dl"); URL.revokeObjectURL(a.href); btn.removeChild(a); }
                let tpa = cl.split("%2F");
                if(tpa.length > 1) {
                    if(/\.pdf$/.test(tpa[tpa.length-1])) {
                        tp = decodeURIComponent(tpa.splice(0,tpa.length).join("%2F").split(/view/)[1].substr(1));
                    } else {
                        tp = decodeURIComponent(tpa.splice(0,tpa.length-1).join("%2F").split(/view/)[1].substr(1));
                    }
                } else {
                    tp = "";
                }
            } else {
                if(startf) {
                    console.warn("%cExiting download page when downloading, job quit...", "color:red");
                    cancel();
                    clearBlob();
                }
                $(maindiv).hide();
                clearInterval(hideimg);
                if(debug_enable && !show_org) {
                    let last_img=0;
                    hideimg = setInterval(function() {
                        if($("div.thumbnail").length > last_img) {
                            last_img = $("div.thumbnail").length;
                            $("div.thumbnail").css({opacity:0});
                        } else {
                            clearInterval(hideimg);   
                        }
                    }, 1000);
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
            $(maindiv).hide();
            clearInterval(hideimg);
            if(debug_enable && !show_org) {
                let last_img=0;
                hideimg = setInterval(function() {
                    if($("div.thumbnail").length > last_img) {
                        last_img = $("div.thumbnail").length;
                        $("div.thumbnail").css({opacity:0});
                    } else {
                        clearInterval(hideimg);   
                    }
                }, 1000);
            }
        }
    }
}, 50);
const butcheck = () => {
    if(!bc) {
        console.debug("button check start");
        bc = setInterval(function() {
            if($(".view-controls").length) {
                console.debug("button check start");
                autoplay = $(".toggle-autoplay").detach()[0];
                spread = $(".toggle-spread-pages").detach()[0];
                let next_but = $(".pswp__button--arrow--left")[0];
                next = () => { next_but.click() };
                if(debug_enable) bndl_d.next = next;
                let prev_but = $(".pswp__button--arrow--right")[0];
                prev = () => { prev_but.click() }
                if(debug_enable) bndl_d.prev = prev;
                console.debug("controls catcha: %o", [autoplay, spread, next_but, prev_but]);
                if(spread.classList.contains("on")) { spread.click(); }
                clearInterval(bc);
                bndlBTN.disabled=false;
                console.timeEnd("Ready Time");
            }
        }, 100);
    }
}
console.timeEnd("Initialization Time");
