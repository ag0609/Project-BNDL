// ==UserScript==
// @name         Jerk on Canvas
// @namespace    https://github.com/ag0609/Project-BNDL
// @version      0.1
// @description  I am Canvas Jack, who like place jerk on canvas
// @author       Canvas Jack
// @include      https://*.bookwalker.jp/*/viewer.html?*
// @require      https://stuk.github.io/jszip/dist/jszip.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    let _$timer = 0;
    const _$canvas = [];
    const _$c_wh = {w:0, h:0};
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
    const odI = CanvasRenderingContext2D.prototype.drawImage;
    (function() {
        CanvasRenderingContext2D.prototype.drawImage = function() {
            if(arguments[0].nodeName == "CANVAS" && _$timer == 0) {
                _$c_wh.w = arguments[3];
                _$c_wh.h = arguments[4];
                _$timer = setTimeout(()=>{
                    CanvasRenderingContext2D.prototype.drawImage = odI;
                    let c = document.createElement('canvas');
                    c.width = _$c_wh.w;
                    c.height = _$c_wh.h;
                    c.ctx = c.getContext("2d");
                    for(var i in _$canvas) {
                        c.ctx.drawImage(..._$canvas[i]);
                    }
                    c.toBlob((v)=>{console.log(window.URL.createObjectURL(v))});
                }, 10);
            }
            _$canvas.push(arguments);
            //console.log("drawImage Jacked!", arguments);
            //doNewThings(_$canvas[_$canvas.length-1]);
            if(doOldThings) odI.apply(this, arguments);
        };
    }());
    const zip = new JSZip();
})();