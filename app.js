// -- GRAB CANVAS
const cvs = document.getElementById('game')
const ctx = cvs.getContext('2d')

// -- VARIABLES
let frames = 0

// -- LOAD IMAGES
class SrcImage {
  constructor(src, w, h, dX, dY) {
    this.src = src
    this.w = w
    this.h = h
    this.dX = dX
    this.dY = dY
  }
}

class GameImage extends SrcImage {
  constructor(src, sX, sY, w, h, dX, dY) {
    super(src,w,h,dX,dY)
    this.sX = sX
    this.sY = sY
  }
  draw() {
    ctx.drawImage(this.src, this.sX, this.sY, this.w, this.h, this.dX, this.dY, this.w, this.h)
  }
  drawTwice() {
    ctx.drawImage(this.src, this.sX, this.sY, this.w, this.h, this.dX, this.dY, this.w, this.h)
    ctx.drawImage(this.src, this.sX, this.sY, this.w, this.h, this.dX + this.w, this.dY, this.w, this.h)
  }
}

class BirdImage extends SrcImage {
  constructor(src, animation, w, h, dX, dY) {
    super(src, w, h, dX, dY)
    this.animation = animation
    this.frame = 0
  }
  draw() {
    let bird = this.animation[this.frame]
    ctx.drawImage(this.src, bird.sX, bird.sY, this.w, this.h, this.dX - this.w/2, this.dY - this.h/2, this.w, this.h)
  }
  flap() {}
}

const sprite = new Image()
sprite.src = 'sprite.png'

const birdAnimation = [
  {sX: 276, sY: 112},
  {sX: 276, sY: 139},
  {sX: 276, sY: 164},
  {sX: 276, sY: 139},
]

const bird = new BirdImage(sprite, birdAnimation, 34, 26, 50, 150)
const bg = new GameImage(sprite, 0, 0, 275, 226, 0, cvs.height - 226)
const floor = new GameImage(sprite, 276, 0, 224, 112, 0, cvs.height - 112)
const getReady = new GameImage(sprite, 0, 228, 173, 152, cvs.width/2 - 173/2, 80)
const gameOver = new GameImage(sprite, 175, 228, 225, 202, cvs.width/2 - 225/2, 90)

// -- GAME CONTROL
const state = {
  current: 0,
  ready: 0,
  inGame: 1,
  over:2,
}

function switchState() {
  switch (state.current) {
    case state.ready:
      state.current = state.inGame
      break
    case state.inGame:
      bird.flap()
      break
    case state.over:
      state.current = state.ready
      break
    default:
      break
  }
}

// -- FUNCTIONS
// draw
function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, cvs.width, cvs.height)
  bird.draw()
  bg.drawTwice()
  floor.drawTwice()
  // draw these only if necessary
  state.current === state.ready ? getReady.draw() : null
  state.current === state.inGame ? bird.flap() : null
  state.current === state.over ? gameOver.draw() : null
}

// update
function update() {

}

// loop
function loop() {
  update()
  draw()
  frames++
  requestAnimationFrame(loop)
}

// -- START
loop()
