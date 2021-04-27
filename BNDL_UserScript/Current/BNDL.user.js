// ==UserScript==
// @name         BNDL
// @namespace    https://github.com/ag0609/Project-BNDL
// @version      0.70
// @description  try to take copy of yours books! Book-worm!
// @author       ag0609
// @include      https://*.bookwalker.jp/*/viewer.html?*
// @require      tampermonkey://vendor/jquery.js
// @require      https://raw.githubusercontent.com/Stuk/jszip/master/dist/jszip.js
// @require      https://raw.githubusercontent.com/Stuk/jszip-utils/master/dist/jszip-utils.min.js
// @require      https://mozilla.github.io/pdf.js/build/pdf.js
// @require      https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Current/Plugin/String.class.js
// @require      https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Current/Plugin/Array.class.js
// @require      https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Current/Plugin/comicinfo.class.js
// @require      https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Current/Plugin/jsonHandler.class.js
// @require      http://lab.ejci.net/favico.js/favico.min.js
// @resource     customCSS https://raw.githubusercontent.com/ag0609/Project-BNDL/master/css/BNDL.user.css
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    var img, ba, c, job;
    var [cx, cy, cw, ch] = [0, 0, 0, 0];
    var fn = "xxx";

    let [minW, minH, Sratio] = [800, 1400, 1];

    const zip = new JSZip();
    const cssTxt = GM_getResourceText("customCSS");
    GM_addStyle(cssTxt);
    const emptyAudioFile = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjcxLjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAEAAABVgANTU1NTU1Q0NDQ0NDUFBQUFBQXl5eXl5ea2tra2tra3l5eXl5eYaGhoaGhpSUlJSUlKGhoaGhoaGvr6+vr6+8vLy8vLzKysrKysrX19fX19fX5eXl5eXl8vLy8vLy////////AAAAAExhdmM1Ny44OQAAAAAAAAAAAAAAACQCgAAAAAAAAAVY82AhbwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAALACwAAP/AADwQKVE9YWDGPkQWpT66yk4+zIiYPoTUaT3tnU487uNhOvEmQDaCm1Yz1c6DPjbs6zdZVBk0pdGpMzxF/+MYxA8L0DU0AP+0ANkwmYaAMkOKDDjmYoMtwNMyDxMzDHE/MEsLow9AtDnBlQgDhTx+Eye0GgMHoCyDC8gUswJcMVMABBGj/+MYxBoK4DVpQP8iAtVmDk7LPgi8wvDzI4/MWAwK1T7rxOQwtsItMMQBazAowc4wZMC5MF4AeQAGDpruNuMEzyfjLBJhACU+/+MYxCkJ4DVcAP8MAO9J9THVg6oxRMGNMIqCCTAEwzwwBkINOPAs/iwjgBnMepYyId0PhWo+80PXMVsBFzD/AiwwfcKGMEJB/+MYxDwKKDVkAP8eAF8wMwIxMlpU/OaDPLpNKkEw4dRoBh6qP2FC8jCJQFcweQIPMHOBtTBoAVcwOoCNMYDI0u0Dd8ANTIsy/+MYxE4KUDVsAP8eAFBVpgVVPjdGeTEWQr0wdcDtMCeBgDBkgRgwFYB7Pv/zqx0yQQMCCgKNgonHKj6RRVkxM0GwML0AhDAN/+MYxF8KCDVwAP8MAIHZMDDA3DArAQo3K+TF5WOBDQw0lgcKQUJxhT5sxRcwQQI+EIPWMA7AVBoTABgTgzfBN+ajn3c0lZMe/+MYxHEJyDV0AP7MAA4eEwsqP/PDmzC/gNcwXUGaMBVBIwMEsmB6gaxhVuGkpoqMZMQjooTBwM0+S8FTMC0BcjBTgPwwOQDm/+MYxIQKKDV4AP8WADAzAKQwI4CGPhWOEwCFAiBAYQnQMT+uwXUeGzjBWQVkwTcENMBzA2zAGgFEJfSPkPSZzPXgqFy2h0xB/+MYxJYJCDV8AP7WAE0+7kK7MQrATDAvQRIwOADKMBuA9TAYQNM3AiOSPjGxowgHMKFGcBNMQU1FMy45OS41VVU/31eYM4sK/+MYxKwJaDV8AP7SAI4y1Yq0MmOIADGwBZwwlgIJMztCM0qU5TQPG/MSkn8yEROzCdAxECVMQU1FMy45OS41VTe7Ohk+Pqcx/+MYxMEJMDWAAP6MADVLDFUx+4J6Mq7NsjN2zXo8V5fjVJCXNOhwM0vTCDAxFpMYYQU+RlVMQU1FMy45OS41VVVVVVVVVVVV/+MYxNcJADWAAP7EAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxOsJwDWEAP7SAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxPMLoDV8AP+eAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxPQL0DVcAP+0AFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
    const ss = new Audio(emptyAudioFile);
    ss.loop = true;

    let Ci = new comicinfo(); //Build XML class for ComicInfo.xml(which mainly used by Comic Reader)
    let pages;

    var icon = [].slice.call(document.head.getElementsByTagName('link')).find( k => k.rel === 'icon' );
    if(icon == undefined) {
        icon = document.createElement('link');
        icon.rel = 'icon';
        icon.crossorigin = 'anonymous';
        icon.href = 'https://services.keeweb.info/favicon/bookwalker.jp';
        document.head.appendChild(icon);
    }
    let mode = 0;
    if(window.location.hostname.match(/viewer-trial/)) { //A trial version of a book, we will not fully downloading this, we do only for book detail collect.
        console.warn("Trial viewer mode is running, this book is not a full version!!");
        mode = 1;
    } else if(window.location.hostname.match(/ptrial/)) { //A Time-base limited book, timely we have daily 10 minutes novel reading scheme.
        console.warn("Ptrial viewer mode is running");
        mode = 2;
    }

    function pad(n, t) {
        t = t * 1 ? t * 1 : Math.max(t.length,3);
        return ('0'.repeat(99) + n).slice(t * -1);
    } //padding for tidy sortable filename
    function drawdp(c, x, y, w, h) {
        console.log("drawdp:", x, y, w, h);
        if(c.tagName != "CANVAS") return false;
        if(c.ctx == undefined) c.ctx = c.getContext("2d");
        let ctx = c.ctx;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.strokeStyle = "red";
        ctx.fillStyle = "rgba(255, 0, 0, .3)";
        ctx.strokeRect(x, y, w, h);
        ctx.fillRect(x/2, y/2, w/2, h/2);
    }
    function chopCanvas(canvas, x=0, y=0, w=canvas.width, h=canvas.height) {
        console.log("chop:",[x, y, w, h]);
        const context = canvas.getContext('2d');
        const croppedCanvas = document.createElement('canvas');
        const ctx = croppedCanvas.getContext('2d');
        croppedCanvas.width = w;
        croppedCanvas.height = h;
        const newData = context.getImageData(x,y,w,h);
        ctx.putImageData(newData,0,0);
        return croppedCanvas;
    } //Crop canvas
    function trimCanvas(canvas, color, fuzz, skip, border){
        console.groupCollapsed('trim');
        let updated;
        fuzz = fuzz ? fuzz : 13.33;
        color = typeof(color) == typeof([]) ? color : [255, 255, 255];
        skip = skip ? skip : 1;
        let [bx, by ,bw, bh] = typeof(border) == typeof([]) ? border : [-1,-1,-1,-1];

        console.log("border:", [bx, by, bw, bh]);
        let borderFlag = true;
        if(bw < 0) borderFlag = false;
        console.log("color:", color);
        console.log("fuzz:", fuzz);
        console.log("skip:", skip);
        const context = canvas.getContext('2d');
        const topLeft = {
            x: canvas.width,
            y: canvas.height,
            update(x,y){
                this.x = Math.min(this.x,x);
                this.y = Math.min(this.y,y);
            }
        };
        const bottomRight = {
            x: 0,
            y: 0,
            update(x,y){
                this.x = Math.max(Math.max(this.x,x), bx+bw);
                this.y = Math.max(Math.max(this.y,y), by+bh);
            }
        };
        const tar_color = (color[0]+color[1]+color[2])/3;
        const imageData = context.getImageData(0,0,canvas.width,canvas.height);
        for(let x = 0; x < canvas.width; x+=skip){
            for(let y = 0; y < canvas.height; y+=skip){
                const red = imageData.data[((y * (canvas.width * 4)) + (x * 4))];
                const green = imageData.data[((y * (canvas.width * 4)) + (x * 4)) + 1];
                const blue = imageData.data[((y * (canvas.width * 4)) + (x * 4)) + 2];
                const alpha = imageData.data[((y * (canvas.width * 4)) + (x * 4)) + 3];
                const cur_color = (red + green + blue)/3;
                if(alpha > 0 && Math.abs(cur_color - tar_color)/255 > fuzz/100) { //(current color - target color)/full color < fuzz grace
                    topLeft.update(x,y);
                    bottomRight.update(x,y);
                }
            }
        }
        console.log('Crood: (%i, %i), (%i, %i)', topLeft.x, topLeft.y, bottomRight.x, bottomRight.y)
        const width = bottomRight.x - topLeft.x;
        const height = bottomRight.y - topLeft.y;
        const croppedCanvas = document.createElement('canvas');
        const ctx = croppedCanvas.getContext('2d');
        [bx, by, bw, bh] = [topLeft.x,topLeft.y,width,height];
        if(borderFlag) {
            if(cw < 1) {
                [cx, cy, cw, ch] = [bx, by, bw, bh];
                updated=true;
            } else if(bx+bw < bottomRight.x) {
                cx = bottomRight.x - cw;
                bx = cx;
                updated=true;
            }
        }
        if(updated) console.warn("tLx: %i, tLy: %i, w: %i, h: %i", bx, by, bw, bh);
        const newData = context.getImageData(bx,by,bw,bh);
        croppedCanvas.width = width;
        croppedCanvas.height = height;
        ctx.putImageData(newData,0,0);
        console.groupEnd();
        return croppedCanvas;
    } //encode canvas
    function fireKey(el, key) {
        key = key != null ? key : 34;
        let eventObj;
        if(document.createEventObject) {
            eventObj = document.createEventObject();
            eventObj.keyCode = key;
            el.fireEvent("onkeydown", eventObj);
        } else if(document.createEvent) {
            eventObj = document.createEvent("Events");
            eventObj.initEvent("keydown", true, true);
            eventObj.which = key;
            el.dispatchEvent(eventObj);
        }
        console.log("KEY", key, "fired");
    } //simulate keyboard-key fire
    function dataURItoBlob(dataURI) {
        let byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);
        else byteString = unescape(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], {type:mimeString});
    } //canvas to blob
    function getQuery(v) {
        if(URLSearchParams) {
            return ((new URLSearchParams(window.location.search)).get(v) || null);
        } else {
            var results = new RegExp('[\?&]' + v + '=([^&#]*)').exec(window.location.search);
            if (results == null){
               return null;
            }
            else {
               return decodeURI(results[1]) || 0;
            }
        }
    }
    const halfwidthValue = (value) => {return value.replace(/(?:！？|!\?)/g, "⁉").replace(/[\uff01-\uff5e]/g, fullwidthChar => String.fromCharCode(fullwidthChar.charCodeAt(0) - 0xfee0)).replace(/\u3000/g, '\u0020')}
    let _detail$retry_ = 0;
    let bd = {};
    const getDetail = async function(bn, st=5, on="", ta=0, bid=null) {
        console.debug("getDetail()", bn, st, on);
        return new Promise(function(resolve) {
            let cty = parseInt(getQuery("cty"));
            let bwhp = "https://bookwalker.jp/";
            let eventapi = "https://eventapi.bookwalker.jp/api/";
            let autocom = "https://bookwalker.jp/louis-api/autocomplete/";
            let cat = cty ? 2 : 0; //category { 1 = Novel, 2 = Manga, 3 = Light Novel, 9 = Web Novel }
            if(mode==0 && unsafeWindow.NFBR.a6G.Initializer.F5W.menu.model.attributes) bid='de'+unsafeWindow.NFBR.a6G.Initializer.F5W.menu.model.attributes.contentId;
            if(mode==1 || !bid) {
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
                                    fn = '[' + author_filtered.splice(0,Math.min(author_filtered.length,3)).join('×') + '] ' + bn;
                                } else {
                                    fn = '[' + bd.author.splice(0,Math.min(bd.author.length,3)).map(e=>e.name).join('×') + '] ' + bn;
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
                                //toast(fn, "info", 0, "Title");
                                try {
                                    const toc = unsafeWindow.NFBR.a6G.Initializer.F5W.menu.model.attributes.a2u.book.content.normal_default.toc_;
                                    const tocidx = unsafeWindow.NFBR.a6G.Initializer.F5W.menu.model.attributes.a2u.book.content.normal_default.K2e;
                                    toc.forEach(function(v,i) {
                                        pages.setPageAttr(parseInt(tocidx[v.href]), "Bookmark", v.label);
                                    });
                                    console.log(pages);
                                } catch(e) {};
                                resolve(fn);
                            }
                        });
                    }
                });
            } else {
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
                        let autag = '';
                        if(author_filtered.length) {
                            autag = '[' + author_filtered.splice(0,Math.min(author_filtered.length,3)).join('×') + '] ';
                        } else {
                            autag = '[' + bd.author.splice(0,Math.min(bd.author.length,3)).map(e=>e.name).join('×') + '] ';
                        }
                        console.log('getDetaik(fn): '+ fn);
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
                        //toast(fn, "info", 0, "Title");
                        // TOC
                        try {
                            const toc = unsafeWindow.NFBR.a6G.Initializer.F5W.menu.model.attributes.a2u.book.content.normal_default.toc_;
                            const tocidx = unsafeWindow.NFBR.a6G.Initializer.F5W.menu.model.attributes.a2u.book.content.normal_default.K2e;
                            toc.forEach(function(v,i) {
                                pages.setPageAttr(parseInt(tocidx[v.href]), "Bookmark", v.label);
                            });
                            console.log(pages);
                        } catch(e) {};
                        resolve(autag);
                    }
                });
            }
        });
    } // Get Detail of Book
 function wait_for_canvas_loaded() {
    const canvas_containers = document.getElementsByClassName("currentScreen");
    if(!canvas_containers.length) return setTimeout(wait_for_canvas_loaded, 500);
        const canvas_list = canvas_containers[0].getElementsByTagName("canvas");
        if(!canvas_list.length) return setTimeout(wait_for_canvas_loaded, 500);
        c = canvas_list[0];
        create_btn();
    } //wait for canvas object appear
    function ProgressBarCallback($$e,_f_) {
        const p = document.getElementsByClassName('bndl-progress')[0];
        const v = p.getElementsByClassName('bndl-value')[0];
        v.style.width = ((p.getAttribute('value') - p.getAttribute('min')) * 100 / p.getAttribute('max')) + "%";
    } //Progress bar uses
    function create_btn() {
        const dragpad = document.createElement('canvas');
        dragpad.id = 'bndl-dp';
        document.body.appendChild(dragpad);
        const btn = document.createElement('div');
        btn.id = 'bndl';
        btn.ob = new MutationObserver(ProgressBarCallback);
        btn.addEventListener('dblclick', function() {
            btn.classList.toggle('close');
        });
        btn.classList.add('open');
        const gAobj = document.createElement('input');
        gAobj.id = 'gAobj';
        gAobj.type = 'checkbox';
        gAobj.classList.add('bndl-opts');
        gAobj.setAttribute('data-label', 'Use this page as resolution sampling');
        const pc = document.createElement('div');
        pc.id = 'bndl-progress';
        pc.classList.add("bndl-progress");
        pc.classList.add("w");
        const pcv = document.createElement('span');
        pcv.classList.add("bndl-value");
        const pct = document.createElement('svg');
        pc.setAttribute("min", 0);
        pc.setAttribute("max", 0);
        pc.setAttribute("value", 0);
        pc.appendChild(pcv);
        btn.ob.observe(pc, {attributes:true});
        const btn_obj = document.createElement('button');
        btn_obj.type = 'button';
        btn_obj.id = 'bndl4';
        btn_obj.className = 'bndl-btn';
        btn_obj.style.backgroundColor = 'white';
        btn_obj.innerText = 'BNDL';
        btn_obj.onclick = saveFile;
        btn.appendChild(document.createElement('tr'));
        btn.appendChild(gAobj);
        btn.appendChild(pc);
        btn.appendChild(btn_obj);
        document.body.appendChild(btn);
    } //Show "Save" Button on page
    function DLFile() {
        console.group("JSZip");
        const pc = document.getElementById('bndl-progress');
        pc.classList.add('zip');
        console.groupCollapsed("Insert");
        for(var i in ba) {
            let img = ba[i];
            console.log("<-- [%s] %i bytes", pad(i,5) +".jpg", img.size);
            zip.file(pad(i,5) +".jpg", img, {base64: true});
        }
        Ci.addPageCollection(pages);
        zip.file("ComicInfo.xml", Ci.toString(), {type: "text/xml"});
        console.log('xxx Clean up canvas caches xxx');
        ba = null;
        console.groupEnd();
        console.log('==> Generating %s.zip...', fn);
        pc.setAttribute("data-label", "Generating "+ fn +".zip...");
        pc.setAttribute("min", 0);
        pc.setAttribute("max", 200);
        let pchk = 0;
        let bchk = setInterval(function() {
            favicon.badge(Math.ceil(pchk), {'bgColor':'#6a7'});
        }, 1000);
        console.groupCollapsed('Zip progress');
        zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
            console.debug(metadata.percent.toFixed(2)+'%');
            const pc = document.getElementById('bndl-progress');
            pc.setAttribute("value", 100 + (metadata.percent.toFixed(2)*1));
            pchk = metadata.percent.toFixed(2);
        }).then(function (blob) {
            console.groupEnd();
            const Url = window.URL.createObjectURL(blob);
            console.group("Zip URL")
            console.log(Url);
            console.groupEnd();
            console.groupEnd();
            const e = new MouseEvent("click");
            const a = document.createElement('a');
            a.innerText = 'Download';
            a.download = fn +".zip";
            a.href = Url;
            //a.dispatchEvent(e);
            document.getElementById("bndl").appendChild(a);
            pc.setAttribute("data-label", "Completed. Pushing zip to download.");
            favicon.badge("&#x2B07;");
            setTimeout(function() {
                pc.classList.remove('start');
                pc.classList.remove('zip');
            }, 5000);
            ss.pause();
        });
    } //Zip Canvas and Download archive
    async function saveFile() {
        let obj = document.getElementById('bndl4');
        let pc = document.getElementById('bndl-progress');
        let phl = document.getElementById('bndl');
        let tn = unsafeWindow.NFBR.a6G.Initializer.F5W.menu.model.attributes.contentTitle;
        console.log("Title:", fn);
        if(job) {
            clearInterval(job);
            job = 0;
            obj.innerText = "BNDL";
            DLFile();
            return console.warn('Stopped by User');
        }
        pc.classList.add("start");
        phl.style.display = 'flex';
        phl.style.backgroundColor = 'grey';
        document.getElementById('bndl').classList.add('extend');
        phl.style.alignItems = 'center';
        obj.innerText = "WAIT";
        let [fp, tmpS] = [0, 0];
        let totp = (document.getElementById('pageSliderCounter').innerText).split('/')[1] * 1;
        pc.setAttribute("max", totp);
        if(!pages) {
            pages = new comicInfoPages(totp);
            let on = tn.replace(/\s?【[^【】]*(無料|お試し|試し読み)[^【】]*】\s?/g, " ").replace(/^\s+|\s+$/gm,''); //[Only for Period] will left for Bookwalker Stupid Retarded Search Engine
            await getDetail(on).then(v => {
                on = on.replace(/\s?【[^【】]*(限定|特典)[^【】]*】\s?/g, " ").replace(/^\s+|\s+$/gm,'');; //Now I can remove them for series name
                const ser = on.replace(/^\s?(.*?)\s?(?:[：\:]{0,1}\s?([\d０-９]+)|[（\(]([\d０-９]+)[\)）]|[第]?([\d０-９]+)[巻話]?)$/, function(...args) {
                    const [match, p, offset, string] = [args[0], args.slice(1, -2).filter(v=>v), args[args.length-2], args[args.length-1]];
                    return p[0];
                });
                let num = halfwidthValue(on).replace(/.*?[第\:]?(\d+)[巻話\)]?$/, "$1");
                if(isNaN(parseInt(num))) { //Books may only have single volume, so no volume number
                    fn = v + ser;
                    num = 1;
                } else {
                    fn = v + ser +" 第"+ pad(num, 2) +"巻";
                }
                Ci.add("/ComicInfo", "Number", pad(num,2));
                Ci.add("/ComicInfo", 'Title', on);
                Ci.add("/ComicInfo", 'Series', ser);
                Ci.add("/ComicInfo", 'PageCount', totp);
            });
        }
        ba = new Array();
        ss.play();
        let jumped = 0;
        job = setInterval(function() {
            let load = 0;
            const load_lst = document.getElementsByClassName("loading");
            if(load_lst.length) {
                for(let i in load_lst) {
                    if(typeof(load_lst[i]) != 'object') continue;
                    if(load_lst[i].style.visibility != 'hidden') load = 1;
                }
            }
            const curp = (document.getElementById('pageSliderCounter').innerText).split('/')[0] * 1;
            const dragpad = document.getElementById('bndl-dp');
            if(!load) {
                pc.setAttribute("data-label", "Capture Canvas: "+curp +"/"+ totp);
                pc.setAttribute("value", curp);
                favicon.badge(Math.ceil(100*curp/totp), {'bgColor':'#06c'})
                console.group("Progress: %i/%i", curp, totp);
                console.groupCollapsed("Zooming...");
                c = document.getElementsByClassName("currentScreen")[0].getElementsByTagName("canvas")[0];
                while(document.getElementById('zoomRatio').innerText != '300%') {
                    console.log("Zoomrate: %s", document.getElementById('zoomRatio').innerText);
                    document.getElementById("zoomInBtn").click();
                }
                console.groupEnd();
                obj.innerText = "Stop";
                let skip=48;
                let fuzz=10;

                let img;
                if(!ba.length) {
                    skip=4;
                    let ld = latest_dummy;
                    img = chopCanvas(c, ld[5], ld[6], ld[7], ld[8]);
                } else {
                    img = chopCanvas(c, cx, cy, cw, ch);
                }
                const picDe = unsafeWindow.NFBR.a6G.Initializer.F5W.menu.model.attributes.a2u.u5K[curp-1].left;
                if(img.width != picDe.width || img.height != picDe.height) {
                    const ratio = Math.max(Math.max(picDe.width,minW)/img.width,Math.max(picDe.height,minH)/img.height);
                    console.log("ratio: ", img, picDe, ratio);
                    let newimg = document.createElement("canvas");
                    newimg.width = picDe.width;
                    newimg.height = picDe.height;
                    let ctx = newimg.getContext('2d');
                    drawBKUP.call(ctx, img, 0, 0, img.width, img.height, 0, 0, picDe.width, picDe.height);
                    img = newimg;
                }
                ba[curp] = dataURItoBlob(img.toDataURL('image/jpeg'));
                let trimBlack = 0;
                try {
                    //trimBlack = (dataURItoBlob(trimCanvas(img, [0,0,0], 10, 48).toDataURL('image/jpeg'))).size;
                    trimBlack = (dataURItoBlob(img.toDataURL('image/jpeg'))).size;
                } catch(e){console.error("ERROR")};
                console.debug("[%i] size: %i bytes", curp, ba[curp].size);
                console.debug("[B%i] size: %i bytes", curp, trimBlack);
                if(ba[curp].size < 20000 && trimBlack < 20000 && tmpS < 10) {
                    console.warn("[%i] too small(< 20000 bytes), retrying %i times for capture canvas", curp, tmpS+1);
                    tmpS++;
                    if(curp == 0) [cx, cy, cw, ch] = [-1, -1, -1, -1];
                } else if(trimBlack < 20000 && tmpS < 10) {
                    console.warn("[B%i] too small(< 20000 bytes), retrying %i times for capture canvas", curp, tmpS+1);
                    tmpS++;
                } else {
                    if(tmpS >= 10) {
                        console.error("Error occured by too many retries when triming canvas\n Seems first page we want to trim almost whitespace...\n original canvas will be stored, proceeding to next page...");
                    }
                    tmpS = 0;
                    fireKey(document.getElementById('renderer'), 34);
                }
                console.groupEnd();
            } else console.log("Still loading...");
            if(!jumped && document.getElementById('gAobj').checked && curp > 0) {
                console.log('Sampling Completed, Jump back to page 1');
                jumped = 1;
                fireKey(document.getElementById('renderer'), 36);
            } else if(curp == totp && tmpS == 0) {
                clearInterval(job);
                //dragpad.ctx.clearRect(0, 0, c.width, c.height);
                console.log("Captrue Completed");
                job = 0;
                DLFile();
                obj.innerText = "BNDL";
                return true;
            }
        },500);
    } //Store canvas to memory
    let latest_dummy;
    let favicon = new Favico({
        animation:'none'
    });
    window.onLoad = setTimeout(wait_for_canvas_loaded, 50);
    let drawBKUP = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function() {
        let args = arguments;
        if(args[0].tagName == "CANVAS") {
            latest_dummy = args;
            //console.debug(args);
            [cx, cy, cw, ch] = [args[1], args[2], args[3], args[4]];
            drawBKUP.call(this, args[0], args[1], args[2], args[3], args[4], 0, 0, args[3], args[4]);
        } else {
            drawBKUP.apply(this, args);
        }
    }
})();
