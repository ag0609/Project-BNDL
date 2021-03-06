// ==UserScript==
// @name         BNDL
// @namespace    https://github.com/ag0609/bndl
// @version      0.48
// @description  try to take copy of yours books! Book-worm!
// @author       ag0609
// @include      https://*.bookwalker.jp/*/viewer.html?*
// @require      https://stuk.github.io/jszip/dist/jszip.js
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    var img, ba, c, job;
    var [cx, cy, cw, ch] = [0, 0, 0, 0];
    var fn = "xxx";

    const css = "I2JuZGwgew0KCXBvc2l0aW9uOiBhYnNvbHV0ZTsNCglkaXNwbGF5OiBmbGV4Ym94Ow0KCWJhY2tncm91bmQtY29sb3I6IGRhcmtyZWQ7DQoJdHJhbnNpdGlvbjplYXNlIDAuM3M7DQp9DQoNCiNibmRsOmhvdmVyIHsNCglvcGFjaXR5OiAuNzsNCn0NCg0KI2JuZGwuY2xvc2Ugew0KCXRvcDo5NSU7DQoJbGVmdDo5MCU7DQoJd2lkdGg6MTAlOw0KCWhlaWdodDo1JQ0KfQ0KDQojYm5kbC5vcGVuIHsNCgl0b3A6NDAlOw0KCWxlZnQ6MzUlOw0KCXdpZHRoOjMwJTsNCgloZWlnaHQ6MjAlDQp9DQoNCiNibmRsLmV4dGVuZCB7DQoJdG9wOjA7DQoJbGVmdDowOw0KCXdpZHRoOjEwMCU7DQoJaGVpZ2h0OjEwMCU7DQoJb3ZlcmZsb3c6IGhpZGRlbjsNCn0NCg0KYnV0dG9uIC5ibmRsLWJ0biB7DQoJLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lOw0KCWJhY2tncm91bmQtY29sb3I6IGJsYWNrOw0KCWZvbnQtc2l6ZTogMTBweDsNCglhbGlnbi1zZWxmOiBjZW50ZXI7DQp9DQoNCi5ibmRsLXByb2dyZXNzIHsNCgl3aWR0aDogMTAwJTsNCgloZWlnaHQ6IDAlOw0KCWJhY2tncm91bmQtY29sb3I6IHdoaXRlc21va2U7DQoJcG9zaXRpb246IHJlbGF0aXZlOw0KCW92ZXJmbG93OiBoaWRkZW47DQoJdHJhbnNpdGlvbjogZWFzZSAwLjNzOw0KICB9DQogIC5ibmRsLXByb2dyZXNzOmJlZm9yZSB7DQoJY29udGVudDogYXR0cihkYXRhLWxhYmVsKTsNCglmb250LXNpemU6IDAuOGVtOw0KCXBvc2l0aW9uOiBhYnNvbHV0ZTsNCglkaXNwbGF5OiB0YWJsZS1jZWxsOw0KCW1hcmdpbjogYXV0bzsNCgl0ZXh0LWFsaWduOiBjZW50ZXI7DQoJdmVydGljYWwtYWxpZ246IG1pZGRsZTsNCgl6LWluZGV4OiA5OTk5Ow0KCXRvcDogMDsNCglsZWZ0OiAwOw0KCXJpZ2h0OiAwOw0KCWJvdHRvbTogMDsNCiAgfQ0KICAuYm5kbC1wcm9ncmVzcyA+IHNwYW4gew0KCWhlaWdodDogMTAwJTsNCgliYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDEzNSwgMjA2LCAyMzUsIDAuOSk7DQoJYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KA0KCQktNDVkZWcsIA0KCQlyZ2JhKDI1NSwgMjU1LCAyNTUsIC40KSAyNSUsIA0KCQl0cmFuc3BhcmVudCAyNSUsIA0KCQl0cmFuc3BhcmVudCA1MCUsIA0KCQlyZ2JhKDI1NSwgMjU1LCAyNTUsIC40KSA1MCUsIA0KCQlyZ2JhKDI1NSwgMjU1LCAyNTUsIC40KSA3NSUsIA0KCQl0cmFuc3BhcmVudCA3NSUsIA0KCQl0cmFuc3BhcmVudA0KCSAgKTsNCgkgIHotaW5kZXg6IDE7DQoJYmFja2dyb3VuZC1zaXplOiA1MHB4IDUwcHg7DQoJYW5pbWF0aW9uOiBtb3ZlIDJzIGxpbmVhciBpbmZpbml0ZTsNCglib3gtc2hhZG93OiANCgkgIGluc2V0IDAgMnB4IDlweCAgcmdiYSgyNTUsMjU1LDI1NSwwLjMpLA0KCSAgaW5zZXQgMCAtMnB4IDZweCByZ2JhKDAsMCwwLDAuNCk7DQoJcG9zaXRpb246IHJlbGF0aXZlOw0KCW92ZXJmbG93OiBoaWRkZW47DQoJZGlzcGxheTogaW5saW5lLWJsb2NrOw0KCXRyYW5zaXRpb246IGVhc2UgMC4zczsNCiAgfQ0KICAuYm5kbC1wcm9ncmVzcy5zdGFydCB7DQoJaGVpZ2h0OiAyMHB4Ow0KICB9DQogIC5ibmRsLXByb2dyZXNzLnN0YXJ0ID4gc3BhbiB7DQoJICBhbmltYXRpb246IGJuZGwtdmFsdWUtc3RhcnQtYmFyIDFzIGluZmluaXRlIGxpbmVhcjsNCiAgfQ0KICBAa2V5ZnJhbWVzIGJuZGwtdmFsdWUtc3RhcnQtYmFyIHsNCgkwJSB7DQoJCWJhY2tncm91bmQtcG9zaXRpb24teDogNTBweDsNCgl9DQoJMTAwJSB7DQoJCWJhY2tncm91bmQtcG9zaXRpb24teDogMHB4Ow0KCX0NCiAgfQ==";
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = atob(css);
    document.getElementsByTagName('head')[0].appendChild(style);

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
        fuzz = fuzz ? fuzz : 13.33;
        color = typeof(color) == typeof([]) ? color : [255, 255, 255];
        skip = skip ? skip : 1;
        var [bx, by ,bw, bh] = typeof(border) == typeof([]) ? border : [-1,-1,-1,-1];
        console.log("border:", [bx, by, bw, bh]);
        var borderFlag = true;
        if(bw < 0) borderFlag = false;
        console.log("color:", color);
        console.log("fuzz:", fuzz);
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
            } else if(bx+bw < bottomRight.x) {
                cx = bottomRight.x - cw;
                bx = cx;
            }
        }
        console.log("tLx: %i, tLy: %i, w: %i, h: %i", bx, by, bw, bh);
        const newData = context.getImageData(bx,by,bw,bh);
        croppedCanvas.width = width;
        croppedCanvas.height = height;
        ctx.putImageData(newData,0,0);
        console.groupEnd();
        return croppedCanvas;
    } //encode canvas
    function fireKey(el, key) {
        key = key != null ? key : 34;
        var eventObj;
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
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);
        else byteString = unescape(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], {type:mimeString});
    } //canvas to blob
    function wait_for_canvas_loaded() {
        var canvas_containers = document.getElementsByClassName("currentScreen");
        if(!canvas_containers.length) return setTimeout(wait_for_canvas_loaded, 500);
        var canvas_list = canvas_containers[0].getElementsByTagName("canvas");
        if(!canvas_list.length) return setTimeout(wait_for_canvas_loaded, 500);
        c = canvas_list[0];
        create_btn();
    } //wait for canvas object appear
    function callback($$e,_f_) {
        var p = document.getElementsByClassName('bndl-progress')[0];
        var v = p.getElementsByClassName('bndl-value')[0];
        v.style.width = ((p.getAttribute('value') - p.getAttribute('min')) * 100 / p.getAttribute('max')) + "%";
    } //Progress bar uses
    function create_btn() {
        var btn = document.createElement('div');
        btn.id = 'bndl';
        btn.ob = new MutationObserver(callback);
        btn.classList.add('open');
        var pc = document.createElement('div');
        pc.id = 'bndl-progress';
        pc.classList.add("bndl-progress");
        var pcv = document.createElement('span');
        pcv.classList.add("bndl-value");
        pc.setAttribute("min", 0);
        pc.setAttribute("max", 0);
        pc.setAttribute("value", 0);
        pc.appendChild(pcv);
        btn.ob.observe(pc, {attributes:true});
        var btn_obj = document.createElement('button');
        btn_obj.type = 'button';
        btn_obj.id = 'bndl4';
        btn_obj.style.backgroundColor = 'white';
        btn_obj.innerText = 'BNDL';
        btn_obj.onclick = saveFile;
        btn.appendChild(document.createElement('br'));
        btn.appendChild(pc);
        btn.appendChild(btn_obj);
        document.body.appendChild(btn);
    } //Show "Save" Button on page
    function DLFile() {
        console.group("JSZip");
        var zip = new JSZip();
        console.groupCollapsed("Insert");
        for(var i in ba) {
            console.log("<-- [%s] %i bytes", pad(i,5) +".jpg", ba[i].size);
            zip.file(pad(i,5) +".jpg", ba[i], {base64: true});
        }
        console.groupEnd();
        zip.generateAsync({type:"blob"})
            .then(function (blob) {
            var Url = window.URL.createObjectURL(blob);
            console.log("URL: %s", Url);
            console.groupEnd();
            var e = document.createEvent('MouseEvents');
            var a = document.createElement('a');
            a.download = fn +".zip";
            a.href = Url;
            e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
            a.dispatchEvent(e)
        });
    } //Zip Canvas and Download archive
    function saveFile() {
        var obj = document.getElementById('bndl4');
        var pc = document.getElementById('bndl-progress');
        var phl = document.getElementById('bndl');
        fn = document.getElementsByClassName('titleText')[0].innerText;
        console.log("Title:", fn);
        if(job) {
            clearInterval(job);
            job = 0;
            pc.classList.toggle("start");
            pc.setAttribute("data-label", '');
            obj.innerText = "BNDL";
            DLFile();
            return console.log('Stopped');
        }
        pc.classList.toggle("start");
        phl.style.display = 'flex';
        phl.style.backgroundColor = 'grey';
        document.getElementById('bndl').classList.add('extend');
        phl.style.alignItems = 'center';
        obj.innerText = "WAIT";
        var [fp, tmpS] = [0, 0];
        var totp = (document.getElementById('pageSliderCounter').innerText).split('/')[1] * 1;
        pc.setAttribute("max", totp);
        ba = new Array();
        job = setInterval(function() {
            var load = 0
            var load_lst = document.getElementsByClassName("loading");
            if(load_lst.length) {
                for(var i in load_lst) {
                    if(typeof(load_lst[i]) != 'object') continue;
                    if(load_lst[i].style.visibility != 'hidden') load = 1;
                }
            }
            if(!load) {
                var curp = (document.getElementById('pageSliderCounter').innerText).split('/')[0] * 1;
                console.group("Progress: %i/%i", curp, totp);
                console.groupCollapsed("Zooming...");
                c = document.getElementsByClassName("currentScreen")[0].getElementsByTagName("canvas")[0];
                while(document.getElementById('zoomRatio').innerText != '200%') {
                    console.log("Zoomrate: %s", document.getElementById('zoomRatio').innerText);
                    document.getElementById("zoomInBtn").click();
                }
                console.groupEnd();
                obj.innerText = "Stop";
                pc.setAttribute("data-label", curp +"/"+ totp);
                pc.setAttribute("value", curp);
                var img;
                img = trimCanvas(c, [255,255,255], 10, 16, [cx,cy,cw,ch]);
                if(img.width < cw || img.height < ch) {
                    img = chopCanvas(c, cx, cy, cw, ch);
                }
                ba[curp] = dataURItoBlob(img.toDataURL('image/jpeg'));
                var trimBlack = (dataURItoBlob(trimCanvas(img, [0,0,0], 10, 10).toDataURL('image/jpeg'))).size;
                console.log("[%i] size: %i bytes", curp, ba[curp].size);
                console.log("[B%i] size: %i bytes", curp, trimBlack);
                if(ba[curp].size < 20000 && trimBlack < 1000 && tmpS < 5) {
                    console.log("[%i] too small(< 20000 bytes), retrying %i times for capture canvas", curp, tmpS+1);
                    tmpS++;
                } else if(trimBlack < 1000) {
                    console.log("[B%i] too small(< 1000 bytes), retrying %i times for capture canvas", curp, tmpS+1);
                    tmpS++;
                } else {
                    tmpS = 0;
                    fireKey(document.getElementById('renderer'), 34);
                }
                console.groupEnd();
            } else console.log("Still loading...");
            if(curp == totp && tmpS == 0) {
                clearInterval(job);
                job = 0;
                pc.classList.toggle("start");
                DLFile();
                pc.setAttribute("data-label", '');
                obj.innerText = "BNDL";
                return console.log("completed");
            }
        },1000);
    } //Store canvas to memory
    window.onLoad = setTimeout(wait_for_canvas_loaded, 50);
})();
