// ==UserScript==
// @name         Jerk on Canvas
// @namespace    http://tampermonkey.net/
// @version      0.72
// @description  I am Canvas Jack, who like jerk out on canvas
// @author       Canvas Jack
// @include      https://*.bookwalker.jp/*/viewer.html?*
// @require      https://stuk.github.io/jszip/dist/jszip.js
// @resource     customCSS https://raw.githubusercontent.com/ag0609/Project-BNDL/master/css/BNDL.user.css
// @run-at       document-body
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

(async function() {

    'use strict';
    let debug_enable = 1;
    //
    let debug = 0;
    let show_org = 0;
    const doNewThings = function(i) {
        //Jerk something here
        return new Promise((resolve, reject) => {
            let c = document.createElement('canvas');
            c.ctx = c.getContext("bitmaprenderer");
            c.ctx.transferFromImageBitmap(i);
            c.toBlob((b)=>{console.log(window.URL.createObjectURL(b)); resolve(b)});
        });
    }
    let overflow_limit = 150;
    //Read External CSS
    const cssTxt = GM_getResourceText("customCSS");
    GM_addStyle(cssTxt);
    //Empty Audio Loop for retain tab active
    const emptyAudioFile = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjcxLjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAEAAABVgANTU1NTU1Q0NDQ0NDUFBQUFBQXl5eXl5ea2tra2tra3l5eXl5eYaGhoaGhpSUlJSUlKGhoaGhoaGvr6+vr6+8vLy8vLzKysrKysrX19fX19fX5eXl5eXl8vLy8vLy////////AAAAAExhdmM1Ny44OQAAAAAAAAAAAAAAACQCgAAAAAAAAAVY82AhbwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAALACwAAP/AADwQKVE9YWDGPkQWpT66yk4+zIiYPoTUaT3tnU487uNhOvEmQDaCm1Yz1c6DPjbs6zdZVBk0pdGpMzxF/+MYxA8L0DU0AP+0ANkwmYaAMkOKDDjmYoMtwNMyDxMzDHE/MEsLow9AtDnBlQgDhTx+Eye0GgMHoCyDC8gUswJcMVMABBGj/+MYxBoK4DVpQP8iAtVmDk7LPgi8wvDzI4/MWAwK1T7rxOQwtsItMMQBazAowc4wZMC5MF4AeQAGDpruNuMEzyfjLBJhACU+/+MYxCkJ4DVcAP8MAO9J9THVg6oxRMGNMIqCCTAEwzwwBkINOPAs/iwjgBnMepYyId0PhWo+80PXMVsBFzD/AiwwfcKGMEJB/+MYxDwKKDVkAP8eAF8wMwIxMlpU/OaDPLpNKkEw4dRoBh6qP2FC8jCJQFcweQIPMHOBtTBoAVcwOoCNMYDI0u0Dd8ANTIsy/+MYxE4KUDVsAP8eAFBVpgVVPjdGeTEWQr0wdcDtMCeBgDBkgRgwFYB7Pv/zqx0yQQMCCgKNgonHKj6RRVkxM0GwML0AhDAN/+MYxF8KCDVwAP8MAIHZMDDA3DArAQo3K+TF5WOBDQw0lgcKQUJxhT5sxRcwQQI+EIPWMA7AVBoTABgTgzfBN+ajn3c0lZMe/+MYxHEJyDV0AP7MAA4eEwsqP/PDmzC/gNcwXUGaMBVBIwMEsmB6gaxhVuGkpoqMZMQjooTBwM0+S8FTMC0BcjBTgPwwOQDm/+MYxIQKKDV4AP8WADAzAKQwI4CGPhWOEwCFAiBAYQnQMT+uwXUeGzjBWQVkwTcENMBzA2zAGgFEJfSPkPSZzPXgqFy2h0xB/+MYxJYJCDV8AP7WAE0+7kK7MQrATDAvQRIwOADKMBuA9TAYQNM3AiOSPjGxowgHMKFGcBNMQU1FMy45OS41VVU/31eYM4sK/+MYxKwJaDV8AP7SAI4y1Yq0MmOIADGwBZwwlgIJMztCM0qU5TQPG/MSkn8yEROzCdAxECVMQU1FMy45OS41VTe7Ohk+Pqcx/+MYxMEJMDWAAP6MADVLDFUx+4J6Mq7NsjN2zXo8V5fjVJCXNOhwM0vTCDAxFpMYYQU+RlVMQU1FMy45OS41VVVVVVVVVVVV/+MYxNcJADWAAP7EAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxOsJwDWEAP7SAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxPMLoDV8AP+eAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxPQL0DVcAP+0AFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
    const ss = new Audio(emptyAudioFile);
    ss.loop = true;
    //Read Last quality setting
    let quality = await GM.getValue('quality', 0.92);
    //Check if reading a trial version of a book
	let mode = 0;
	if(window.location.href.match(/viewer-trial/)) {
        console.warn("Trial viewer mode is running, this book is not a full version!!");
		mode = 1;
	}
    //Initialization
    const zip = new JSZip();
    let _init_time = new Date();
    let _job_time, _page_time;
    let _overflow_ = 0;
    let _$timer = 0;
    let start = 0;
    let _$canvas = [];
    let img$size = [];
    let _$c_wh = {w:0, h:0};
    let fn, on, retry, wait;
    let bd = {};
    let xml = document.implementation.createDocument(null, 'ComicInfo');
    let Ci = xml.getElementsByTagName('ComicInfo')[0];
    Ci.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
    Ci.setAttribute('xmlns:xsd', 'http://www.w3.org/2001/XMLSchema');
    let pages = document.createElementNS(null, 'Pages');
    let scan = document.createElementNS(null, 'ScanInformation');
    scan.innerHTML = "Scaned By BNDL JoC v0.7(ag0609)";
    const doOldThings = false;
    //
    const btn = document.createElement('div');
    btn.id = 'bndl';
    btn.ob = new MutationObserver(ProgressBarCallback);
    btn.addEventListener('dblclick', function() {
        //btn.style.display='none';
        btn.classList.toggle('close');
        btn.classList.toggle('extend', !btn.classList.contains('close'));
    });
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
    const bndlBTN = btn_obj.cloneNode();
    bndlBTN.id = 'bndl4';
    bndlBTN.className = 'bndl-btn';
    bndlBTN.style.backgroundColor = 'white';
    bndlBTN.innerHTML = 'BNDL';
    bndlBTN.onclick = ()=>{bndlBTN.disabled=true; start=1; _job_time = new Date(); firekey(document.getElementById('renderer'), 34);};
    bndlBTN.disabled = true;
    const quaBTN = btn_obj.cloneNode();
    quaBTN.className = 'bndl-btn';
    quaBTN.style.backgroundColor = 'white';
    quaBTN.innerHTML = 'Quality('+quality*100+')';
    quaBTN.onclick = async ()=>{let tmpq = prompt("Quality?(0-100)"); if(tmpq < 100 && tmpq > 0) {quality = tmpq/100; await GM.setValue('quality', quality);} quaBTN.innerHTML = 'Quality('+quality*100+')';};
    const canBTN = btn_obj.cloneNode();
    canBTN.className = 'bndl-btn';
    canBTN.style.backgroundColor = 'white';
    canBTN.innerHTML = "Stop";
    canBTN.onclick = ()=>{start=0;CanvasRenderingContext2D.prototype.drawImage=CanvasRenderingContext2D.prototype.odI;document.removeChild(btn)};
    btn.appendChild(document.createElement('tr'));
    btn.appendChild(pc);
    btn.appendChild(quaBTN);
    btn.appendChild(bndlBTN);
    btn.appendChild(canBTN);
    document.body.appendChild(btn);
    //
    if(debug_enable) {
        let bndl_d = document.createElement('bndl-debug');
        bndl_d.type = 'hidden';
        bndl_d.id ='bndl-debug';
        bndl_d.setAttribute('debug', 0);
        bndl_d.setAttribute('show_org', 0);
        bndl_d.attrchg = ($$e,_f_)=>{
               debug = bndl_d.getAttribute('debug');
               show_org = bndl_d.getAttribute('show_org');
        }
        bndl_d.clrcanv = (i)=> {
            console.group("clrcanv: Clean Canvas", i);
            img$size[i] = 0;
            console.groupEnd();
        }
        bndl_d.dlcanv = (i)=> {
            console.group("dlcanv: Download Canvas" , i);
            if(i > _$canvas.length) return (console.error("canvas not exists or not yet captured!") & console.groupEnd());
            zip.file("P" + pad(i,5) + ".jpg").async("blob").then(function(blob) {
                console.debug(blob);
                const Url = window.URL.createObjectURL(blob.slice(0, blob.size, "image/jpeg"));
                console.log(Url);
                const e = new MouseEvent("click");
                const a = document.createElement('a');
                a.innerHTML = 'Download';
                a.download = "P" + pad(i,5) +".jpg";
                a.href = Url;
                a.dispatchEvent(e);
                console.groupEnd();
            });
        }
        bndl_d.ob = new MutationObserver(bndl_d.attrchg);
        bndl_d.ob.observe(bndl_d, {attributes:true});
        document.body.appendChild(bndl_d);
    }
    //
    function ProgressBarCallback($$e,_f_) {
        const p = document.getElementsByClassName('bndl-progress')[0];
        const v = p.getElementsByClassName('bndl-value')[0];
        v.style.width = ((p.getAttribute('value') - p.getAttribute('min')) * 100 / p.getAttribute('max')) + "%";
    } //Progress bar uses
    function pad(n, t) {
        n = ''+n;
        t = Math.max(n.length, t);
        return ('0'.repeat(99) + n).slice(t * -1);
    } //padding for tidy sortable filename
    function firekey(el, key) {
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
    (function() {
        const getDetail = function(bn) {
            //type 1 = Series, 2 = Author, 3 = Label(Magazine), 4 = Company(Publisher), 5 = Book, 98 = auto-complete failed
            let bwhp = "https://bookwalker.jp/";
            let eventapi = "https://eventapi.bookwalker.jp/api/";
            let autocom = "https://bookwalker.jp/louis-api/autocomplete/";
            let cors = ["https://cors-anywhere.herokuapp.com/"]; //CORS proxy servers
            fetch(cors[Math.floor(Math.random()*cors.length)] + autocom + "?term=" + bn)
            .then(function(res) {
                return res.json();
            }).then(function(j) {
                let f;
                if(j.contents) {
                    f= j.contents.find(v => (v.type == 5 && !(/(期間限定|お試し|試し読み)/.test(v.value))));
                } else {
                    f = j.find(v => (v.type == 5 && !(/(期間限定|お試し|試し読み)/.test(v.value))));
                }
                let bid = "de" + f.typeId;
                let web = document.createElementNS(null, 'Web');
                web.innerHTML = bwhp + bid + '/';
                Ci.appendChild(web);
                return bid;
            }).then(function(bid) {
                fetch(cors[Math.floor(Math.random()*cors.length)] + bwhp + bid)
                .then(function(res) {
                    return res.text();
                }).then(function(h) {
                    let parser = new DOMParser();
                    let html = parser.parseFromString(h, "text/html")
                    //bd.author = [].slice.call(html.getElementsByClassName('author-name')).map(e => e.innerHTML).join('×');
                    let authors = html.getElementsByClassName('author');
                    bd.author = [];
                    let wf = 0;
                    for(let i=0;i<Math.min(authors.length,2);i++) {
                        const at = authors[i].childNodes[1].innerText;
                        const an = authors[i].childNodes[3].innerText.replace(/(（.*?）|\s)/g, "");
                        if(/(原作|著)/g.test(at) && authors.length > 1) {
                            wf=1;
                            let wt = document.createElementNS(null, 'Writer');
                            wt.innerHTML = an;
                            Ci.appendChild(wt);
                            bd.author.push({'type':at, 'name':an});
                        } else if(/(作画|漫画|イラスト)/g.test(at)) {
                            let pcl = document.createElementNS(null, 'Penciller');
                            pcl.innerHTML = an;
                            Ci.appendChild(pcl);
                            bd.author.push({'type':at, 'name':an});
                        } else if(/キャラ/.test(at)) {
                            //
                        } else {
                            let wt = document.createElementNS(null, 'Writer');
                            wt.innerHTML = an;
                            Ci.appendChild(wt);
                            bd.author.push({'type':at, 'name':an});
                        };
                    }
                    console.debug(bd.author);
                    fn = '[' + bd.author.map(e=>e.name).join('×') + '] ' + fn;
                });
            });
        } //Get detail of book
        const waitLoading = function() {
              return new Promise((resolve, reject) => {
                  const job = setInterval(function() {
                      let loadings = document.getElementsByClassName('loading');
                      let loadED = 1;
                      for(let h=0;h<loadings.length;h++) {
                          if(loadings[h].style.visibility == "visible") loadED = 0;
                      }
                      if(loadED) { clearInterval(job); console.debug("loaded"); resolve(true); }
                  },100);
              });
        } //Wait loading by check loading visiblity
        //Convert Full-width characters to Half-Width
		const halfwidthValue = (value) => {return value.replace(/[\uff01-\uff5e]/g, fullwidthChar => String.fromCharCode(fullwidthChar.charCodeAt(0) - 0xfee0)).replace(/\u3000/g, '\u0020')}
        //Hijack Canvas.getContext('2d').drawImage to Customized work around
        CanvasRenderingContext2D.prototype.odI = CanvasRenderingContext2D.prototype.drawImage;
        CanvasRenderingContext2D.prototype.drawImage = function() {
            const curp = (document.getElementById('pageSliderCounter').innerHTML).split('/')[0] * 1;
            const totp = (document.getElementById('pageSliderCounter').innerHTML).split('/')[1] * 1;
            if(_$canvas[curp] == undefined) {
                _$canvas[curp] = [];
                if(!start && curp > 1) return firekey(document.getElementById('renderer'), 36); //Home
            }
            if(retry && img$size[curp]) return firekey(document.getElementById('renderer'), 34); //Page Down
            if(curp > 1 && !img$size[curp-1]) return firekey(document.getElementById('renderer'), 33); //Page Up
            if(!img$size[curp] && _$timer == 0 && (arguments[0].nodeName == "CANVAS" || arguments[0].nodeName == "IMG")) {
                if(arguments[0].nodeName == "CANVAS") {
                    _$c_wh.w = arguments[0].width;
                    _$c_wh.h = arguments[0].height;
                    console.dir(arguments);
                    console.log("dummy size:", _$c_wh.w, _$c_wh.h);
                }
                _$timer = setTimeout(async () => {
                    console.log("dummy canvas found");
                    let c = document.createElement('canvas');
                    c.width = _$c_wh.w;
                    c.height = _$c_wh.h;
                    c.ctx = c.getContext("2d");
                    pc.setAttribute("max", totp);
                    pc.setAttribute("value", curp);
                    pc.setAttribute("data-label", "Capture Canvas: "+curp +"/"+ totp);
                    //Rebuild Image on Canvas
                    for(let i=0; i<_$canvas[curp].length;i++) {
                        try {
                            c.ctx.odI(..._$canvas[curp][i]);
                        }
                        catch(e){
                            console.error("Error occurs when rebuilding image.");
                            console.debug({"page":curp, "queue":i, "fragment":_$canvas[curp][i]});
                        };
                    }
                    img$size[curp] = Math.round((c.toDataURL('image/jpeg')).length *3 /4);
                    console.log("size:", Math.round(img$size[curp]/10.24)/100, "KBytes");
                    if(debug) {
                        this.odI(...arguments);
                        c.style = 'position:fixed;top:30vh;left:20vw;height:40vh';
                        document.body.appendChild(c);
                        setTimeout(()=>{document.body.removeChild(c);},5000)
                    }
                    await waitLoading();
                    if(curp == 1 && img$size < 10000 && _overflow_ < overflow_limit) { //Check if Page 1(Cover Page) is too small(properly rendered a white/black blank page)
                        _overflow_++;
                        img$size[curp] = 0;
                        _$canvas[curp] = [];
                        _$c_wh.w = 0;
                        _$timer = 0;
                        console.warn("Cover lesser than 10KB!!");
                    } else if((img$size[curp] == img$size[curp-1] || img$size[curp] == img$size[curp-2]) && _overflow_ < overflow_limit) { //Check if canvas repeated from last 2 pages, buggy
                        console.warn("duplicate page found! going back previous page for retry...");
                        console.debug({"this": img$size[curp], "-1": img$size[curp-1], "-2": img$size[curp-2]});
                        _overflow_++;
                        img$size[curp] = 0;
                        _$canvas[curp] = [];
                        _$c_wh.w = 0;
                        _$timer = 0;
                        document.title = '❌' + on; //for if job hanged
                        //fireKey(document.getElementById('renderer'), 33); //Page Up
                        setTimeout(function() {firekey(document.getElementById('renderer'), 34);},100);
                    } else {
                        _overflow_=0;
                        if(!debug) _$canvas[curp] = [];
                        c.toBlob(async(v)=>{
                            zip.file("P"+pad(curp, 5) + ".jpg", v)
                            console.debug("zipped ", pad(curp, 5) + ".jpg");
                            //console.debug(window.URL.createObjectURL(v));
                            let page = document.createElementNS(null, 'Page');
                            page.setAttribute('ImageWidth', _$c_wh.w);
                            page.setAttribute('ImageHeight', _$c_wh.h);
                            page.setAttribute('ImageSize', v.size);
                            page.setAttribute('Image', curp-1);
                            pages.appendChild(page);
                            _$c_wh.w = 0
                            if(curp >= totp && start) {
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
                                if(!wait && img$size[curp] > 20000) { //Cover should be larger than 20KB
                                    wait = 1;
                                    on = document.title;
                                    const tt = document.createElementNS(null, 'Title');
                                    const st = document.createElementNS(null, 'Series');
                                    on = on.replace(/\s?【.*?】\s?/g, "");
                                    await getDetail(on);
                                    const ser = on.replace(/(.*?)\s?(?:[：\:]{0,1}\s?(\d+)|[（\(]([\d０-９]+)[\)）]|\S?(\d+)\S?)$/, "$1");
                                    let num = halfwidthValue(on).replace(/.*(?:\S?(\d+)\S?|\((\d+)\)|(\d+))$/, "$1");
                                    if(isNaN(parseInt(num))) num = 1;
                                    fn = ser + " 第"+pad(num, 2)+"巻";
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
                    }
                    _page_time = new Date() - _page_time;
                    console.log("Page generation time:", _page_time/1000, "sec");
                    console.groupEnd();
                }, 50);
            } else if(arguments[0].nodeName != "IMG") {
                if(_$c_wh.w == 0) {
                    console.groupCollapsed("Page", curp, "/", totp);
                    _page_time = new Date();
                    _$c_wh.w = arguments[0].width;
                    _$c_wh.h = arguments[0].height;
                    console.log("image size:", _$c_wh.w, _$c_wh.h);
                }
                _$canvas[curp].push(arguments);
                if(mode == 1) {
                    console.debug("trial viewer mode running, this is a whole image, not fragment, push canvas to end collecting");
                    let pcan = document.createElement('canvas');
                    let pctx = pcan.getContext('2d');
                    pcan.width = _$c_wh.w;
                    pcan.height = _$c_wh.h;
                    pctx.odI(...arguments);
                }
            }
            if(show_org) {
                CanvasRenderingContext2D.prototype.odI.apply(this, arguments);
            }
        };
    }());
})();