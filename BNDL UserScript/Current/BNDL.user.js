// ==UserScript==
// @name         BNDL
// @namespace    http://sorehadame.com/
// @version      0.35
// @description  try to take copy of yours books! Book-worm!
// @author       ag0609
// @include      https://*.bookwalker.jp/*/viewer.html?*
// @require      https://stuk.github.io/jszip/dist/jszip.js
// @resource     https://stuk.github.io/jszip/dist/jszip.js
// @run-at       document-end
// @grant        none
// ==/UserScript==

/*
0.10(15-04-2020)
-Project BNDL kickstarted

0.22(17-04-2020)
known issue
-[fixed >0.33] download image have black bar at bottom because of download bar appear when using Chrome

0.30(20/04/2020)
-Changed download method
known issue
-[fixed >0.33] only 10 downloads created in a line without any user interaction

0.33(21/04/2020)
-Change download method again, import JSzip for zipping images...(resolved black bar and downloads count restriction problems)
known issue
-Black page will show cause of non-ready canvas(set 5 seconds interval and canvas size checking for remediation)
-Zip blob link not start download(change _self location.href for remediation)

0.35(23/04/2020)
-Trim twice to define blacked pages
-Console log grouped should be easier to preview
*/


(function() {
    var img, ba, c, job;
    var [cx, cy, cw, ch] = [0, 0, 0, 0];
    var fn = "xxx";
    function pad(n, t) {
        t = t * 1 ? t * 1 : Math.max(t.length,3);
        return ('0'.repeat(99) + n).slice(t * -1);
    }
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
    function trimCanvas(canvas, color, fuzz, border, skip){
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
    function create_btn() {
        var btn = document.createElement('div');
        var btn_obj = document.createElement('button');
        btn_obj.type = 'button';
        btn_obj.id = 'abc1234';
        btn_obj.innerText = 'Save';
        btn_obj.onclick = saveFile;
        //btn.style = 'width=100%;height=100%;top=0;left=0;background-color=rgb(0,0,0)';
        btn.appendChild(btn_obj);
        document.getElementsByClassName('padding')[0].appendChild(btn);
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
            //location.href=Url;
        });
    } //Download Files
    function saveFile() {
        var obj = document.getElementById('abc1234');
        fn = document.getElementsByClassName('titleText')[0].innerText;
        console.log("Title:", fn);
        if(job) {
            clearInterval(job);
            obj.innerText = "Save";
            DLFile();
            return console.log('Stopped');
        }
        obj.innerText = "Wait";
        var [fp, tmpS] = [0, 0];
        var totp = (document.getElementById('pageSliderCounter').innerText).split('/')[1] * 1;
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
                obj.innerText = "Stop("+curp +"/"+ totp+")";
                var img;
                img = trimCanvas(c, [255,255,255], 20, [cx,cy,cw,ch], 16);
                //img = trimCanvas(img, [255,255,255], 20, [cx,cy,cw,ch], 4);
                //img = trimCanvas(img, [255,255,255], 20, [cx,cy,cw,ch], 2);
                if(img.width < cw || img.height < ch) {
                    img = chopCanvas(c, cx, cy, cw, ch);
                }
                ba[curp] = dataURItoBlob(img.toDataURL('image/jpeg'));
                var trimBlack = (dataURItoBlob(trimCanvas(img, [0,0,0], null, 10).toDataURL('image/jpeg'))).size;
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
                DLFile();
                obj.innerText = "Save";
                return console.log("completed");
            }
        },1000);
    } //Store canvas to memory
    window.onLoad = setTimeout(wait_for_canvas_loaded, 50);
})();
