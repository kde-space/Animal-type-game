'use strict';

const dpr = window.devicePixelRatio;
const CANVAS_SIZE = {
  width: 800, //window.innerWidth,
  height: 600 //window.innerHeight
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

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  const stage = new createjs.Stage('canvas');
  createjs.Ticker.timingMode = createjs.Ticker.RAF;

  // プリロード
  const images = await allLoadImgPromise(IMG_URL_LIST);

  window.addEventListener("resize", (event) => handleResize(event, stage));
  handleResize(null, stage);

  document.addEventListener('keyup', debounce((event) => handleKeyup(event, stage, images)), 200);

  createjs.Ticker.on('tick', () => {
    imgsOnCanvas.forEach(item => {
      item.y -= 1 * item.scale * 5;
    });
    stage.update();
  });
}

function handleKeyup(event, stage, images) {
  const pickedImage = images[random(0, images.length - 1)];
  const bmp = new createjs.Bitmap(pickedImage);
  const scale = random(0.3, 0.8, 1);

  stage.addChild(bmp);
  bmp.regX = pickedImage.width / 2;
  bmp.regY = pickedImage.height / 2;
  bmp.scale = scale;
  console.log('pickedImage.width :>> ', pickedImage.width);
  bmp.x = random(
    pickedImage.width * scale / 2,
    (stage.canvas.width / dpr) - (pickedImage.width * scale / 2)
  );
  bmp.y = (stage.canvas.height / dpr) - pickedImage.height * scale / 2 / 1.1;

  imgsOnCanvas.push(bmp);

  createjs.Tween.get(bmp)
    .to({alpha: 0.7}, 0)
    .to({
      scale: scale * 1.2,
      alpha: 1,
    }, 150)
    .to({scale: scale}, 200);  
}

// リサイズ処理
function handleResize(event, stage) {
  stage.canvas.width = window.innerWidth * dpr;
  stage.canvas.height = window.innerHeight * dpr;
  stage.scaleX = stage.scaleY = dpr;
  stage.update();
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

function exe(images, stage) {
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

function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}