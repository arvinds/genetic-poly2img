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
img.src = "../assets/chrome-logo.png"; //"../assets/mona-lisa.jpg"; 

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

var BEST_ORGANISM = null;
var CURR_ORGANISM = null;

var	BEST_FITNESS = 1.0;  // fitness ranges between 0.0 and 1.0. lower values indicate a higher fitness. initialized to the least fit value, and should decrease with evolution
var CURR_FITNESS = -1;

var GENERATION_COUNT = 0;
var MUTATION_LEVEL = "medium";
var MUTATION_INDEX = -1;

var EVOLVE_INTERVAL_ID = null;
var IS_EVOLVING = false;

// INITIALIZATION FUNCTIONS
function initCanvases() {
	CANVAS_IMG = document.getElementById('canvas_img');
	CANVAS_BEST = document.getElementById('canvas_best');
	CANVAS_REALTIME = document.getElementById('canvas_realtime');
	
	ctxImg = CANVAS_IMG.getContext('2d');
	ctxBest = CANVAS_BEST.getContext('2d');
	ctxRlt = CANVAS_REALTIME.getContext('2d');
}

function initImage() {
	clearCanvas(ctxImg);
	clearCanvas(ctxBest);
	clearCanvas(ctxRlt);

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

function initOrganisms() {
	BEST_ORGANISM = new Organism();
	BEST_ORGANISM.initializeRandomGenome();
	
	CURR_ORGANISM = new Organism();
	CURR_ORGANISM.initializeRandomGenome();
	
	Organism.doOrganismCopy(CURR_ORGANISM, BEST_ORGANISM);
}

function init() {
	LOG_WINDOW = document.getElementById("logWindow")
	initCanvases();
	initImage();
	initOrganisms();
}

function startEvolution() {
	IS_EVOLVING = true;
	debug("starting evolution");
	EVOLVE_INTERVAL_ID = setInterval("evolveOrganisms();", 0);
	//setInterval("drawBest();", 50);
}

function drawBest() {
	drawOrganism(BEST_ORGANISM, ctxBest);
}

function pauseEvolution() {
	IS_EVOLVING = false;	
	debug("pausing evolution with best fitness " + BEST_FITNESS);
	clearInterval(EVOLVE_INTERVAL_ID);
}

// ALGORITHM CORE FUNCTIONS
function evolveOrganisms() {
	CURR_ORGANISM.mutate(MUTATION_LEVEL);
	drawOrganism(CURR_ORGANISM, ctxRlt);
	CURR_FITNESS = calculateFitness(CURR_ORGANISM);
	
	//debug("curr fitness " + CURR_FITNESS);
	
	if(CURR_FITNESS < BEST_FITNESS) {
		Organism.doChromosomeCopy(CURR_ORGANISM, BEST_ORGANISM, MUTATION_INDEX);

		BEST_FITNESS = CURR_FITNESS;

		drawOrganism(BEST_ORGANISM, ctxBest);

		debug("!!reached new best fitness: " + BEST_FITNESS);
	} else {
		Organism.doChromosomeCopy(BEST_ORGANISM, CURR_ORGANISM, MUTATION_INDEX);
	}
	
	if(BEST_FITNESS <= 0.05) {
		clearInterval(EVOLVE_INTERVAL_ID);
		debug("!!reached optimum fitness " + BEST_FITNESS);
		alert("!!reached optimum fitness " + BEST_FITNESS);
		return;
	}
	
	GENERATION_COUNT++;
}

function calculateFitness(organism) {
	var draftData = ctxRlt.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
	var draftPixels = draftData.data;
	
	var RANGE_MAX = (255 * 4) * (IMAGE_HEIGHT * IMAGE_WIDTH); // upper bound of difference between the current organism and the original organism (image) -- when the organisms are exactly different
	var RANGE_MIN = 0; // lower bound of difference between the current organism and the original organism (image) -- when the organisms are exactly the same
	
	var total_difference = 0; // total difference of all corresponding pixels between original organism and current organism
	for(var a = 0, b = draftPixels.length; a < b; a++) {
       total_difference += Math.abs(draftPixels[a] - ORIG_PIXELS[a]);    // difference in RGBA components of the current pixel
	};
	
	//debug("total diff: " + total_difference);
	var normalized_fitness = (((1-0) * (total_difference - RANGE_MIN)) / (RANGE_MAX - RANGE_MIN)) + 0;
	//debug("normalized fitness: " + normalized_fitness);
	
	return normalized_fitness;
}

function drawOrganism(organism, context) {
	clearCanvas(context);
	organism.drawGenome(context);
}

function drawOrganism(organism, context) {
	clearCanvas(context);
	organism.drawGenome(context);
}

function Organism() {
	this.chromosomes = [];
}

Organism.NUM_CHROMOSOMES = 50;

Organism.doOrganismCopy = function(source, dest) {
	for(var i = 0; i < Organism.NUM_CHROMOSOMES; i++) {
		var srcChrome =  source.chromosomes[i];
		var destChrome = dest.chromosomes[i];
		
		destChrome.r = srcChrome.r;
		destChrome.g = srcChrome.g;
		destChrome.b = srcChrome.b;
		destChrome.a = srcChrome.a;

		for(var j = 0; j < Chromosome.NUM_VERTICES; j++) {
			destChrome.pointsX[j] = srcChrome.pointsX[j];
			destChrome.pointsY[j] = srcChrome.pointsY[j];
		}
	}
}

Organism.doChromosomeCopy = function(source, dest, chromosomeIdx) {
		var srcChrome = source.chromosomes[chromosomeIdx];
		var destChrome = dest.chromosomes[chromosomeIdx];
		
		destChrome.r = srcChrome.r;
		destChrome.g = srcChrome.g;
		destChrome.b = srcChrome.b;
		destChrome.a = srcChrome.a;

		for(var i = 0; i < Chromosome.NUM_VERTICES; i++) {
			destChrome.pointsX[i] = srcChrome.pointsX[i];
			destChrome.pointsY[i] = srcChrome.pointsY[i];
		}
}

Organism.prototype.initializeRandomGenome = function() {
	for(var i = 0; i < Organism.NUM_CHROMOSOMES; i++) {
		this.chromosomes[i] = new Chromosome();
		this.chromosomes[i].randomizeGenes("all");
	}
}


Organism.prototype.mutate = function(mutationLevel) {
	MUTATION_INDEX = randInt(this.chromosomes.length);
	var randChromosome = this.chromosomes[MUTATION_INDEX];
	var rouletteHit = randFloat(8.0);

	if(rouletteHit < 4.0) { // 50% chance of mutating polygon color
		switch(mutationLevel) {
			case "soft":
				break;
			case "medium":
				if(rouletteHit < 1.0) {
					randChromosome.randomizeGenes("red");
				} else if(rouletteHit >= 1.0 && rouletteHit < 2.0) {
					randChromosome.randomizeGenes("green");
				} else if(rouletteHit >= 2.0 && rouletteHit < 3.0) {
					randChromosome.randomizeGenes("blue");
				} else if(rouletteHit >= 3.0) {
					randChromosome.randomizeGenes("alpha");
				} 
				break;
			case "hard":
				break;
			default:
				err("unrecognized mutation level: " + mutationLevel);
		}
	} else { // 50% chance of mutating polygon vertices
		switch(mutationLevel) {
			case "soft":
				break;
			case "medium":
				if(rouletteHit < 6.0) {
					randChromosome.randomizeGenes("pointsX");
				} else if(rouletteHit >= 6.0 && rouletteHit < 8.0){
					randChromosome.randomizeGenes("pointsY");
				}
				break;
			case "hard":
				break;
			default:
				err("unrecognized mutation level: " + mutationLevel);
		}
	}
}

Organism.prototype.drawGenome = function(context) {
	// for loop reversed for performance
	for (var i = Organism.NUM_CHROMOSOMES - 1; i >= 0; i--) {
		this.chromosomes[i].draw(context);
	};
}

function Chromosome() {
	this.pointsX = [];
	this.pointsY = [];
	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.a = 0.0;
}

Chromosome.NUM_VERTICES = 6;

Chromosome.prototype.randomizeGenes = function(genes) {
	switch(genes) {
		case "red":
			this.r = randInt(255);
			break;
		case "green":
			this.g = randInt(255);
			break;
		case "blue":
			this.b = randInt(255);
			break;
		case "alpha":
			this.a = randFloat(1.0);
			break;
		case "pointsX":
			this.pointsX = [];
			for(var i = 0; i < Chromosome.NUM_VERTICES; i++) {
				this.pointsX[i] = randInt(IMAGE_WIDTH);
			}
			break;
		case "pointsY":
			this.pointsY = [];
			for(var i = 0; i < Chromosome.NUM_VERTICES; i++) {
				this.pointsY[i] = randInt(IMAGE_HEIGHT);
			}
			break;
		case "pointsXY":
			this.pointsX = [];
			this.pointsY = [];
			for(var i = 0; i < Chromosome.NUM_VERTICES; i++) {
				this.pointsX[i] = randInt(IMAGE_WIDTH);
				this.pointsY[i] = randInt(IMAGE_HEIGHT);
			}
			break;
		case "all":
			this.r = randInt(255);
			this.g = randInt(255);
			this.b = randInt(255);
			this.a = 0.0;//randFloat(1.0);

			this.pointsX.length = [];
			this.pointsY.length = [];
			
			for(var i = 0; i < Chromosome.NUM_VERTICES; i++) {
				this.pointsX[i] = randInt(IMAGE_WIDTH);
				this.pointsY[i] = randInt(IMAGE_HEIGHT);
			}

			break;
		case "test-only":
			this.r = 255;
			this.g = 255;
			this.b = 255;
			this.a = 1.0;
			
			this.pointsX.length = [];
			this.pointsY.length = [];
			
			for(var i = 0; i < Chromosome.NUM_VERTICES; i++) {
				this.pointsX[i] = randInt(IMAGE_WIDTH);
				this.pointsY[i] = randInt(IMAGE_HEIGHT);
			}

			break;
		default: 
			err("genes to randomize not found: " + genes);
	}
}

Chromosome.prototype.draw = function(context) {
	context.fillStyle = "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
	context.beginPath();
	
	context.moveTo(this.pointsX[0], this.pointsY[0]);
	
	for (var i = 1; i < Chromosome.NUM_VERTICES; i++){
	  context.lineTo(this.pointsX[i], this.pointsY[i]);
	};
	
	context.closePath();
	context.fill();
}


// UTILITY/CONVENIENCE/OTHER functions
function clearCanvas(context) {
	context.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
}

function toggleEvolution() {
	IS_EVOLVING = !IS_EVOLVING;
	
	if(!IS_EVOLVING) {
		startPauseToggle.value = "Start evolution";
		pauseEvolution();
	} else {
		startPauseToggle.value = "Pause evolution";
		startEvolution();
	}
}

function changeSourceImage(url) {
	if(url === null || url.toString().length === 0 || url.toString().indexOf("http://", 0) === -1) {
		warn("cannot change source to invalid image: " + url);
		return;
	}
	img.src = url;
	
	img.onload = function() {
		initImage();
		initOrganisms();
		startEvolution();
	}
}

function randInt(seed) {
	return (Math.random() * seed) | 0;
}

function randFloat(seed) {
	return (Math.random() * seed);
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

// PROGRAM INITIALIZATION
window.onload = function() {
	init();
}
