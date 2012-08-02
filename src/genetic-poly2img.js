/**
 * genetic-poly2img - a genetic programming implementation
 *
 * Copyright (c) 2012 Ajay Gopinath
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 2.1 of the License, or (at your option) any later
 * version.
 *
 * genetic-poly2img is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with genetic-poly2img; if not, see <http://www.gnu.org/licenses/>.
 * 
 * @author: Ajay Gopinath <ajgopi124(at)gmail(dot)com>
 */

var img = new Image();
img.src = "../assets/chrome-logo.png";

var IMAGE_HEIGHT = 0;
var IMAGE_WIDTH = 0;

var CANVAS_IMG = null;
var CANVAS_BEST = null;
var CANVAS_REALTIME = null;

var ctxImg = null;
var ctxBest = null;
var ctxRlt = null;
	
var ORIG_DATA = null;
var ORIG_PIXELS = null;

var draftData = null;
var draftPixels = null;

function changeSourceImage(url) {
	img.src = url;
	
	img.onload = function() {
		initImage();
		start();
	}
}

function initCanvases() {
	CANVAS_IMG = document.getElementById('canvas_img');
	CANVAS_BEST = document.getElementById('canvas_best');
	CANVAS_REALTIME = document.getElementById('canvas_realtime');
	
	ctxImg = CANVAS_IMG.getContext('2d');
	ctxBest = CANVAS_BEST.getContext('2d');
	ctxRlt = CANVAS_REALTIME.getContext('2d');
}

function initImage() {	
	IMAGE_WIDTH = img.width;
	IMAGE_HEIGHT = img.height;
	
	CANVAS_IMG.setAttribute('width', IMAGE_WIDTH);
	CANVAS_IMG.setAttribute('height', IMAGE_HEIGHT);

	CANVAS_BEST.setAttribute('width', IMAGE_WIDTH);
	CANVAS_BEST.setAttribute('height', IMAGE_HEIGHT);
	
	CANVAS_REALTIME.setAttribute('width', IMAGE_WIDTH);
	CANVAS_REALTIME.setAttribute('height', IMAGE_HEIGHT);

	ctxImg.drawImage(img, 0, 0);

	ORIG_DATA = ctxImg.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
	ORIG_PIXELS = ORIG_DATA.data;
}

function init() {
	initCanvases();
	initImage();
	start();
}

function start() {	
	draftData = ctxBest.createImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
	draftPixels = draftData.data;
	
	for(var a = 0, b = draftPixels.length; a < b; a+=4) {
        draftPixels[a]   = ORIG_PIXELS[a];    // red
        draftPixels[a+1] = ORIG_PIXELS[a+1];    // green
        draftPixels[a+2] = ORIG_PIXELS[a+2];    // blue
        draftPixels[a+3] = ORIG_PIXELS[a+3]- 128;      // alpha
	};
	
	ctxBest.putImageData(draftData, 0, 0);
	
	/*var resultBuf = new ArrayBuffer(draftData.data.length);
	var resultBuf8 = new Uint8ClampedArray(resultBuf);
	var resultBuf32 = new Uint32Array(resultBuf8);

	var sourceBuf = new ArrayBuffer(origData.data.length);
	var sourceBuf8 = new Uint8ClampedArray(sourceBuf);
	var sourceBuf32 = new Uint32Array(sourceBuf8);
	
	for (var y = 0; y < IMAGE_HEIGHT; ++y) {
	    for (var x = 0; x < IMAGE_WIDTH; ++x) {
	    	  var index = (y * IMAGE_WIDTH + x);
	    	  alert(sourceBuf32[index]);
	          resultBuf32[index] = sourceBuf32[index];
	    }
	}

	draftData.data.set(resultBuf8);

	
	*/

}

window.onload = function() {
	init();
}
