'use strict';

document.addEventListener('DOMContentLoaded', init1);

function init1() {
  const canvas1 = document.getElementById('canvas1');
  canvas1.width = 800;
  canvas1.height = 600;

  const stage = new createjs.Stage('canvas1');
  const object = new createjs.Shape();
  object.graphics.beginFill('DarkRed');
  object.graphics.beginStroke('Blue');
  object.graphics.setStrokeStyle(10);
  object.graphics.drawCircle(100, 100, 100);
  // object.x = 100;
  // object.y = 100;
  // object.scaleY = 0.5;

  var poly = new createjs.Shape();
  poly.graphics.beginFill("DarkRed"); // 赤色で描画するように設定
  poly.graphics.drawPolyStar(300, 300, 75, 10, 0.3, -90);

  var obj = new createjs.Shape();
  obj.graphics.beginFill("Green"); // 赤色で描画するように設定
  obj.graphics.moveTo(200, 500); // (0,0)座標から描き始める
  obj.graphics.lineTo(100, 0); // (100,0)座標まで辺を描く
  obj.graphics.lineTo(0, 100); // (0,100)座標まで辺を描く
  obj.graphics.lineTo(0, 0); // (0,0)座標まで辺を描く
  stage.addChild(obj); // 表示リストに追加

  stage.addChild(object);
  stage.addChild(poly);
  stage.update();
}




const dpr = window.devicePixelRatio;
const CANVAS_SIZE = {
  width: 600,//window.innerWidth,
  height: 400//window.innerHeight
}
const IMG_URL_LIST = [
  'img/dog_akitainu.png',
  'img/dog_doberman.png',
  'img/dog_rottweiler.png',
  'img/dog_kooikerhondje.png',
  'img/shoes_32.png',
  'img/animal_bear_higuma.png',
  'img/animal_bear_panda.png',
  'img/animal_kirin.png',
  'img/animal_lion.png',
  'img/animal_panda_back.png',
  'img/animal_penguin.png',
  'img/animal_uma.png',
  'img/animal_usagi_gray.png',
  'img/animal_zou.png',
];

const imgsOnCanvas = [];

class Animal {
  constructor(img, x, y, scale, velocity) {
    this.id = null;
    this.img = img;
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.velocity = velocity;
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

// document.addEventListener('DOMContentLoaded', init);

async function init() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
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

/**
 * 
 * @param {Number} min 
 * @param {Number} max 
 * @param {Integer} n 
 * @returns {Number}
 */
function random(min, max, decimalPlaces = 0) {
  if (min >= max) {
    throw new Error('"max" must be greater than "min"');
  }
  const decimalPlacesNum = 10 ** decimalPlaces;
  const newMin = min * decimalPlacesNum;
  const newMax = max * decimalPlacesNum;
  const result = Math.floor(Math.random() * (newMax + 1 - newMin) + newMin);
  return result / decimalPlacesNum;
}

function exe(images, ctx) {
  const pickedImage = images[random(0, images.length - 1)];
  const scale = random(0.3, 0.8, 1);
  console.log('scale :>> ', scale);
  const velocityBase = 3;
  imgsOnCanvas.push(
    new Animal(
      pickedImage, 
      Math.floor(Math.random() * (CANVAS_SIZE.width - pickedImage.width * scale)),
      CANVAS_SIZE.height, 
      scale,
      velocityBase / (scale)
    )
  );
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
  }
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