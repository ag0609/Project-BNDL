// ==UserScript==
// @name         BNDL collector(Plugin version)
// @namespace    https://github.com/ag0609/Project-BNDL
// @version      0.3
// @description  Don't use if you don't know what is this
// @author       ag0609
// @match        https://*.bookwalker.jp/*
// @match        https://play.dlsite.com/*
// @match        https://booklive.jp/bviewer/s/*
// @require      tampermonkey://vendor/jquery.js
// @require      tampermonkey://vendor/jszip/jszip.js
// @require      https://raw.githubusercontent.com/Stuk/jszip-utils/master/dist/jszip-utils.min.js
// @require      https://mozilla.github.io/pdf.js/build/pdf.js
// @resource     customCSS https://raw.githubusercontent.com/ag0609/Project-BNDL/master/css/BNDL.user.css
// @resource     BWJP https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Current/Plugin/bookwalkerjp.inc.js
// @resource     DLJP https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Current/Plugin/dlsitejp.inc.js
// @resource     BLJP https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Current/Plugin/booklivejp.inc.js
// @connect      bookwalker.jp
// @connect      play.dl.dlsite.com
// @connect      download.dlsite.com
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM.notification
// @grant        unsafeWindow
// @run-at       document-body
// ==/UserScript==

(async function() {
    'use strict';
    console.time("Initialization Time");
    let debug_enable = 1;
    //
    let show_org = 0;
    let overflow_limit = 100;
    //Read External CSS
    const cssTxt = GM_getResourceText("customCSS");
    GM_addStyle(cssTxt);
    //Empty Audio Loop for retain tab active
    const emptyAudioFile = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjcxLjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAEAAABVgANTU1NTU1Q0NDQ0NDUFBQUFBQXl5eXl5ea2tra2tra3l5eXl5eYaGhoaGhpSUlJSUlKGhoaGhoaGvr6+vr6+8vLy8vLzKysrKysrX19fX19fX5eXl5eXl8vLy8vLy////////AAAAAExhdmM1Ny44OQAAAAAAAAAAAAAAACQCgAAAAAAAAAVY82AhbwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAALACwAAP/AADwQKVE9YWDGPkQWpT66yk4+zIiYPoTUaT3tnU487uNhOvEmQDaCm1Yz1c6DPjbs6zdZVBk0pdGpMzxF/+MYxA8L0DU0AP+0ANkwmYaAMkOKDDjmYoMtwNMyDxMzDHE/MEsLow9AtDnBlQgDhTx+Eye0GgMHoCyDC8gUswJcMVMABBGj/+MYxBoK4DVpQP8iAtVmDk7LPgi8wvDzI4/MWAwK1T7rxOQwtsItMMQBazAowc4wZMC5MF4AeQAGDpruNuMEzyfjLBJhACU+/+MYxCkJ4DVcAP8MAO9J9THVg6oxRMGNMIqCCTAEwzwwBkINOPAs/iwjgBnMepYyId0PhWo+80PXMVsBFzD/AiwwfcKGMEJB/+MYxDwKKDVkAP8eAF8wMwIxMlpU/OaDPLpNKkEw4dRoBh6qP2FC8jCJQFcweQIPMHOBtTBoAVcwOoCNMYDI0u0Dd8ANTIsy/+MYxE4KUDVsAP8eAFBVpgVVPjdGeTEWQr0wdcDtMCeBgDBkgRgwFYB7Pv/zqx0yQQMCCgKNgonHKj6RRVkxM0GwML0AhDAN/+MYxF8KCDVwAP8MAIHZMDDA3DArAQo3K+TF5WOBDQw0lgcKQUJxhT5sxRcwQQI+EIPWMA7AVBoTABgTgzfBN+ajn3c0lZMe/+MYxHEJyDV0AP7MAA4eEwsqP/PDmzC/gNcwXUGaMBVBIwMEsmB6gaxhVuGkpoqMZMQjooTBwM0+S8FTMC0BcjBTgPwwOQDm/+MYxIQKKDV4AP8WADAzAKQwI4CGPhWOEwCFAiBAYQnQMT+uwXUeGzjBWQVkwTcENMBzA2zAGgFEJfSPkPSZzPXgqFy2h0xB/+MYxJYJCDV8AP7WAE0+7kK7MQrATDAvQRIwOADKMBuA9TAYQNM3AiOSPjGxowgHMKFGcBNMQU1FMy45OS41VVU/31eYM4sK/+MYxKwJaDV8AP7SAI4y1Yq0MmOIADGwBZwwlgIJMztCM0qU5TQPG/MSkn8yEROzCdAxECVMQU1FMy45OS41VTe7Ohk+Pqcx/+MYxMEJMDWAAP6MADVLDFUx+4J6Mq7NsjN2zXo8V5fjVJCXNOhwM0vTCDAxFpMYYQU+RlVMQU1FMy45OS41VVVVVVVVVVVV/+MYxNcJADWAAP7EAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxOsJwDWEAP7SAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxPMLoDV8AP+eAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxPQL0DVcAP+0AFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
    const ss = new Audio(emptyAudioFile);
    ss.loop = true;
    //Read Last quality setting
    let quality = await GM.getValue('quality', 0.92);

    //Initialization
    let zip = new JSZip();
    let _init_time, _job_time, _page_time;
    _init_time = _job_time = _page_time = new Date();
    let _overflow_ = 0;
    let _$timer = 0;
    let startf = 0;
    let _$canvas = [];
    let img$size = [];
    let _$c_wh = {w:0, h:0};
    let fn, on, retry, wait;
    let bndl_d;
    let bd = {};
    let xml = document.implementation.createDocument(null, 'ComicInfo'); //Build XML class for ComicInfo.xml(which mainly used by Comic Reader)
    let Ci = xml.getElementsByTagName('ComicInfo')[0];
    Ci.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
    Ci.setAttribute('xmlns:xsd', 'http://www.w3.org/2001/XMLSchema');
    let pages = document.createElementNS(null, 'Pages');
    let scan = document.createElementNS(null, 'ScanInformation');
    scan.innerHTML = "Scaned By BNDL Type Jixun v0.1(ag0609)";
    //Main UI
    const btn = document.createElement('div');
    btn.id = 'bndl';
    btn.style.display = "none";
    btn.ob = new MutationObserver(ProgressBarCallback);
    btn.addEventListener('dblclick', function() {
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
    btn.appendChild(document.createElement('tr'));
    btn.appendChild(pc);
    btn.appendChild(quaBTN);
    btn.appendChild(bndlBTN);
    btn.appendChild(canBTN);
    document.body.appendChild(btn);
    //For Debug
    if(debug_enable) {
        bndl_d = document.createElement('bndl-debug');
        bndl_d.type = 'hidden';
        bndl_d.id ='bndl-debug';
        bndl_d.setAttribute('debug', 0);
        bndl_d.setAttribute('show_org', 0);
        bndl_d.attrchg = ($$e,_f_)=>{
            debug_enable = parseInt(bndl_d.getAttribute('debug')) || 0;
            show_org = parseInt(bndl_d.getAttribute('show_org')) || 0;
        };
        bndl_d.clrcanv = ($ef)=> {
            console.group("clrcanv: Clean Canvas", $ef);
            img$size[$ef] = 0;
            console.groupEnd();
        }
        bndl_d.listzip = (__c)=> {
            console.group("listzip:", "List Zip", __c);
            if(__c) {
                console.debug(zip.folder(__c).file(/(.*)\.(.*)/));
            } else {
                console.debug(zip.file(/(.*)\.(.*)/));
            }
            console.groupEnd();
        }
        bndl_d.dlcanv = ($e_, f$j="")=> {
            console.group("dlcanv: Download Canvas" , $e_);
            let lfn, lf;
            if(isNaN(parseInt($e_))) {
                //is string
                lf = f$j;
                lfn = $e_;
            } else {
                //is integer
                lfn = "P" + pad($e_,5) + ".jpg";
            }
            try {
                let mzip;
                if(lf) {
                    mzip = zip.folder(lf);
                } else {
                    mzip = zip;
                }
                mzip.file(lfn).async("blob").then(function(blob) {
                    console.debug(blob);
                    const Url = window.URL.createObjectURL(blob.slice(0, blob.size, "image/jpeg"));
                    console.log(Url);
                    const e = new MouseEvent("click");
                    const a = document.createElement('a');
                    a.innerHTML = 'Download';
                    a.download = "P" + pad($e_,5) +".jpg";
                    a.href = Url;
                    a.dispatchEvent(e);
                    console.groupEnd();
                });
            } catch(e){
                console.error(e.message);
                let ziperr = [];
                zip.forEach(function(rP, zE) {
                    ziperr.push(zE.name);
                });
                console.debug('files in zip', ziperr);
            }
            console.groupEnd();
        }
        bndl_d.dlzip = () => {
            console.group("dlzip:", "DL Current Zip");
            zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
                //Do nothing
            }).then(function(blob) {
                console.debug("Size:", blob.size);
                const Url = window.URL.createObjectURL(blob);
                const e = new MouseEvent("click");
                const a = document.createElement('a');
                a.innerHTML = 'Download';
                a.download = fn ? fn : "BNDL" + (new Date().getTime()) + ".zip";
                a.href = Url;
                a.dispatchEvent(e);
                URL.revokeObjectURL(blob);
                console.debug("Done");
                console.groupEnd();
            });
        }
        bndl_d.comicInfo = ($a_) => {
            console.group("comicInfo: show comicInfo.xml");
            console.debug(Ci);
            if($a_) {
                let serializer = new XMLSerializer();
                let xmlStr = '<?xml version="1.0"?>\n' + serializer.serializeToString(xml);
                let blob = new Blob([xmlStr], {type: "text/xml"});
                const Url = window.URL.createObjectURL(blob);
                const e = new MouseEvent("click");
                const a = document.createElement('a');
                a.innerHTML = 'Download';
                a.download = "ComicInfo.xml";
                a.href = Url;
                a.dispatchEvent(e);
                URL.revokeObjectURL(blob);
                console.debug("Done");
            }
            console.groupEnd();
        }
        bndl_d.next = () => { console.warn("no function yet"); }
        bndl_d.prev = () => { console.warn("no function yet"); }
        bndl_d.ob = new MutationObserver(bndl_d.attrchg);
        bndl_d.ob.observe(bndl_d, {attributes:true});
        document.body.appendChild(bndl_d);
        unsafeWindow.debug = bndl_d;
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
    function firekey(el, key) {
        key = key != null ? key : 34;
        let eventObj;
        if(document.createEventObject) {
            eventObj = document.createEventObject();
            eventObj.keyCode = key;
            el.fireEvent("focus", eventObj);
            el.fireEvent("onkeydown", eventObj);
        } else if(document.createEvent) {
            eventObj = document.createEvent("Events");
            eventObj.initEvent("focus", true, true);
            el.dispatchEvent(eventObj);
            eventObj.initEvent("keydown", true, true);
            eventObj.which = key;
            el.dispatchEvent(eventObj);
        }
        console.debug("KEY", key, "fired");
    } //simulate keyboard-key fire
    function popout() {
        let args = arguments;
        GM.notification({text:args[0], title:args[1], image:args[2], onclick:()=>{window.focus()}});
    }
    function cENS() {
        let ar9s = arguments;
        let $3_ = document.createElementNS(ar9s[2] || null, ar9s[0] || "Node");
        if(ar9s[1]) $3_.appendChild(document.createTextNode(ar9s[1]));
        return $3_;
    } //create XML Nodes for document
    const halfwidthValue = (value) => {return value.replace(/[\uff01-\uff5e]/g, fullwidthChar => String.fromCharCode(fullwidthChar.charCodeAt(0) - 0xfee0)).replace(/\u3000/g, '\u0020')}
    let jsMain = "";
    let start = ()=>{}, cancel = ()=>{};
    if(/viewer(?:\-p?trial)?\.bookwalker\.jp/i.test(window.location.href)) jsMain = GM_getResourceText("BWJP");
    //if(/bookwalker\.tw/i.test(window.location.href)) jsMain = GM_getResourceText("BWTW");
    if(/booklive\.jp/i.test(window.location.href)) jsMain = GM_getResourceText("BLJP");
    if(/play\.dlsite\.com/i.test(window.location.href)) jsMain = GM_getResourceText("DLJP");
    eval(jsMain);
    bndlBTN.onclick = ()=>{start()};
    canBTN.onclick = ()=>{cancel()};
})();
