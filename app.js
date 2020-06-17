// -- GRAB CANVAS
const cvs = document.getElementById('game')
const ctx = cvs.getContext('2d')

// -- VARIABLES
let frames = 0

// -- LOAD IMAGES
class GameImage {
  constructor(src, sX, sY, w, h, dX, dY) {
    this.src = src
    this.sX = sX
    this.sY = sY
    this.w = w
    this.h = h
    this.dX = dX
    this.dY = dY
  }
  draw() {
    ctx.drawImage(this.src, this.sX, this.sY, this.w, this.h, this.dX, this.dY, this.w, this.h)
  }
  drawTwice() {
    ctx.drawImage(this.src, this.sX, this.sY, this.w, this.h, this.dX, this.dY, this.w, this.h)
    ctx.drawImage(this.src, this.sX, this.sY, this.w, this.h, this.dX + this.w, this.dY, this.w, this.h)
  }
}

class BirdImage {
  constructor(src, animation, w, h, dX, dY) {
    this.src = src
    this.animation = animation
    this.w = w
    this.h = h
    this.dX = dX
    this.dY = dY
    this.frame = 0
  }
  draw() {
    let bird = this.animation[this.frame]
    ctx.drawImage(this.src, bird.sX, bird.sY, this.w, this.h, this.dX - this.w/2, this.dY - this.h/2, this.w, this.h)
  }
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

// -- FUNCTIONS
// draw
function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, cvs.width, cvs.height)

  bg.drawTwice()
  floor.drawTwice()
  bird.draw()
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
