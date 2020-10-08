// ==UserScript==
// @name         BNDL collector(Plugin version)
// @namespace    https://github.com/ag0609/Project-BNDL
// @version      0.1
// @description  Don't use if you don't know what is this
// @author       ag0609
// @match        https://viewer.bookwalker.jp/*
// @match        https://play.dlsite.com/*
// @require      tampermonkey://vendor/jquery.js
// @require      tampermonkey://vendor/jszip/jszip.js
// @resource     customCSS https://raw.githubusercontent.com/ag0609/Project-BNDL/master/css/BNDL.user.css
// @resource	 BWJP https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Current/Plugin/bookwalkerjp.inc.js
// @resource	 DLJP https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Current/Plugin/dlsitejp.inc.js
// @connect      bookwalker.jp
// @connect      play.dlsite.fun
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        unsafeWindow
// @run-at       document-body
// ==/UserScript==

(async function() {
    'use strict';
    let debug_enable = 1;
    //
    let debug = 0;
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
    //Check if reading a trial version of a book
    let mode = 0;
    if(window.location.href.match(/viewer-trial/)) {
        console.warn("Trial viewer mode is running, this book is not a full version!!");
        mode = 1;
    }
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
            try {
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
        bndl_d.comicInfo = () => {
            console.group("comicInfo: show comicInfo.xml");
            console.debug(Ci);
            console.groupEnd();
        }
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
        console.debug("KEY", key, "fired");
    } //simulate keyboard-key fire
	let jsMain;
	if(/bookwalker\.jp/i.test(window.location.href)) jsMain = GM_getResourceText("BWJP");
	//if(/bookwalker\.tw/i.test(window.location.href)) jsMain.innerHTML = GM_getResourceText("BWTW");
	//if(/booklive\.jp/i.test(window.location.href)) jsMain.innerHTML = GM_getResourceText("BLJP");
	if(/dlsite\.com/i.test(window.location.href)) jsMain = GM_getResourceText("DLJP");
	eval(jsMain);
    bndlBTN.onclick = ()=>{start()};
    canBTN.onclick = ()=>{cancal()};
})();
