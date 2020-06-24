import BirdImage from './modules/BirdImage.js'
import GameImage from './modules/GameImage.js'
import PipePairImage from './modules/PipePairImage.js'

const cvs = document.getElementById('game')
const ctx = cvs.getContext('2d')
cvs.addEventListener('click', handleClick)

const score = {
  best: parseInt(localStorage.getItem('best')) || 0,
  value: 0,
  draw() {
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#222'
    if (state.current === state.inGame) {
      ctx.font = '35px Teko'
      ctx.lineWidth = 2
      ctx.fillText(this.value, cvs.width/2 - 10, 50)
      ctx.strokeText(this.value, cvs.width/2 - 10, 50)
    } else if (state.current === state.over) {
      ctx.font = '25px Teko'
      ctx.lineWidth = 1
      ctx.fillText(this.value, 225, 186)
      ctx.strokeText(this.value, 225, 186)
      ctx.fillText(this.best, 225, 228)
      ctx.strokeText(this.best, 225, 228)
    }
  },
  reset() {
    this.value = 0
  },
}

let frames = 0
const sprite = new Image()
sprite.src = './images/sprite.png'

const northPipe = { sX: 553,sY: 0 }
const southPipe = { sX: 502,sY: 0 }

const birdAnimation = [
  {sX: 276, sY: 112},
  {sX: 276, sY: 139},
  {sX: 276, sY: 164},
  {sX: 276, sY: 139},
]

const state = {
  current: 0,
  ready: 0,
  intro: 1,
  inGame: 2,
  over: 3,
}

const startBtn = {
  x: 120,
  y: 263,
  w: 83,
  h: 29,
}

const flap = new Audio('./audio/sfx_flap.wav')
const swooshing = new Audio('./audio/sfx_swooshing.wav')

const pipes = new PipePairImage(sprite, northPipe, southPipe, 53, 400)
const bird = new BirdImage(sprite, birdAnimation, 34, 26, 50, 150, 12)
const bg = new GameImage(sprite, 0, 0, 275, 226, 0, cvs.height - 226)
const floor = new GameImage(sprite, 276, 0, 224, 112, 0, cvs.height - 112)
const getReady = new GameImage(sprite, 0, 228, 173, 152, cvs.width/2 - 173/2, 80)
const gameOver = new GameImage(sprite, 175, 228, 225, 202, cvs.width/2 - 225/2, 90)
const platinumMedal = new GameImage(sprite, 310, 112, 46, 45, 72, 176, 46, 45)
const goldMedal = new GameImage(sprite, 310, 158, 46, 45, 72, 176, 46, 45)
const silverMedal = new GameImage(sprite, 360, 112, 46, 45, 72, 176, 46, 45)
const bronzeMedal = new GameImage(sprite, 360, 158, 46, 45, 72, 176, 46, 45)

function handleClick(e) {
  switch (state.current) {
    case state.ready:
      state.current = state.intro
      gameIntro()
      break
    case state.inGame:
      bird.flap()
      flap.play()
      break
    case state.over:
      restartGame(e)
      break
  }
}

function gameIntro() {
  setTimeout(() => {
    swooshing.play()
    state.current = state.inGame
  }, 2000)
}

function restartGame(e) {
  const canvasRect = cvs.getBoundingClientRect()
  const clickX = e.clientX - canvasRect.left
  const clickY = e.clientY - canvasRect.top
  if (clickX >= startBtn.x && clickX <= (startBtn.x + startBtn.w) && clickY >= startBtn.y && clickY <= (startBtn.y + startBtn.h)) {
    bird.resetPosition()
    pipes.reset()
    score.reset()
    state.current = state.ready
  }
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, cvs.width, cvs.height)
  bg.drawTwice(ctx)
  bird.draw(ctx)
  pipes.draw(ctx)
  floor.drawTwice(ctx)
  state.current === state.ready ? getReady.draw(ctx) : null
  state.current === state.over ? gameOver.draw(ctx) : null
  score.draw(ctx)
  if (state.current === state.over && (score.value >= 0 && score.value <= 9)) bronzeMedal.draw(ctx)
  if (state.current === state.over && (score.value >= 10 && score.value <= 22)) silverMedal.draw(ctx)
  if (state.current === state.over && (score.value >= 23 && score.value <= 44)) goldMedal.draw(ctx)
  if (state.current === state.over && score.value >= 45) platinumMedal.draw(ctx)
}

function update() {
  bird.update(state, cvs, frames, floor)
  floor.update(state)
  pipes.update(state, cvs, frames, bird, score)
}

function loop() {
  update()
  draw()
  frames++
  requestAnimationFrame(loop)
}

loop()
