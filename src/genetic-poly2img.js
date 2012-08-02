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

var NUM_ORGANISMS = 50;
var NUM_VERTICES = 6;

var LOG_WINDOW = document.getElementById("logWindow");

function changeSourceImage(url) {
	if(url === null || url.toString().length === 0 || url.toString().indexOf("http://", 0) === -1) {
		warn("cannot change source to invalid image: " + url);
		return;
	}
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
	ctxImg.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
	ctxBest.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
	ctxRlt.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

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
	var draftData = ctxBest.createImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
	var draftPixels = draftData.data;
	
	for(var a = 0, b = draftPixels.length; a < b; a+=4) {
        draftPixels[a]   = ORIG_PIXELS[a];    // red
        draftPixels[a+1] = ORIG_PIXELS[a+1];    // green
        draftPixels[a+2] = ORIG_PIXELS[a+2];    // blue
        draftPixels[a+3] = ORIG_PIXELS[a+3]- 128;      // alpha
	};
	
	ctxBest.putImageData(draftData, 0, 0);

	var currGeneration = new Generation();
	var bestGeneration = null;
	
	currGeneration.initializeRandomOrganisms();
	currGeneration.drawOrganisms(ctxRlt);
	
	/*var bestFitness = 0.0;
	var currGenerationCount = 0;
	
	makeNewGeneration();
	evaluate();
	
	while(bestFitness <= 0.75) {
		
		currGenerationCount++;
	}*/
	
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

function setBestGeneration(bestGeneration) {
	for(var i = 0; i < NUM_ORGANISMS; i++) {
		
	}
}

function Generation() {
	this.organisms = [];
}

Generation.prototype.initializeRandomOrganisms = function() {
	for(var i = 0; i < NUM_ORGANISMS; i++) {
		this.organisms[i] = new Organism();
		this.organisms[i].randomizeAttributes("all");
	}
}

Generation.prototype.getRandomOrganism = function() {
	return organisms[Math.random() * organisms.length | 0];
}

Generation.prototype.drawOrganisms = function(context) {
	// for loop reversed for performance
	for (var i = NUM_ORGANISMS - 1; i >= 0; i--){
	  this.organisms[i].draw(context);
	};
}

function Organism() {
	this.pointsX = [];
	this.pointsY = [];
	this.r = 0;
	this.g = 0;
	this.b = 0;
}

Organism.prototype.randomizeAttributes = function(attributes) {
	switch(attributes) {
		case "r":
			this.r = (Math.random() * 255 | 0);
			break;
		case "g":
			this.g = (Math.random() * 255 | 0);
			break;
		case "b":
			this.b = (Math.random() * 255 | 0);
			break;
		case "pointsX":
			this.pointsX.length = [];
			this.pointsX[i] = (Math.random() * IMAGE_WIDTH | 0);
			break;
		case "pointsY":
			this.pointsY.length = [];
			this.pointsY[i] = (Math.random() * IMAGE_HEIGHT | 0);
			break;
		case "allPoints":
			this.pointsX.length = [];
			this.pointsY.length = [];
			this.pointsX[i] = (Math.random() * IMAGE_WIDTH | 0);
			this.pointsY[i] = (Math.random() * IMAGE_HEIGHT | 0);
			break;
		case "all":
			this.r = (Math.random() * 255 | 0);
			this.g = (Math.random() * 255 | 0);
			this.b = (Math.random() * 255 | 0);
	
			// clear the arrays
			this.pointsX.length = [];
			this.pointsY.length = [];
			
			for(var i = 0; i < NUM_VERTICES; i++) {
				this.pointsX[i] = (Math.random() * IMAGE_WIDTH | 0);
				this.pointsY[i] = (Math.random() * IMAGE_HEIGHT | 0);
			}

			break;
		default: 
			err("attributes to randomize not found: " + attribute);
	}
}

Organism.prototype.draw = function(context) {
	context.fillStyle = "rgba(" + this.r + "," + this.g + "," + this.b + ",0.3)";
	
	context.beginPath();
	
	context.moveTo(this.pointsX[0], this.pointsY[0]);
	
	var pointsLength = NUM_VERTICES;
	
	for (var i = 1; i < pointsLength - 1; i++){
	  context.lineTo(this.pointsX[i], this.pointsY[i]);
	};
	
	context.closePath();
	context.fill();
}


function debug(s) {
	LOG_WINDOW.value += (s + "\n");
}

function err(s) {
	LOG_WINDOW.value += ("error: " + s + "\n");
}

function warn(s) {
	LOG_WINDOW.value += ("warning: " + s + "\n");
}
window.onload = function() {
	init();
}
