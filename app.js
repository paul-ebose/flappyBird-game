// -- CANVAS
const cvs = document.getElementById('game')
const ctx = cvs.getContext('2d')
cvs.addEventListener('click', switchState)

// -- VARIABLES
let frames = 0
const deg = 45 * (Math.PI/180)
const sprite = new Image()
sprite.src = './images/sprite.png'

const birdAnimation = [
  {sX: 276, sY: 112},
  {sX: 276, sY: 139},
  {sX: 276, sY: 164},
  {sX: 276, sY: 139},
]
const pipes = {
  top: {
    sX: 553,
    sY: 0,
  },
  bottom: {
    sX: 502,
    sY: 0,
  },
}

// -- LOAD IMAGES
class SrcImage {
  constructor(src, w, h, x, y) {
    this.src = src
    this.w = w
    this.h = h
    this.x = x
    this.y = y
  }
}

class GameImage extends SrcImage {
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
    if (state.current === state.inGame) {
      this.x = (this.x - this.PosX) % (this.w/2)
    }
  }
}

class PipeImage extends GameImage {
  constructor(src, sX, sY, w, h, x, y) {
    super(src,sX,sY,w,h,x,y)
    this.gap = 90
    this.maxYPos = -150
    this.position = []
  }
  draw() {
    ctx.drawImage(this.src, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
  }
  update() {}
}

class BirdImage extends SrcImage {
  constructor(src, animation, w, h, x, y, gravity = 0.25, jump = 4.6) {
    super(src, w, h, x, y)
    this.birdYPos = y
    this.animation = animation
    this.frame = 0
    this.position = 0
    this.rotation = 0 * deg
    this.gravity = gravity
    this.jump = jump
  }
  draw() {
    let bird = this.animation[this.frame]
    ctx.save()
    // move canvas pointer from (0,0) to bird location
    ctx.translate(this.x, this.y)
    // rotate the canvas
    ctx.rotate(this.rotation)
    // draw image but repositoned it to fix ctx.translate
    ctx.drawImage(this.src, bird.sX, bird.sY, this.w, this.h, -this.w/2, -this.h/2, this.w, this.h)
    ctx.restore()
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
      this.y = this.birdYPos
      this.rotation = 0
    } else {
      this.position += this.gravity
      // gravity pulling down or flap pushing up
      this.y += this.position
      // activate floor / make it solid for the bird
      if ((this.y + this.h/2) >= (cvs.height - floor.h)) {
        this.y = (cvs.height - floor.h) - this.h/2
      }
      // angles of bird when flying
      if (this.position >= this.jump) {
        // falling down (true-:still falling, false-:touches the floor)
        this.y >= 355 ? this.rotation = 0 : this.rotation = 0.5 * deg
      } else {
        this.rotation = 7.7 * deg
      }
    }
  }
}

const bird = new BirdImage(sprite, birdAnimation, 34, 26, 50, 150)
const bg = new GameImage(sprite, 0, 0, 275, 226, 0, cvs.height - 226)
const floor = new GameImage(sprite, 276, 0, 224, 112, 0, cvs.height - 112)
const getReady = new GameImage(sprite, 0, 228, 173, 152, cvs.width/2 - 173/2, 80)
const gameOver = new GameImage(sprite, 175, 228, 225, 202, cvs.width/2 - 225/2, 90)
const northPipe = new PipeImage(sprite, 553, 0, 53, 400, 200, -150)
const southPipe = new PipeImage(sprite, 502, 0, 53, 400, 200, 350)

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
  northPipe.draw()
  southPipe.draw()
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
  floor.update()
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
