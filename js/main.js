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

document.addEventListener('DOMContentLoaded', init);

async function init() {
  document.addEventListener('keyup', e => {
    console.log('keyup :>> ', e);
  });

  const canvas = document.getElementById('canvas');
  canvas.width = CANVAS_SIZE.width;
  canvas.height = CANVAS_SIZE.height;
  canvas.style.width = CANVAS_SIZE.width;
  canvas.style.height = CANVAS_SIZE.height;

  try {
    const images = await allLoadImgPromise(IMG_URL_LIST);
    console.log('images :>> ', images);
    
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * すべての画像読み込み
 * @param {string[]} urlList
 * @return {Promise<img>} 
 */
async function allLoadImgPromise(urlList) {
  return await Promise.all(urlList.map(url => loadImgPromise(url)));
}

/**
 * 画像読み込み
 * @param {string} url
 * @return {promise<img>}
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