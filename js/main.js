'use strict';

createjs.Ticker.timingMode = createjs.Ticker.RAF;
const dpr = window.devicePixelRatio;
const CANVAS_SIZE = {
  width: 800, //window.innerWidth,
  height: 600 //window.innerHeight
}
const IMG_NAME_LIST = [
  'dog_akitainu.png',
  'dog_doberman.png',
  'dog_rottweiler.png',
  'dog_kooikerhondje.png',
  'shoes_32.png',
  'animal_bear_higuma.png',
  'animal_bear_panda.png',
  'animal_kirin.png',
  'animal_lion.png',
  'animal_panda_back.png',
  'animal_penguin.png',
  'animal_uma.png',
  'animal_usagi_gray.png',
  'animal_zou.png',
  'animal_hitsuji.png',
  'animal_hyou_panther.png',
  'animal_sai.png',
  'pet_cat_sit.png',
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
  const audio = new Audio('assets/sound/sound.mp3');
  const stage = new createjs.Stage('canvas');
  const btn = document.getElementById('mute');
  // プリロード
  const images = await allLoadImgPromise(IMG_NAME_LIST);
  window.addEventListener("resize", (event) => handleResize(event, stage));
  document.addEventListener('keyup', debounce((event) => handleKeyup(event, stage, images, audio)), 200);
  btn.addEventListener('click', (event) => {
    toggleMute(event, audio);
    event.currentTarget.blur();
  });

  createjs.Ticker.on('tick', () => {
    imgsOnCanvas.forEach(item => {
      item.y -= 1 * item.scale * 5;
    });
    stage.update();
  });
  handleResize(null, stage);
}

function handleKeyup(event, stage, images, audio) {
  const pickedImage = images[random(0, images.length - 1)];
  const bmp = new createjs.Bitmap(pickedImage);
  const scale = random(0.3, 1, 1);

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
  
  audio.currentTime = 0;
  audio.play();
  console.log('imgsOnCanvas :>> ', imgsOnCanvas);
}

function toggleMute(event, audio) {
  audio.muted = !audio.muted;
  event.currentTarget.innerHTML = `サウンド：${audio.muted ? 'OFF' : 'ON'}`; 
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
async function allLoadImgPromise(nameList) {
  return await Promise.all(nameList.map(name => loadImgPromise(`assets/img/${name}`)));
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