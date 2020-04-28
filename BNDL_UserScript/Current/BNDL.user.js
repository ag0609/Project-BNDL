// ==UserScript==
// @name         BNDL
// @namespace    http://sorehadame.com/
// @version      0.45
// @description  try to take copy of yours books! Book-worm!
// @author       ag0609
// @include      https://*.bookwalker.jp/*/viewer.html?*
// @require      https://stuk.github.io/jszip/dist/jszip.js
// @resource     https://stuk.github.io/jszip/dist/jszip.js
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    var img, ba, c, job;
    var [cx, cy, cw, ch] = [0, 0, 0, 0];
    var fn = "xxx";

    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '#abc123 {transition:all 1s;} #abc123.close {top:100%;left:35%} #abc123.open {top:40%;left:35%;width:30%;height:20%} #abc123.extend {top:0;left:0;width:100%;height:100%;}';
    document.getElementsByTagName('head')[0].appendChild(style);

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
    function create_btn() {
        var btn = document.createElement('div');
        btn.id = 'abc123';
        btn.style.position = 'absolute';
        btn.style.display = 'flex';
        btn.style.backgroundColor = 'grey';
        btn.style.opacity = 0.95;
        btn.style.alignItems = 'center';
        btn.classList.add('close');
        var pc = document.createElement('progress');
        pc.id = 'pb';
        pc.style.width = '100%';
        pc.style.display = 'none';
        var close_btn = document.createElement('button');
        close_btn.type = 'button';
        close_btn.style.alignSelf = 'flex-start';
        close_btn.style.backgroundColor = 'white';
        close_btn.innerText = '[x] Close';
        close_btn.onclick = function() {
            document.getElementById('abc123').classList.remove('extend');
            document.getElementById('abc123').classList.remove('open');
            document.getElementById('abc123').classList.add('close');
        };
        var btn_obj = document.createElement('button');
        btn_obj.type = 'button';
        btn_obj.id = 'abc1234';
        btn_obj.style.backgroundColor = 'white';
        btn_obj.innerText = 'Save';
        btn_obj.onclick = saveFile;
        btn.appendChild(document.createElement('br'));
        btn.appendChild(pc);
        btn.appendChild(close_btn);
        btn.appendChild(btn_obj);
        document.body.appendChild(btn);
        document.getElementById('abc123').classList.toggle('open');
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
        var pc = document.getElementById('pb');
        var phl = document.getElementById('abc123');
        fn = document.getElementsByClassName('titleText')[0].innerText;
        console.log("Title:", fn);
        if(job) {
            clearInterval(job);
            pc.style.display = 'none';
            document.getElementById('abc123').classList.remove('extend');
            obj.innerText = "Save";
            DLFile();
            return console.log('Stopped');
        }
        pc.style.display = 'block';
        pc.min = 0;
        pc.style.width = '100%';
        phl.style.display = 'flex';
        phl.style.backgroundColor = 'grey';
        phl.style.opacity = 0.95;
        document.getElementById('abc123').classList.remove('open');
        document.getElementById('abc123').classList.add('extend');
        phl.style.alignItems = 'center';
        obj.innerText = "Wait";
        var [fp, tmpS] = [0, 0];
        var totp = (document.getElementById('pageSliderCounter').innerText).split('/')[1] * 1;
        pc.max = totp;
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
                pc.value = curp;
                var img;
                img = trimCanvas(c, [255,255,255], 10, 16, [cx,cy,cw,ch]);
                //img = trimCanvas(img, [255,255,255], 20, 4, [cx,cy,cw,ch]);
                //img = trimCanvas(img, [255,255,255], 20, 2, [cx,cy,cw,ch]);
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
                pc.style.display = 'none';
                document.getElementById('abc123').classList.remove('extend');
                 document.getElementById('abc123').classList.remove('extend');
                DLFile();
                obj.innerText = "Save";
                return console.log("completed");
            }
        },1000);
    } //Store canvas to memory
    window.onLoad = setTimeout(wait_for_canvas_loaded, 50);
})();
