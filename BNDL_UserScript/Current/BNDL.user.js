// ==UserScript==
// @name         BNDL
// @namespace    https://github.com/ag0609/bndl
// @version      0.53
// @description  try to take copy of yours books! Book-worm!
// @author       ag0609
// @include      https://*.bookwalker.jp/*/viewer.html?*
// @require      https://stuk.github.io/jszip/dist/jszip.js
// @resource     customCSS https://raw.githubusercontent.com/ag0609/Project-BNDL/master/BNDL_UserScript/Current/BNDL.user.css
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

(function() {
    var img, ba, c, job;
    var [cx, cy, cw, ch] = [0, 0, 0, 0];
    var fn = "xxx";

    const cssTxt = GM_getResourceText("customCSS");
    GM_addStyle(cssTxt);
    const emptyAudioFile = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjcxLjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAEAAABVgANTU1NTU1Q0NDQ0NDUFBQUFBQXl5eXl5ea2tra2tra3l5eXl5eYaGhoaGhpSUlJSUlKGhoaGhoaGvr6+vr6+8vLy8vLzKysrKysrX19fX19fX5eXl5eXl8vLy8vLy////////AAAAAExhdmM1Ny44OQAAAAAAAAAAAAAAACQCgAAAAAAAAAVY82AhbwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAALACwAAP/AADwQKVE9YWDGPkQWpT66yk4+zIiYPoTUaT3tnU487uNhOvEmQDaCm1Yz1c6DPjbs6zdZVBk0pdGpMzxF/+MYxA8L0DU0AP+0ANkwmYaAMkOKDDjmYoMtwNMyDxMzDHE/MEsLow9AtDnBlQgDhTx+Eye0GgMHoCyDC8gUswJcMVMABBGj/+MYxBoK4DVpQP8iAtVmDk7LPgi8wvDzI4/MWAwK1T7rxOQwtsItMMQBazAowc4wZMC5MF4AeQAGDpruNuMEzyfjLBJhACU+/+MYxCkJ4DVcAP8MAO9J9THVg6oxRMGNMIqCCTAEwzwwBkINOPAs/iwjgBnMepYyId0PhWo+80PXMVsBFzD/AiwwfcKGMEJB/+MYxDwKKDVkAP8eAF8wMwIxMlpU/OaDPLpNKkEw4dRoBh6qP2FC8jCJQFcweQIPMHOBtTBoAVcwOoCNMYDI0u0Dd8ANTIsy/+MYxE4KUDVsAP8eAFBVpgVVPjdGeTEWQr0wdcDtMCeBgDBkgRgwFYB7Pv/zqx0yQQMCCgKNgonHKj6RRVkxM0GwML0AhDAN/+MYxF8KCDVwAP8MAIHZMDDA3DArAQo3K+TF5WOBDQw0lgcKQUJxhT5sxRcwQQI+EIPWMA7AVBoTABgTgzfBN+ajn3c0lZMe/+MYxHEJyDV0AP7MAA4eEwsqP/PDmzC/gNcwXUGaMBVBIwMEsmB6gaxhVuGkpoqMZMQjooTBwM0+S8FTMC0BcjBTgPwwOQDm/+MYxIQKKDV4AP8WADAzAKQwI4CGPhWOEwCFAiBAYQnQMT+uwXUeGzjBWQVkwTcENMBzA2zAGgFEJfSPkPSZzPXgqFy2h0xB/+MYxJYJCDV8AP7WAE0+7kK7MQrATDAvQRIwOADKMBuA9TAYQNM3AiOSPjGxowgHMKFGcBNMQU1FMy45OS41VVU/31eYM4sK/+MYxKwJaDV8AP7SAI4y1Yq0MmOIADGwBZwwlgIJMztCM0qU5TQPG/MSkn8yEROzCdAxECVMQU1FMy45OS41VTe7Ohk+Pqcx/+MYxMEJMDWAAP6MADVLDFUx+4J6Mq7NsjN2zXo8V5fjVJCXNOhwM0vTCDAxFpMYYQU+RlVMQU1FMy45OS41VVVVVVVVVVVV/+MYxNcJADWAAP7EAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxOsJwDWEAP7SAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxPMLoDV8AP+eAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxPQL0DVcAP+0AFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
    const ss = new Audio(emptyAudioFile);
    ss.loop = true;

    function pad(n, t) {
        t = t * 1 ? t * 1 : Math.max(t.length,3);
        return ('0'.repeat(99) + n).slice(t * -1);
    } //padding for tidy sortable filename
    function chopCanvas(canvas, x, y, w, h) {
        x = x ? x : 0;
        y = y ? y : 0;
        w = w ? w : canvas.width;
        h = h ? h : canvas.height;
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
        console.log("PAGE_DOWN fired");
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
        const btn = document.createElement('div');
        btn.id = 'bndl';
        btn.ob = new MutationObserver(ProgressBarCallback);
        btn.addEventListener('dblclick', function() {
            btn.style.display='none';
            btn.classList.toggle('min');
        });
        btn.classList.add('open');
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
        btn.appendChild(pc);
        btn.appendChild(btn_obj);
        document.body.appendChild(btn);
    } //Show "Save" Button on page
    function DLFile() {
        console.group("JSZip");
        const pc = document.getElementById('bndl-progress');
        pc.classList.add('zip');
        const zip = new JSZip();
        console.groupCollapsed("Insert");
        for(var i in ba) {
            console.log("<-- [%s] %i bytes", pad(i,5) +".jpg", ba[i].size);
            zip.file(pad(i,5) +".jpg", ba[i], {base64: true});
        }
        console.log('xxx Clean up canvas caches xxx');
        ba = null;
        console.groupEnd();
        console.log('==> Generating %s.zip...', fn);
        pc.setAttribute("data-label", "Generating "+ fn +".zip...");
        pc.setAttribute("min", 0);
        pc.setAttribute("max", 200);
        console.groupCollapsed('Zip progress');
        zip.generateAsync({type:"blob"}, function updateCallback(metadata) {
            console.log(metadata.percent.toFixed(2)+'%');
            const pc = document.getElementById('bndl-progress');
            pc.setAttribute("value", 100 + (metadata.percent.toFixed(2)*1));
        }).then(function (blob) {
            console.groupEnd();
            const Url = window.URL.createObjectURL(blob);
            console.log("URL: %s", Url);
            console.groupEnd();
            const e = new MouseEvent("click");
            const a = document.createElement('a');
            a.download = fn +".zip";
            a.href = Url;
            a.dispatchEvent(e);
            pc.setAttribute("data-label", "Completed. Pushing zip to download.");
            setTimeout(function() {
                pc.classList.remove('start');
                pc.classList.remove('zip');
            }, 5000);
            ss.pause();
        });
    } //Zip Canvas and Download archive
    function saveFile() {
        let obj = document.getElementById('bndl4');
        let pc = document.getElementById('bndl-progress');
        let phl = document.getElementById('bndl');
        fn = document.getElementsByClassName('titleText')[0].innerText;
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
        ba = new Array();
        ss.play();
        job = setInterval(function() {
            let load = 0
            const load_lst = document.getElementsByClassName("loading");
            if(load_lst.length) {
                for(let i in load_lst) {
                    if(typeof(load_lst[i]) != 'object') continue;
                    if(load_lst[i].style.visibility != 'hidden') load = 1;
                }
            }
            const curp = (document.getElementById('pageSliderCounter').innerText).split('/')[0] * 1;
            if(!load) {
                console.group("Progress: %i/%i", curp, totp);
                console.groupCollapsed("Zooming...");
                c = document.getElementsByClassName("currentScreen")[0].getElementsByTagName("canvas")[0];
                while(document.getElementById('zoomRatio').innerText != '200%') {
                    console.log("Zoomrate: %s", document.getElementById('zoomRatio').innerText);
                    document.getElementById("zoomInBtn").click();
                }
                console.groupEnd();
                obj.innerText = "Stop";
                pc.setAttribute("data-label", "Capture Canvas: "+curp +"/"+ totp);
                pc.setAttribute("value", curp);
                let skip=48;
                let fuzz=10;
                if(!ba.length) {
                    skip=4;
                }
                let img = trimCanvas(c, [255,255,255], fuzz, skip, [cx,cy,cw,ch]);
                img = chopCanvas(c, cx, cy, cw, ch);
                ba[curp] = dataURItoBlob(img.toDataURL('image/jpeg'));
                const trimBlack = (dataURItoBlob(trimCanvas(img, [0,0,0], 10, 48).toDataURL('image/jpeg'))).size;
                console.debug("[%i] size: %i bytes", curp, ba[curp].size);
                console.debug("[B%i] size: %i bytes", curp, trimBlack);
                if(ba[curp].size < 20000 && trimBlack < 1000 && tmpS < 10) {
                    console.warn("[%i] too small(< 20000 bytes), retrying %i times for capture canvas", curp, tmpS+1);
                    tmpS++;
                } else if(trimBlack < 1000 && tmpS < 10) {
                    console.warn("[B%i] too small(< 1000 bytes), retrying %i times for capture canvas", curp, tmpS+1);
                    tmpS++;
                } else {
                    if(tmpS >= 10) {
                        console.error("Error occured by too many retries when triming canvas\n Seems first page we want to trim almost whitespace...\n original canvas will be stored, proceeding to next page...");
                        ba[curp] = dataURItoBlob(c.toDataURL('image/jpeg'));
                    }
                    tmpS = 0;
                    fireKey(document.getElementById('renderer'), 34);
                }
                console.groupEnd();
            } else console.log("Still loading...");
            if(curp == totp) {
                clearInterval(job);
                console.log("Captrue Completed");
                job = 0;
                DLFile();
                obj.innerText = "BNDL";
                return true;
            }
        },500);
    } //Store canvas to memory
    window.onLoad = setTimeout(wait_for_canvas_loaded, 50);
})();
