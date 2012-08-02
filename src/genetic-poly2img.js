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

var LOG_WINDOW = null;

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
	LOG_WINDOW = document.getElementById("logWindow")
	initCanvases();
	initImage();
	start();
}

function start() {	

	/*for(var a = 0, b = draftPixels.length; a < b; a+=4) {
        draftPixels[a]   = ORIG_PIXELS[a];    // red
        draftPixels[a+1] = ORIG_PIXELS[a+1];    // green
        draftPixels[a+2] = ORIG_PIXELS[a+2];    // blue
        draftPixels[a+3] = ORIG_PIXELS[a+3]- 128;      // alpha
	};
	ctxBest.putImageData(draftData, 0, 0);*/
	
	//alert("step 1");
	var currOrganism = new Organism();
	//alert("step 2");
	var bestOrganism = null;
	//alert("step 3");
	currOrganism.initializeRandomGenome();
	//alert("step 4");
	currOrganism.drawGenome(ctxRlt);
	calculateAndHandleFitness(currOrganism);
	//alert("step 5");
	//alert(calculateAndHandleFitness(currOrganism));
	//alert("step 6");
	/*var bestFitness = 0.0;
	var generationCount = 0;
	var ORGANISMS_PER_GENERATION = 100;
	
	var currGeneration = [];

	for(var i = 0; i < ORGANISMS_PER_GENERATION; i++) {
		currGeneration[i] = new Organism();
		currGeneration[i].initializeRandomGenome();
	}
	
	while(bestFitness <= 0.75) {
		setBestGeneration(currOrganism, bestOrganism);
		
		generationCount++;
		
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

function calculateAndHandleFitness(organism) {
	var draftData = ctxRlt.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
	var draftPixels = draftData.data;
	
	var RANGE_MAX = (255 * 3) * (IMAGE_HEIGHT * IMAGE_WIDTH); // upper bound of difference between the current organism and the original organism (image) -- when the organisms are exactly different
	var RANGE_MIN = 0; // lower bound of difference between the current organism and the original organism (image) -- when the organisms are exactly the same
	
	var total_difference = 0; // total difference of all corresponding pixels between original organism and current organism
	for(var a = 0, b = draftPixels.length; a < b; a+=4) {
       total_difference += Math.abs(draftPixels[a] - ORIG_PIXELS[a]);    // difference in red component of the current pixel
       total_difference += Math.abs(draftPixels[a+1] - ORIG_PIXELS[a+1]);    // difference in green component of the current pixel
       total_difference += Math.abs(draftPixels[a+2] - ORIG_PIXELS[a+2]);    // difference in blue component of the current pixel
	};
	
	debug("total diff: " + total_difference);
	
	var normalized_fitness = (((1-0) * (total_difference - RANGE_MIN)) / (RANGE_MAX - RANGE_MIN)) + 0;
	
	debug("normalized fitness: " + normalized_fitness);
	
	return normalized_fitness;
}

function setBestOrganism(bestOrganism) {
	dest = null; // clears the previous best generation
	dest.drawGenome(ctxBest);
}

function Organism() {
	this.NUM_CHROMOSOMES = 50;
	this.chromosomes = [];
	this.fitness = 0.0;
}

Organism.prototype.initializeRandomGenome = function() {
	for(var i = 0; i < this.NUM_CHROMOSOMES; i++) {
		this.chromosomes[i] = new Chromosome();
		this.chromosomes[i].randomizeGenes("all");
	}
}

Organism.prototype.getRandomChromosome = function() {
	return this.chromosomes[Math.random() * this.chromosomes.length | 0];
}

Organism.prototype.drawGenome = function(context) {
	// for loop reversed for performance
	for (var i = this.NUM_CHROMOSOMES - 1; i >= 0; i--){
	  this.chromosomes[i].draw(context);
	};
}

function Chromosome() {
	this.NUM_VERTICES = 6;
	this.pointsX = [];
	this.pointsY = [];
	this.r = 0;
	this.g = 0;
	this.b = 0;
}

Chromosome.prototype.randomizeGenes = function(genes) {
	switch(genes) {
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
			
			for(var i = 0; i < this.NUM_VERTICES; i++) {
				this.pointsX[i] = (Math.random() * IMAGE_WIDTH | 0);
				this.pointsY[i] = (Math.random() * IMAGE_HEIGHT | 0);
			}

			break;
		case "test-only":
			this.r = 255;
			this.g = 255;
			this.b = 255;
	
			// clear the arrays
			this.pointsX.length = [];
			this.pointsY.length = [];
			
			for(var i = 0; i < this.NUM_VERTICES; i++) {
				this.pointsX[i] = (Math.random() * IMAGE_WIDTH | 0);
				this.pointsY[i] = (Math.random() * IMAGE_HEIGHT | 0);
			}

			break;
		default: 
			err("genes to randomize not found: " + genes);
	}
}

Chromosome.prototype.draw = function(context) {
	context.fillStyle = "rgba(" + this.r + "," + this.g + "," + this.b + ",0.3)";
	
	context.beginPath();
	
	context.moveTo(this.pointsX[0], this.pointsY[0]);
	
	for (var i = 1; i < this.NUM_VERTICES - 1; i++){
	  context.lineTo(this.pointsX[i], this.pointsY[i]);
	};
	
	context.closePath();
	context.fill();
}


function debug(s) {
	LOG_WINDOW.value += ("debug: " + s + "\n");
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
