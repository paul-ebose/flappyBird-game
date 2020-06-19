class SourceImage {
  constructor(src, w, h, x, y) {
    this.src = src
    this.w = w
    this.h = h
    this.x = x
    this.y = y
  }
}

class GameImage extends SourceImage {
  constructor(src, sX, sY, w, h, x, y) {
    super(src,w,h,x,y)
    this.sX = sX
    this.sY = sY
    this.PosX = 2
  }
  draw() {
    ctx.drawImage(this.src, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
  }
  drawTwice() {
    ctx.drawImage(this.src, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
    ctx.drawImage(this.src, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
  }
  update() {
    if (state.current === state.inGame) this.x = (this.x - this.PosX) % (this.w/2)
  }
}

class PipePairImage extends SourceImage {
  constructor(src, northPipe, southPipe, w, h, gap = 110, maxYPosition = -170) {
    super(src, w, h)
    this.northPipe = northPipe
    this.southPipe = southPipe
    this.gap = gap
    this.maxYPosition = maxYPosition
    this.pipePositions = []
  }
  draw() {
    for (const i in this.pipePositions) {
      const currentPosition = this.pipePositions[i]
      const topYPosition = currentPosition.y
      const bottomYPosition = currentPosition.y + this.h + currentPosition.gap
      ctx.drawImage(this.src, this.northPipe.sX, this.northPipe.sY, this.w, this.h, currentPosition.x, topYPosition, this.w, this.h)
      ctx.drawImage(this.src, this.southPipe.sX, this.southPipe.sY, this.w, this.h, currentPosition.x, bottomYPosition, this.w, this.h)
    }
  }
  update() {
    if (state.current !== state.inGame) return
    if ((frames % 100) === 0) {
      this.pipePositions = this.pipePositions.concat({
        x: cvs.width,
        y: this.maxYPosition * (Math.random() + 1),
        gap: this.gap * (Math.random() + 1),
      })
    }
    for (const i in this.pipePositions) {
      const currentPosition = this.pipePositions[i]
      const topYPosition = currentPosition.y
      const bottomYPosition = currentPosition.y + this.h + currentPosition.gap
      currentPosition.x -= 2
      if (currentPosition.x + this.w <= 0) {
        this.pipePositions.shift()
        score.value++
        point.play()
        score.best = Math.max(score.value, score.best)
        localStorage.setItem('best', score.best)
      }
      const birdLips = bird.x + bird.r
      const birdScalp = bird.y - bird.r
      const birdChest = bird.y + bird.r
      const birdWings = bird.x - bird.r
      if (birdLips > currentPosition.x && birdWings < (currentPosition.x + this.w) && birdScalp < (topYPosition + this.h) && birdChest > topYPosition ) {
        hit.play()
        state.current = state.over
        setTimeout(() => die.play(), 800)
      }
      if (birdLips > currentPosition.x && birdWings < (currentPosition.x + this.w) && birdScalp < (bottomYPosition + this.h) && birdChest > bottomYPosition ) {
        hit.play()
        state.current = state.over
        setTimeout(() => die.play(), 400)
      }
    }
  }
  reset() {
    this.pipePositions = []
  }
}

class BirdImage extends SourceImage {
  constructor(src, animation, w, h, x, y, r, gravity = 0.14, jump = 3) {
    super(src, w, h, x, y)
    this.animation = animation
    this.r = r
    this.birdYPos = y
    this.frame = 0
    this.birdYPosition = 0
    this.rotation = 0 * DEGREE
    this.gravity = gravity
    this.jump = jump
  }
  draw() {
    const bird = this.animation[this.frame]
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)
    ctx.drawImage(this.src, bird.sX, bird.sY, this.w, this.h, -this.w/2, -this.h/2, this.w, this.h)
    ctx.restore()
  }
  flap() {
    this.birdYPosition = -this.jump
  }
  update() {
    const wingSpeed = state.current === state.ready ? 10 : 5
    this.frame += frames % wingSpeed === 0 ? 1 : 0
    this.frame = this.frame % this.animation.length

    if (state.current === state.ready || state.current === state.intro) {
      this.y = this.birdYPos
      this.rotation = 0
    } else {
      this.birdYPosition += this.gravity
      this.y += this.birdYPosition

      if ((this.y + this.h/2) >= (cvs.height - floor.h))
        this.y = (cvs.height - floor.h) - this.h/2

      if (this.birdYPosition >= this.jump)
        this.y >= 355 ? this.rotation = 0 : this.rotation = 0.5 * DEGREE
      else this.rotation = 7.7 * DEGREE

      if (state.current === state.over) {
        this.rotation = 90 * DEGREE
        this.frame = 1
      }
    }
  }
  resetPosition() {
    this.birdYPosition = 0
  }
}

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
    }
    else if (state.current === state.over) {
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

/**
 * ------------------------------------------
 *         REAL CODE STARTS HERE
 * ------------------------------------------
 */

const cvs = document.getElementById('game')
const ctx = cvs.getContext('2d')
cvs.addEventListener('click', handleClick)

let frames = 0
const DEGREE = 45 * (Math.PI/180)
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

const die = new Audio('./audio/sfx_die.wav')
const flap = new Audio('./audio/sfx_flap.wav')
const hit = new Audio('./audio/sfx_hit.wav')
const point = new Audio('./audio/sfx_point.wav')
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
  bg.drawTwice()
  bird.draw()
  pipes.draw()
  floor.drawTwice()
  state.current === state.ready ? getReady.draw() : null
  state.current === state.over ? gameOver.draw() : null
  score.draw()
  if (state.current === state.over && (score.value >= 0 && score.value <= 9)) bronzeMedal.draw()
  if (state.current === state.over && (score.value >= 10 && score.value <= 22)) silverMedal.draw()
  if (state.current === state.over && (score.value >= 23 && score.value <= 44)) goldMedal.draw()
  if (state.current === state.over && score.value >= 45) platinumMedal.draw()
}

function update() {
  bird.update()
  floor.update()
  pipes.update()
}

function loop() {
  update()
  draw()
  frames++
  requestAnimationFrame(loop)
}

loop()
