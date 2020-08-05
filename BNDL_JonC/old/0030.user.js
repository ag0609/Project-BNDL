// ==UserScript==
// @name         Jerk on Canvas
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  I am Canvas Jack, who like jerk on canvas
// @author       Canvas Jack
// @include      https://*.bookwalker.jp/*/viewer.html?*
// @require      https://stuk.github.io/jszip/dist/jszip.js
// @resource     customCSS https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Current/BNDL.user.css
// @run-at       document-body
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

(function() {
    'use strict';

    const cssTxt = GM_getResourceText("customCSS");
    GM_addStyle(cssTxt);
    const emptyAudioFile = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjcxLjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAEAAABVgANTU1NTU1Q0NDQ0NDUFBQUFBQXl5eXl5ea2tra2tra3l5eXl5eYaGhoaGhpSUlJSUlKGhoaGhoaGvr6+vr6+8vLy8vLzKysrKysrX19fX19fX5eXl5eXl8vLy8vLy////////AAAAAExhdmM1Ny44OQAAAAAAAAAAAAAAACQCgAAAAAAAAAVY82AhbwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAALACwAAP/AADwQKVE9YWDGPkQWpT66yk4+zIiYPoTUaT3tnU487uNhOvEmQDaCm1Yz1c6DPjbs6zdZVBk0pdGpMzxF/+MYxA8L0DU0AP+0ANkwmYaAMkOKDDjmYoMtwNMyDxMzDHE/MEsLow9AtDnBlQgDhTx+Eye0GgMHoCyDC8gUswJcMVMABBGj/+MYxBoK4DVpQP8iAtVmDk7LPgi8wvDzI4/MWAwK1T7rxOQwtsItMMQBazAowc4wZMC5MF4AeQAGDpruNuMEzyfjLBJhACU+/+MYxCkJ4DVcAP8MAO9J9THVg6oxRMGNMIqCCTAEwzwwBkINOPAs/iwjgBnMepYyId0PhWo+80PXMVsBFzD/AiwwfcKGMEJB/+MYxDwKKDVkAP8eAF8wMwIxMlpU/OaDPLpNKkEw4dRoBh6qP2FC8jCJQFcweQIPMHOBtTBoAVcwOoCNMYDI0u0Dd8ANTIsy/+MYxE4KUDVsAP8eAFBVpgVVPjdGeTEWQr0wdcDtMCeBgDBkgRgwFYB7Pv/zqx0yQQMCCgKNgonHKj6RRVkxM0GwML0AhDAN/+MYxF8KCDVwAP8MAIHZMDDA3DArAQo3K+TF5WOBDQw0lgcKQUJxhT5sxRcwQQI+EIPWMA7AVBoTABgTgzfBN+ajn3c0lZMe/+MYxHEJyDV0AP7MAA4eEwsqP/PDmzC/gNcwXUGaMBVBIwMEsmB6gaxhVuGkpoqMZMQjooTBwM0+S8FTMC0BcjBTgPwwOQDm/+MYxIQKKDV4AP8WADAzAKQwI4CGPhWOEwCFAiBAYQnQMT+uwXUeGzjBWQVkwTcENMBzA2zAGgFEJfSPkPSZzPXgqFy2h0xB/+MYxJYJCDV8AP7WAE0+7kK7MQrATDAvQRIwOADKMBuA9TAYQNM3AiOSPjGxowgHMKFGcBNMQU1FMy45OS41VVU/31eYM4sK/+MYxKwJaDV8AP7SAI4y1Yq0MmOIADGwBZwwlgIJMztCM0qU5TQPG/MSkn8yEROzCdAxECVMQU1FMy45OS41VTe7Ohk+Pqcx/+MYxMEJMDWAAP6MADVLDFUx+4J6Mq7NsjN2zXo8V5fjVJCXNOhwM0vTCDAxFpMYYQU+RlVMQU1FMy45OS41VVVVVVVVVVVV/+MYxNcJADWAAP7EAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxOsJwDWEAP7SAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxPMLoDV8AP+eAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxPQL0DVcAP+0AFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
    const ss = new Audio(emptyAudioFile);
    ss.loop = true;
    // Your code here...
    let _$timer = 0;
    let start = 0;
    let _$canvas = [];
    let _$c_wh = {w:0, h:0};
    let fn;
    const doOldThings = false;
    const doNewThings = function(i) {
        //Jerk something here
        return new Promise((resolve, reject) => {
            let c = document.createElement('canvas');
            c.ctx = c.getContext("bitmaprenderer");
            c.ctx.transferFromImageBitmap(i);
            c.toBlob((b)=>{console.log(window.URL.createObjectURL(b)); resolve(b)});
        });
    }
    //
    const btn = document.createElement('div');
    btn.id = 'bndl';
    btn.ob = new MutationObserver(ProgressBarCallback);
    btn.addEventListener('dblclick', function() {
        //btn.style.display='none';
        btn.classList.toggle('close');
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
    btn_obj.id = 'bndl4';
    btn_obj.className = 'bndl-btn';
    btn_obj.style.backgroundColor = 'white';
    btn_obj.innerText = 'BNDL';
    btn_obj.onclick = ()=>{btn_obj.disabled=true; start=1; firekey(document.getElementById('renderer'), 34);};
    btn_obj.disabled = true;
    btn.appendChild(document.createElement('tr'));
    btn.appendChild(pc);
    btn.appendChild(btn_obj);
    document.body.appendChild(btn);
    //
    function ProgressBarCallback($$e,_f_) {
        const p = document.getElementsByClassName('bndl-progress')[0];
        const v = p.getElementsByClassName('bndl-value')[0];
        v.style.width = ((p.getAttribute('value') - p.getAttribute('min')) * 100 / p.getAttribute('max')) + "%";
    } //Progress bar uses
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
    CanvasRenderingContext2D.prototype.odI = CanvasRenderingContext2D.prototype.drawImage;
    (function() {
        const pad = function(n, t) {
            t = t * 1 ? t * 1 : Math.max(t.length,3);
            return ('0'.repeat(99) + n).slice(t * -1);
        } //padding for tidy sortable filename
        const fireKey = function(el, key) {
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
        CanvasRenderingContext2D.prototype.drawImage = function() {
            const curp = (document.getElementById('pageSliderCounter').innerText).split('/')[0] * 1;
            const totp = (document.getElementById('pageSliderCounter').innerText).split('/')[1] * 1;
            if(_$canvas[curp] == undefined) _$canvas[curp] = [];
            if(_$timer == 0 && (arguments[0].nodeName == "CANVAS" || arguments[0].nodeName == "IMG")) {
                if(arguments[0].nodeName == "CANVAS") {
                    _$c_wh.w = arguments[0].width;
                    _$c_wh.h = arguments[0].height;
//                     console.dir(arguments);
                    console.log("dummy size:", _$c_wh.w, _$c_wh.h);
                }
                _$timer = setTimeout(()=>{
                    console.log("dummy canvas found");
                    let c = document.createElement('canvas');
                    c.width = _$c_wh.w;
                    c.height = _$c_wh.h;
                    c.ctx = c.getContext("2d");
                    pc.setAttribute("max", totp);
                    pc.setAttribute("value", curp);
                    pc.setAttribute("data-label", "Capture Canvas: "+curp +"/"+ totp);
                    console.log("Current page", curp, "of", totp);
                    //
                    for(let i=0; i<_$canvas[curp].length;i++) {
                        c.ctx.odI(..._$canvas[curp][i]);
                    }
                    c.toBlob((v)=>{
                        zip.file(pad(curp, 5) + ".jpg", v)
                        console.log("zipped ", pad(curp, 5) + ".jpg");
                        console.debug(window.URL.createObjectURL(v));
                        _$c_wh.w = 0
                        _$canvas[curp] = [];
                        if(curp >= totp) {
                            pc.classList.add('zip');
                            pc.setAttribute("min", 0);
                            pc.setAttribute("max", 100);
                            console.groupCollapsed('Zip progress');
                            let pchk = 0;
                            let bchk = setInterval(function() {
                                console.debug(pchk+'%');
                                pc.setAttribute("data-label", "Generating zip...("+ pchk +"%)");
                                window.document.title = "["+Math.ceil(pchk)+"%] "+fn;
                                //favicon.badge(Math.ceil(pchk), {'bgColor':'#6a7'});
                            }, 1000);
                            zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
                                pchk = metadata.percent.toFixed(2);
                            }).then(function (blob) {
                                clearInterval(bchk);
                                console.groupEnd();
                                const Url = window.URL.createObjectURL(blob);
                                console.group("Zip URL")
                                console.log(Url);
                                console.groupEnd();
                                const e = new MouseEvent("click");
                                const a = document.createElement('a');
                                a.innerHTML = 'Download';
                                a.download = fn +".zip";
                                a.href = Url;
                                a.dispatchEvent(e);
                                btn.appendChild(a);
                                window.document.title = "\u2705" + fn;
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
                            window.document.title = "["+curp+"/"+totp+"] "+fn;
                            fireKey(document.getElementById('renderer'), 34);
                        } else {
                            fn = document.getElementsByClassName('titleText')[0].innerText;
                            btn_obj.disabled = false;
                            btn.classList.add('extend');
                            pc.classList.add("start");
                            ss.play();
                        };
                    }, 'image/jpeg');
                }, 50);
            } else if(arguments[0].nodeName != "IMG") {
                if(_$c_wh.w == 0) {
                    _$c_wh.w = arguments[0].width;
                    _$c_wh.h = arguments[0].height;
                    //                     console.dir(arguments);
                    console.log("image size:", _$c_wh.w, _$c_wh.h);
                }
                _$canvas[curp].push(arguments);
            }
            if(doOldThings) CanvasRenderingContext2D.prototype.odI(this, arguments);
        };
    }());
    const zip = new JSZip();
})();