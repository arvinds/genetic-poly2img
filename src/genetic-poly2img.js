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

var BEST_FITNESS = -1;
var GENERATION_COUNT = -1;

var ORGANISMS_PER_GENERATION = -1;
var ORGANISM_INDEX = -1;
var CURR_ORGANISMS = null;
var ROULETTE_SELECTION = null;

var EVOLVE_INTERVAL_ID = null;
var IS_EVOLVING = false;

var CROSSOVER_PROBABILITY = 0.2;
var MUTATION_PROBABILITY = 0.3;

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

function initOrganisms() {
	BEST_FITNESS = 1.0; // fitness ranges between 0.0 and 1.0. lower values indicate a higher fitness. initialized to the least fit value, and should decrease with evolution
	GENERATION_COUNT = 0;
	ORGANISMS_PER_GENERATION = 100;
	ORGANISM_INDEX = 0;
	CURR_ORGANISMS = [];
	ROULETTE_SELECTION = [];
	
	for(var i = 0; i < ORGANISMS_PER_GENERATION; i++) {
		CURR_ORGANISMS[i] = new Organism();
		CURR_ORGANISMS[i].initializeRandomGenome();
	}
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
}

function pauseEvolution() {
	IS_EVOLVING = false;	
	debug("pausing evolution with best fitness " + BEST_FITNESS);
	clearInterval(EVOLVE_INTERVAL_ID);
}

// ALGORITHM CORE FUNCTIONS
function evolveOrganisms() {
	var currentOrganism = CURR_ORGANISMS[ORGANISM_INDEX];
	drawOrganism(currentOrganism);
	calculateFitness(currentOrganism);
	
	if(currentOrganism.normFitness < BEST_FITNESS) {
		BEST_FITNESS = currentOrganism.normFitness;
		setFittestOrganism(currentOrganism);
		debug("!!reached new best fitness: " + BEST_FITNESS);
	}
	
	if(BEST_FITNESS <= 0.25) {
		clearInterval(EVOLVE_INTERVAL_ID);
		debug("!!reached optimum fitness " + BEST_FITNESS);
		alert("!!reached optimum fitness " + BEST_FITNESS);
		return;
	}
	
	if(ORGANISM_INDEX == ORGANISMS_PER_GENERATION - 1) { // if the current index has reached the end of the array, move on to next generation 
		CURR_ORGANISMS = createNewGeneration(CURR_ORGANISMS);
		GENERATION_COUNT++;
		ORGANISM_INDEX = 0;
		debug("moving on to next generation... "+ GENERATION_COUNT);
	} else {
		ORGANISM_INDEX++;
	}
}

function calculateFitness(organism) {
	var draftData = ctxRlt.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
	var draftPixels = draftData.data;
	
	var RANGE_MAX = (255 * 4) * (IMAGE_HEIGHT * IMAGE_WIDTH); // upper bound of difference between the current Organism and the original organism (image) -- when the Organisms are exactly different
	var RANGE_MIN = 0; // lower bound of difference between the current Organism and the original Organism (image) -- when the Organisms are exactly the same
	
	var total_difference = 0; // total difference of all corresponding pixels between original Organism and current Organism
	for(var a = 0, b = draftPixels.length; a < b; a+=4) {
       total_difference += Math.abs(draftPixels[a] - ORIG_PIXELS[a]);    // difference in red component of the current pixel
       total_difference += Math.abs(draftPixels[a+1] - ORIG_PIXELS[a+1]);    // difference in green component of the current pixel
       total_difference += Math.abs(draftPixels[a+2] - ORIG_PIXELS[a+2]);    // difference in blue component of the current pixel
       total_difference += Math.abs(draftPixels[a+3] - ORIG_PIXELS[a+3]);    // difference in alpha component of the current pixel
	};
	
	//debug("total diff: " + total_difference);
	var normalized_fitness = (((1-0) * (total_difference - RANGE_MIN)) / (RANGE_MAX - RANGE_MIN)) + 0;
	//debug("normalized fitness: " + normalized_fitness);
	
	organism.fitness = total_difference;
	organism.normFitness = normalized_fitness;
	
	return normalized_fitness;
}

function drawOrganism(organism) {
	clearCanvas(ctxRlt);
	organism.drawGenome(ctxRlt);
}

function createNewGeneration(parents) { // takes an array of Organisms, the "parents", and returns a new array containing the "children" of the "parents"
	var selected_parents = []; // intermediate children ( result of roulette wheel selection)
	var children = []; // final children for next generation ( value returned )
	var totalFitness = 0;
	var roulette_mark = 0;
	
	for (var i = ORGANISMS_PER_GENERATION - 1; i >= 0; i--) {
		totalFitness += parents[i].fitness;
	};

	for(var k = ORGANISMS_PER_GENERATION - 1; k >= 0; k--) {
		var temp_sum = 0;
		roulette_mark = randInt(totalFitness);
		
		for (var j = ORGANISMS_PER_GENERATION - 1; j >= 0; j--) {
			temp_sum += parents[j].fitness;
			
			if(temp_sum > roulette_mark) {
				selected_parents[k] = parents[j];
			}
		};
		
	};
	/*for(var m = ORGANISMS_PER_GENERATION - 1; m >= 0; m--) {
		debug("selected parent: " + selected_parents[m].fitness + " " + selected_parents.length);
	};*/
	
	for(var m = 0; m < ORGANISMS_PER_GENERATION-1; m+=2) {
		//if(isToDoMutation())	
		selected_parents[m].mutate(false);
		//if(isToDoMutation())
		selected_parents[m+1].mutate(false);
		
		children[m] = selected_parents[m];
		children[m+1] = selected_parents[m+1];
	};
	
	for(var n = 0; n < ORGANISMS_PER_GENERATION-1; n++) {
		debug("children: " + children[n].fitness);
	}
	
	return children;
}

function isToDoCrossover() {
	/*var chance = randFloat(1.0);
	
	if(chance < CROSSOVER_PROBABILITY)
		return true;
	else return false;*/
	return false; 		// temporarily disbaling crossovers
}

function isToDoMutation() {
	var chance = randFloat(1.0);
	
	if(chance < MUTATION_PROBABILITY)
		return true;
	else return false;
}

function Organism() {
	this.NUM_CHROMOSOMES = 50;
	this.chromosomes = [];
	this.normFitness = 0.0;
	this.fitness = 0;
}

Organism.prototype.initializeRandomGenome = function() {
	for(var i = 0; i < this.NUM_CHROMOSOMES; i++) {
		this.chromosomes[i] = new Chromosome();
		this.chromosomes[i].mutateGenes("all", true);
	}
}

Organism.prototype.getRandomChromosome = function() {
	return this.chromosomes[randInt(this.chromosomes.length)];
}

Organism.prototype.crossOver = function(otherOrganism) { 
	return; // will implement crossover later
}

Organism.prototype.mutate = function(isHardMutate) {
	var randomGenes = ["red", "green", "blue", "alpha"];
	var randomGene = randomGenes[randInt(randomGenes.length)];
	
	this.getRandomChromosome().mutateGenes(randomGene, isHardMutate);
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
	this.a = 0.0;
}

Chromosome.prototype.handleSoftGeneMutate = function (val, isAlpha) {
		var tempVal;
		
		if(!isAlpha) {
			if(val + 2 <= 255 && val - 2 >= 0) {
				tempVal = (randFloat(1.0) > .5) ? val+2 : val-2;
			} else  {
				tempVal = val;
				if(val + 2 > 255) {
					tempVal -= 2;
				} else if(val - 2 < 0) {
					tempVal += 2;		
				}
			}
		} else {
			if(val + 0.01 <= 1.0 && val - 0.01 >= 0) {
				tempVal = (randFloat(1.0) > .5) ? val+0.01 : val-0.01;
			} else  {
				tempVal = val;
				if(val + 0.01 > 1.0) {
					tempVal -= 0.01;
				} else if(val - 0.01 < 0) {
					tempVal += 0.01;		
				}	
			}
		}
		
		return tempVal;
};
	
Chromosome.prototype.mutateGenes = function(genes, isHardMutate) {
	switch(genes) {
		case "red":
			if(isHardMutate)
				this.r = randInt(255);
			else this.r = this.handleSoftGeneMutate(this.r, false);
			break;
		case "green":
			if(isHardMutate)
				this.g = randInt(255);
			else this.g = this.handleSoftGeneMutate(this.g, false);
			break;
		case "blue":
			if(isHardMutate)
				this.b = randInt(255);
			else this.b = this.handleSoftGeneMutate(this.b, false);
			break;
		case "alpha":
			if(isHardMutate)
				this.a = randFloat(1.0);
			else this.a = this.handleSoftGeneMutate(this.a, true);
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
			this.r = randInt(255);
			this.g = randInt(255);
			this.b = randInt(255);
			this.a = randFloat(1.0);
			
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
			this.a = 0.3;
			
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
	
	context.fillStyle = "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
	
	context.beginPath();
	
	context.moveTo(this.pointsX[this.NUM_VERTICES - 1], this.pointsY[this.NUM_VERTICES - 1]);
	
	for (var i = this.NUM_VERTICES - 2; i >= 0; i--){
		context.lineTo(this.pointsX[i], this.pointsY[i]);
	};
	
	context.closePath();
	context.fill();
}


// UTILITY/CONVENIENCE/OTHER functions
function setFittestOrganism(newBestOrganism) {
	clearCanvas(ctxBest);
	newBestOrganism.drawGenome(ctxBest);
}

function clearCanvas(context){
	context.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
}

function toggleEvolution(){
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
		pauseEvolution();
		initImage();
		initOrganisms();
		IS_EVOLVING = false;
		startPauseToggle.value = "Start evolution";
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
