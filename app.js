// -- CANVAS
const cvs = document.getElementById('game')
const ctx = cvs.getContext('2d')
cvs.addEventListener('click', switchState)

// -- VARIABLES
let frames = 0
const sprite = new Image()
sprite.src = './images/sprite.png'

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
  constructor(src, animation, w, h, dX, dY, gravity = 0.25, jump = 4.6) {
    super(src, w, h, dX, dY)
    this.y = dY
    this.animation = animation
    this.frame = 0
    this.position = 0
    this.gravity = gravity
    this.jump = jump
  }
  draw() {
    let bird = this.animation[this.frame]
    ctx.drawImage(this.src, bird.sX, bird.sY, this.w, this.h, this.dX - this.w/2, this.dY - this.h/2, this.w, this.h)
  }
  flap() {
    this.position = -this.jump
  }
  update() {
    // bird speed
    let period = state.current === state.ready ? 10 : 5
    // change bird wing/flap angle on the draw function
    this.frame += frames % period === 0 ? 1 : 0
    // make sure the max frame is 4, then goes back to 0
    this.frame = this.frame % this.animation.length
    // bird positioning
    if (state.current === state.ready) {
      // y is backup, (RESET)
      this.dY = this.y
    } else {
      this.position += this.gravity
      // gravity pulling down or flap pushing up
      this.dY += this.position
      // activate floor / make it solid for the bird
      if ((this.dY + this.h/2) >= (cvs.height - floor.h)) {
        this.dY = (cvs.height - floor.h) - this.h/2
      }
    }
  }
}

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
  bg.drawTwice()
  floor.drawTwice()
  // bird is drawn last to get higher z-index
  bird.draw()
  // draw these only if necessary
  state.current === state.ready ? getReady.draw() : null
  state.current === state.over ? gameOver.draw() : null
}

// update
function update() {
  bird.update()
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
// game should start like 1500ms after tapping play
