import * as SonettoJS from '../modules/sonetto-js';

const createCanvas = (target, fullSize = true) => {
  const canvas = document.createElement("canvas");
  if(fullSize) {
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
  }
  target && target.appendChild(canvas);
  return canvas;
}

const canvas = createCanvas(document.body);

let blah = new SonettoJS.Vector3(0, 0, 0);