import * as SonettoJS from '../modules/sonetto-js';

function createElementNS(name) {
	return document.createElementNS('http://www.w3.org/1999/xhtml', name);
}

const createCanvas = (target, fullSize = true) => {
  const canvas = createElementNS("canvas");
  canvas.style.display = 'block';

  if(fullSize) {
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
  }

  target && target.appendChild(canvas);
  
  return canvas;
}

const canvas = createCanvas(document.body);

const renderer = new SonettoJS.WebGLRenderer({ canvas });