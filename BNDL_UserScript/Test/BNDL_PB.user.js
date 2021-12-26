// ==UserScript==
// @name         BNDL collector(Bootstrap version)
// @namespace    https://github.com/ag0609/Project-BNDL
// @version      0.95
// @description  Don't use if you don't know what is this
// @author       ag0609
// @match        https://viewer.bookwalker.jp/*
// @match        https://viewer-trial.bookwalker.jp/*
// @match        https://viewer-ptrial.bookwalker.jp/*
// @match        https://viewer-subscription.bookwalker.jp/*
// @match        https://play.dlsite.com/*
// @match        https://booklive.jp/bviewer/s/*
// @require      https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js
// @require      https://cdn.jsdelivr.net/npm/jszip@3.5.0/dist/jszip.js
// @require      https://cdn.jsdelivr.net/npm/jszip-utils@0.1.0/dist/jszip-utils.min.js
// @require      https://cdn.jsdelivr.net/npm/pdfjs-dist@2.5.207/build/pdf.min.js
// @require      https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.min.js
// @require      https://github.com/ag0609/SeLf_UsEs_DoNt_ToUcH/raw/main/Javascript/comicinfo.class.obs.js
// @require      https://github.com/ag0609/SeLf_UsEs_DoNt_ToUcH/raw/main/Javascript/JSONHandler.class.obs.js
// @require      https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Test/Plugin/Bootstrap-Extend.inc.js
// @require      https://github.com/ag0609/SeLf_UsEs_DoNt_ToUcH/raw/main/Javascript/Array.ext.obs.js
// @require      https://github.com/ag0609/SeLf_UsEs_DoNt_ToUcH/raw/main/Javascript/String.ext.obs.js
// @require      https://github.com/ag0609/SeLf_UsEs_DoNt_ToUcH/raw/main/Javascript/Number.ext.obs.js
// @resource     bsCSS https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css
// @resource     chartCSS https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.min.css
// @resource     BWJP https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Test/Plugin/bookwalkerjp.inc.js
// @resource     DLJP https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Test/Plugin/dlsitejp.inc.js
// @resource     BLJP https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Test/Plugin/booklivejp.inc.js
// @resource     GB https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Test/Plugin/GB.inc.js
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
    const bndl_ver = "BNDL Project Userscript Version "+ GM_info.script.version;
    console.log(bndl_ver);
    console.time("Initialization Time");
    let debug_enable = 1;
    //
    const qParams = new URLSearchParams(window.location.search);
    //
    let show_org = 0;
    let overflow_limit = 100;
    //Read External CSS
    resourceCSS("bsCSS");
    resourceCSS("chartCSS");
    GM_addStyle(".overflow-visible { overflow:visible!important }");
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
    let _pdb = [];
    let _overflow_ = 0;
    let _$timer = 0;
    let startf = 0;
    let _$canvas = [];
    let img$size = [];
    let _$c_wh = {w:0, h:0};
    let gcurp, gtotp;
    let fn, on, retry, wait;
    let bndl_d, bnt, bnto, start=()=>{}, cancel=()=>{}, next=() => { console.warn("no function yet"); }, prev=() => { console.warn("no function yet"); };
    let bd = {};
    let Ci = new comicinfo(); //Build XML class for ComicInfo.xml(which mainly used by Comic Reader)
    let pages;
    let scan = "Scaned By BNDL "+GM_info.script.version+"(ag0609)";
    //Main UI
    const maindiv = document.createElement('div');
    const maincontent = $('<div>').appendTo($(maindiv));
    const maindiv$extend = {width:'100vw',height:'100vh'};
    const maindiv$close = {width:'10%',height:'5%'};
    $(maindiv).attr("id", 'bndl')
              .addClass('jumbotron position-fixed')
              .css({top:'50%',left:'50%',
                    transition:'all .7s',
                    transform:'translate(-50%,-50%)',
                    minWidth:'300px',minHeight:'150px',
                    margin:'auto', 'z-index':1000001,
                    backgroundColor:'lightgrey'})
              .hide();
    $(maincontent).addClass('align-middle text-center d-table w-100 h-100 p-3');
    $(maindiv).hover(function() {$(this).css({opacity:.7})}, function() {$(this).css({opacity:1})});
    maindiv.ob = new MutationObserver(ProgressBarCallback);
    $(maindiv).dblclick(function() {
        $(maindiv).toggleClass('extend');
        if($(maindiv).hasClass('extend')) {
            $(maindiv).addClass('w-100 h-100');
        } else {
            $(maindiv).removeClass('w-100 h-100');
        }
    });
    const pc = document.createElement('div');
    $(pc).attr("id", 'bndl-progress')
      .css({height:'0px'})
      .addClass("progress user-select-none");
    const pcv = document.createElement('div');
    $(pcv).addClass("progress-bar progress-bar-striped progress-bar-animated overflow-visible")
      .attr({"role":"progress-bar", "aria-valuemin":0, "aria-valuemax":0, "aria-valuenow":0})
      .css({"overflow":"visible!important"})
      .appendTo($(pc));
    $('<span>').addClass('progress-label container w-auto text-nowrap').css({'text-shadow':'-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000'}).appendTo($(pcv));
    maindiv.ob.observe(pcv, {attributes:true});
    const btn_obj = document.createElement('button');
    $(btn_obj).attr("type", "button").addClass("btn");
    const bndlBTN = btn_obj.cloneNode();
    $(bndlBTN).attr("id", 'bndl4')
      .attr({"data-default-text":"BNDL", disabled:"true"})
      .addClass('btn-success')
      .text('BNDL');
    const quaBTN = btn_obj.cloneNode();
    $(quaBTN).addClass('btn-primary')
      .attr({"data-default-text":"Quality","data-now-text":'Quality('+quality*100+')'})
      .text('Quality('+quality*100+')')
      .click(async ()=>{let tmpq = prompt("Quality?(0-100)"); if(tmpq < 100 && tmpq > 0) {quality = tmpq/100; await GM.setValue('quality', quality);} $(quaBTN).text('Quality('+quality*100+')');});
    const canBTN = btn_obj.cloneNode();
    $(canBTN).addClass('btn-danger')
      .attr("data-default-text", "Stop")
      .text("Stop");
    //$('<tr>').appendTo($(maincontent));
    $(pc).appendTo($(maincontent));
    $(quaBTN).appendTo($(maincontent));
    $(bndlBTN).appendTo($(maincontent));
    $(canBTN).appendTo($(maincontent));
    $(maindiv).appendTo('body');
    //initial toaster
    toast(null, null, 0, null, {containerPos:"RB"});
    //For Debug
    if(debug_enable) {
        bndl_d = document.createElement('bndl-debug');
        $(bndl_d).attr({"type":'hidden',
                        "id":'bndl-debug',
                        "debug":0,
                        "show_org":0});
        bndl_d.attrchg = ($$e,_f_)=>{
            debug_enable = parseInt($(bndl_d).attr('debug')) || 0;
            show_org = parseInt($(bndl_d).attr('show_org')) || 0;
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
                    $(a).addClass('btn')
                        .text('Download')
                        .attr("download", "P" + pad($e_,5) +".jpg")
                        .attr("href", Url);
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
        bndl_d.dlzip = (_x$=0) => {
            console.group("dlzip:", "DL Current Zip");
            if(_x$) {
                let xmlblob = new Blob([Ci.toString()], {type: "text/xml"});
                zip.file("ComicInfo.xml", xmlblob);
            }
            let ext = '';
            if(gcurp && gcurp > 1) ext = '-'+ gcurp;
            zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
                //Do nothing
            }).then(function(blob) {
                console.debug("Size:", blob.size);
                const Url = window.URL.createObjectURL(blob);
                const e = new MouseEvent("click");
                const a = document.createElement('a');
                $(a).addClass('btn')
                    .text('Download')
                    .attr("download", (fn ? fn : "BNDL" + (new Date().getTime())) + ext +".zip")
                    .attr("href", Url);
                a.dispatchEvent(e);
                URL.revokeObjectURL(blob);
                console.debug("Done");
                console.groupEnd();
            });
        }
        bndl_d.comicInfo = ($a_=0) => {
            console.group("comicInfo: show comicInfo.xml");
            console.debug(Ci.ComicInfo);
            if($a_) {
                let blob = new Blob([Ci.toString()], {type: "text/xml"});
                const Url = window.URL.createObjectURL(blob);
                const e = new MouseEvent("click");
                const a = document.createElement('a');
                $(a).addClass('btn')
                    .text('Download')
                    .attr("download", (fn ? fn : "ComicInfo.xml"))
                    .attr("href", Url);
                a.dispatchEvent(e);
                URL.revokeObjectURL(blob);
                console.debug("Done");
            }
            console.groupEnd();
        }
        bndl_d.toast = function() {
            const args = arguments;
            if(args.length == 0) {
                toast("Information is a good one to state messages which user may want to acknowlaged. This one will shows up 15 seconds.", "info", 15000, "Information");
                toast("This is a message when good news here.", "success", 0, "Success");
                toast("This is a message which you are being warned, stay sharp.\nThis message will hide in 6 seconds.", "warning", 6000, "Warning");
                toast("Error Message will show up when task catch on error.", "danger", 0, "Error");
            } else {
                toast(...args);
            }
        }
        bndl_d.eval = function(cmd) { eval(cmd); }
        bndl_d.start = ()=>{start()};
        bndl_d.cancel = ()=>{cancel()};
        bndl_d.next = ()=>{next()};
        bndl_d.prev = ()=>{prev()};
        bndl_d.ob = new MutationObserver(bndl_d.attrchg);
        bndl_d.ob.observe(bndl_d, {attributes:true});
        document.body.appendChild(bndl_d);
        unsafeWindow.debug = bndl_d;
    }
    //
    function resourceCSS(l) {
        const cssTxt = GM_getResourceText(l);
        GM_addStyle(cssTxt);
    }
    function ProgressBarCallback($$e,_f_) {
        const v = $(pcv);
        v.css('width', ((v.attr('aria-valuenow') - v.attr('aria-valuemin')) * 100 / v.attr('aria-valuemax')) + "%");
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
    async function getFileSize($_u) {
        let filesize = 0;
        let xhr = await GM.xmlHttpRequest({
            method: "HEAD",
            synchronous: true,
            timeout: 3000,
            url: $_u,
            onload: function() {
                if(this.readyState == this.DONE && this.status === 200) {
                    const headers = this.responseHeaders;
                    filesize = parseInt(headers.match(new RegExp("content-length:\\s*\\d+"), "gi")[0].match(new RegExp("\\d+", "g"))[0]) || 0;
                }
                return filesize;
            }
        });
    }
    debug.getSize = getFileSize;
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
    }//popout notification
    function cENS() {
        let ar9s = arguments;
        let $3_ = document.createElementNS(ar9s[2] || null, ar9s[0] || "Node");
        if(ar9s[1]) $3_.appendChild(document.createTextNode(ar9s[1]));
        return $3_;
    } //create XML Nodes for document
    function toastchart(_data, opts, t="Chart") {
        let chrcon = $('<canvas>').css({width:'100%', height:'200px'});
        toast(chrcon, 'info', 0, t, {htmlBody:true});
        var chart = new Chart(chrcon, {
            type: 'line',
            data: _data,
            options: opts
        });
        chart.updateChart = function (val, lab=null) {
            const db = this.config.data.datasets[0].data;
            const la = this.config.data.labels;
            db.push(val);
            la.push(lab?lab:(val.x!=undefined?val.x:val));
            chart.update();
        };
        return chart;
    }
    const halfwidthValue=(value,exception={})=>{Object.keys(exception).forEach(k=>value.replace(new RegExp(k,'g'),exception[k]));return value.replace(/(?:！？|!\?)/g,"⁉").replace(/[\uff01-\uff5e]/g,fullwidthChar=>String.fromCharCode(fullwidthChar.charCodeAt(0)-0xfee0)).replace(/\u3000/g,'\u0020')}
    toast('', "success", 5000, bndl_ver);
    let jsMain = "";
    if(/viewer(?:\-(?:p?trial|subscription))?\.bookwalker\.jp/i.test(window.location.href)) jsMain = GM_getResourceText("BWJP");
    //if(/bookwalker\.tw/i.test(window.location.href)) jsMain = GM_getResourceText("BWTW");
    if(/booklive\.jp/i.test(window.location.href)) jsMain = GM_getResourceText("BLJP");
    if(/play\.dlsite\.com/i.test(window.location.href)) jsMain = GM_getResourceText("DLJP");
    eval(jsMain);
    $(bndlBTN).on("click", ()=>{start()});
    $(canBTN).on("click", ()=>{cancel()});
})();
