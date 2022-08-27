'use strict';

const dpr = window.devicePixelRatio;
const CANVAS_SIZE = {
  width: 1280,
  height: 720
}
const IMG_URL_LIST = [
  'img/dog_akitainu.png',
  'img/dog_doberman.png',
  'img/dog_rottweiler.png'
];

const imgsOnCanvas = [];

class Animal {
  constructor(img, x, y, scale) {
    this.id = null;
    this.img = img;
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.velocity = 1;
    this.isOver = false;
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   */
  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.img.width * this.scale, this.img.height * this.scale);
  }

  update() {
    console.log(`${this.name}: `, this.y);
    if(this.y < -this.img.height * this.scale) {
      console.log('上限超えた！');
      this.isOver = true;
      return;
    }
    this.y -= this.velocity;
  }

  setId(id) {
    this.id = id;
  }
}

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const canvas = document.getElementById('canvas');
  canvas.width = CANVAS_SIZE.width;
  canvas.height = CANVAS_SIZE.height;
  canvas.style.width = CANVAS_SIZE.width;
  canvas.style.height = CANVAS_SIZE.height;
  const ctx = canvas.getContext('2d');

  try {
    const images = await allLoadImgPromise(IMG_URL_LIST);
    document.addEventListener('keyup', e => {
      console.log('keyup :>> ', e);
      exe(images, ctx);
    });
  

  } catch (error) {
    console.error(error.message);
  }
}

function exe(images, ctx) {
  imgsOnCanvas.push(new Animal(images[0], 50, 300, 0.5));
  // requestAnimationFrame が二重に実行されるのを防止
  if (imgsOnCanvas.length > 1) {
    return;
  }
  window.requestAnimationFrame(() => {
    loop(ctx);
  });
}

function loop(ctx) {
  ctx.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);
  console.log('imgsOnCanvas :>> ', imgsOnCanvas);
  imgsOnCanvas.forEach((animal, index) => {
    if (animal.isOver) {
      imgsOnCanvas.splice(index, 1);
      return;
    }
    animal.update();
    animal.draw(ctx);
  });
  const id = window.requestAnimationFrame(() => {
    loop(ctx);
  });
  if (imgsOnCanvas.length === 0) {
    cancelAnimationFrame(id);
    // isNoImgOnCanvas = true;
  }
}

/**
 * 画像を配置
 * @param {HTMLImageElement} img 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} scale 
 */
function addImage(img, ctx, x, y, scale) {
  let cnt = 0;
  const draw = () => {
    ctx.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height); // clear the canvas
    ctx.drawImage(img, x, y + -cnt, img.width * scale, img.height * scale);
    cnt++;
    console.log('cnt :>> ', cnt);
    window.requestAnimationFrame(draw);
  }
  window.requestAnimationFrame(draw);
}

/**
 * すべての画像読み込み
 * @param {String[]} urlList
 * @return {Promise<HTMLImageElement>} 
 */
async function allLoadImgPromise(urlList) {
  return await Promise.all(urlList.map(url => loadImgPromise(url)));
}

/**
 * 画像読み込み
 * @param {string} url
 * @return {promise<HTMLImageElement>}
 */
function loadImgPromise(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.addEventListener('load', () => {
      resolve(img);
    });
    img.src = url;
  });
}