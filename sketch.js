var pts = [];
var data = [];
var counter = 0;
var appSettings = [];
var isDraw = true;
var isRedrawMode = false;

// size
var scaleFactor;
var canvasWidth;
var qrZoneRectSize;
var canvasHeight;
var canvasOffsetX;

// brush
var brushSize;
var brushSizeMax;
var brushOpacity;
var brushOpacityMax;
var pressure;
var colorNum = 3;
var lineWidth;
var lineWidthMax = 5;
var swatch;
var brushMode = 0;
var brushModeSize = 2;

// bg
var circleMode = 0;

// playback
var playbackSpeed = 5;

// text
var text;

function preload(){
	var id = urlParam('portraitId');
	print(id);
	appSettings = loadJSON("assets/jsAppSettings.json");
	data = loadJSON("assets/portraitData" + id + ".json");
}
var urlParam = function(name, w){
    w = w || window;
    var rx = new RegExp('[\&|\?]'+name+'=([^\&\#]+)'),
        val = w.location.search.match(rx);
    return !val ? '':val[1];
}
// setup
function setup(){
   	createCanvas( windowWidth, windowHeight );
   	var mode = urlParam('mode');
	console.log(mode);
   	if(mode == 'redraw'){
   		isRedrawMode = true;
   	}
   	
   	// canvas
   	calcScaleFactor();
	calcCanvasSize();

	// brush
	setupBrush();
	clearPts();

	background(255);
	generateSwatch();

	// text 
	text = createDiv('Tap or click anywhere to redraw the portrait');
  	text.position(10, windowHeight-20);
}
function resetDrawing(){
	clear();
	clearPts();
	generateSwatch();
	counter = 0;
	isDraw = true;
	lineWidthMax = random(4, 10);
	brushMode = parseInt(random(brushModeSize));
	console.log(brushMode);
}
function generateSwatch(){
	var step = 255/4;

	var ranges = {
		c1:	[step*3, step*4],
		c2: [step*2, step*3],
		c3: [step, step*2],
		c4: [0, step]
	};
	swatch = [
		color(random(100, 255), random(50, 255), random(50, 255)),
		color(random(0, 255), random(0, 255), random(0, 255)),
		color(random(0, 255), random(0, 255), random(0, 255)),
		color(random(0, 120), random(0, 120), random(0, 120)),
	];
}
function getRandom(value){
	return random(value[0], value[1]);

}
function setupBrush(){
	brushSizeMax = appSettings[0]['brushSizeMax']*scaleFactor;
	brushOpacityMax = appSettings[0]['brushOpacityMax']*1.5;
}
function calcCanvasSize(){
	canvasHeight = windowHeight;
	canvasWidth = scaleFactor*appSettings[0]['canvasSize']['width'];
	canvasOffsetX = (windowWidth - canvasWidth)/2;
}
function calcScaleFactor(){
	qrZoneRectSize = appSettings[0]['qrZoneRectSize']
	scaleFactor = windowHeight/(appSettings[0]['canvasSize']['height'] - qrZoneRectSize);
	console.log(scaleFactor);
}
// update
function draw(){
	// draw faster
	for(var i = 0; i < playbackSpeed; i++){	
		if(isDraw){
			updateBrush();	
		} 
		updateCounter();
	}
	drawCircles();
}
function drawCircles(){
	var border = 100;
	var center = createVector(windowWidth/2, windowHeight/2);
	var pos = createVector(random(windowWidth), random(windowHeight));
	var dist = pos.dist(center);
	var radius = windowHeight/3;
	var size = map(dist, radius, windowHeight, 0, 30*scaleFactor);
	if(dist > radius){
		noStroke();
		var c = swatch[parseInt(random(0, 4))]; 
		fill(c.levels[0], c.levels[1], c.levels[2], random(0, 255));
		ellipse(pos.x, pos.y, size, size);
	}
}
function updateCounter(){
	// counter
	counter++;
	if(counter > Object.keys(data['frames']).length-1){
		counter = 0;
		if(isRedrawMode){
			resetDrawing();
		}else{
			isDraw = false;
		}
	}
}
function updateBrush(){
	if(data['frames'][counter]['click'] == true){
		clearPts();
	}

	// draw
	var x = toScreenX(data['frames'][counter]['x']);
	var y = toScreenY(data['frames'][counter]['y']);
	drawBrush(x, y);

	// set parameters
	pressure = data['frames'][counter]['pressure'];
	if(data['frames'][counter]['colorNum'] != undefined ){
		colorNum = data['frames'][counter]['colorNum'];
	}
	if(data['frames'][counter]['pressure']!=undefined){
		pressure = data['frames'][counter]['pressure']
	}else{
		pressure = 0.2;
	}
	brushSize = brushSizeMax*pressure;
	brushOpacity = brushOpacityMax*pressure;
	lineWidth = lineWidthMax*pressure;
}
function drawBrush(x, y){
	var mouseV = createVector(x, y);
	pts.push(createVector(x, y));
	var color = swatch[colorNum];
	
	switch(brushMode){
		case 0:
			brushModeLines(x, y, mouseV, color);
			break;
		case 1:
			brushModeTriangles(x, y, mouseV, color);
			break;
		default:
			brushModeLines(x, y, mouseV, color);
			break;
	} 	
}
function brushModeTriangles(x, y, mouseV, color){
 	strokeWeight(lineWidth);
	fill(color.levels[0], color.levels[1], color.levels[2], brushOpacity);
	noStroke();
	for(var i = 0; i < pts.length; i++){
		if (mouseV.dist(pts[i])/brushSize < random(0.4)) {
			
				var p1_i = Math.max(0, i - parseInt(random(10)) );
				var p1 = pts[p1_i];
				var p2 = pts[i];
				var p3 = mouseV;
				triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
			
		}
	}

}
function brushModeLines(x, y, mouseV, color){
 	strokeWeight(lineWidth);
	stroke(color.levels[0], color.levels[1], color.levels[2], brushOpacity);
	
	for(var i = 0; i < pts.length; i++){
		if (mouseV.dist(pts[i])/brushSize < random(0.4)) {
	  		line(pts[i].x, pts[i].y, mouseV.x, mouseV.y);
		}
	}
}
function toScreenX(value){
	return value*scaleFactor+canvasOffsetX;
}
function toScreenY(value){
	return value*scaleFactor;
}
function clearPts() {
	pts =[];
}
// events
function mousePressed(){
	resetDrawing();
}
function mouseReleased(){
	clearPts();
}
function keyPressed(){
	if (key == ' ') clearPts();
}
function windowResized(){
    resizeCanvas( windowWidth, windowHeight );
    calcScaleFactor();
	calcCanvasSize();
    setupBrush();
    resetDrawing()
}