// -- CANVAS
const cvs = document.getElementById('game')
const ctx = cvs.getContext('2d')
cvs.addEventListener('click', switchState)

// -- VARIABLES
let frames = 0
const deg = 45 * (Math.PI/180)
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
const score = {
  best: parseInt(localStorage.getItem('best')) || 0,
  value: 0,
  draw() {
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#222'
    // decide where to show score
    if (state.current === state.inGame) {
      // show top middle
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
      // show best score
      ctx.fillText(this.best, 225, 228)
      ctx.strokeText(this.best, 225, 228)
    }
  },
  reset() {
    this.value = 0
  },
}

// -- LOAD SOUNDS
const die = new Audio('./audio/sfx_die.wav')
const flap = new Audio('./audio/sfx_flap.wav')
const hit = new Audio('./audio/sfx_hit.wav')
const point = new Audio('./audio/sfx_point.wav')
const swooshing = new Audio('./audio/sfx_swooshing.wav')

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

class PipePair {
  constructor(src, northPipe, southPipe, w, h, gap = 110, maxYPos = -170) {
    this.src = src
    this.northPipe = northPipe
    this.southPipe = southPipe
    this.w = w
    this.h = h
    this.gap = gap
    this.maxYPos = maxYPos
    this.position = []
  }
  draw() {
    for (const i in this.position) {
      const p = this.position[i]
      const topYPos = p.y
      const bottomYPos = p.y + this.h + p.gap
      ctx.drawImage(this.src, this.northPipe.sX, this.northPipe.sY, this.w, this.h, p.x, topYPos, this.w, this.h)
      ctx.drawImage(this.src, this.southPipe.sX, this.southPipe.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h)
    }
  }
  update() {
    if (state.current !== state.inGame) return
    if ((frames % 100) === 0) {
      // adds new pipe to postion array which comes from the right
      // and its random gaps
      this.position = this.position.concat({
        x: cvs.width,
        y: this.maxYPos * (Math.random() + 1),
        gap: this.gap * (Math.random() + 1)
      })
    }
    for (const i in this.position) {
      const p = this.position[i]
      const bottomYPos = p.y + this.h + p.gap
      // move pipe left
      p.x -= 2
      // remove pipe from positions array and manage the score
      if (p.x + this.w <= 0) {
        this.position.shift()
        score.value++
        point.play()
        score.best = Math.max(score.value, score.best)
        localStorage.setItem('best', score.best)
      }
      // detect collisions
      const birdMouth = bird.x + bird.r
      const birdScalp = bird.y - bird.r
      const birdChest = bird.y + bird.r
      const birdWings = bird.x - bird.r
      // north pipe
      if (birdMouth > p.x && birdWings < (p.x + this.w) && birdScalp < (p.y + this.h) && birdChest > p.y ) {
        hit.play()
        state.current = state.over
        setTimeout(() => die.play(), 800)
      }
      // south pipe
      if (birdMouth > p.x && birdWings < (p.x + this.w) && birdScalp < (bottomYPos + this.h) && birdChest > bottomYPos ) {
        hit.play()
        state.current = state.over
        setTimeout(() => die.play(), 400)
      }
    }
  }
  reset() {
    this.position = []
  }
}

class Bird extends SrcImage {
  constructor(src, animation, w, h, x, y, r, gravity = 0.14, jump = 3) {
    super(src, w, h, x, y)
    this.animation = animation
    this.r = r
    this.birdYPos = y
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
    // change bird wing-flap angle on the draw function
    this.frame += frames % period === 0 ? 1 : 0
    // make sure the max frame is 4, then goes back to 0
    this.frame = this.frame % this.animation.length

    // bird positioning
    if (state.current === state.ready || state.current === state.intro) {
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
      // kill bird when game over
      if (state.current === state.over) {
        // faces down
        this.rotation = 90 * deg
        // stops flapping
        this.frame = 1
      }
    }
  }
  resetPosition() {
    this.position = 0
  }
}

const bird = new Bird(sprite, birdAnimation, 34, 26, 50, 150, 12)
const bg = new GameImage(sprite, 0, 0, 275, 226, 0, cvs.height - 226)
const floor = new GameImage(sprite, 276, 0, 224, 112, 0, cvs.height - 112)
const getReady = new GameImage(sprite, 0, 228, 173, 152, cvs.width/2 - 173/2, 80)
const gameOver = new GameImage(sprite, 175, 228, 225, 202, cvs.width/2 - 225/2, 90)
const pipes = new PipePair(sprite, northPipe, southPipe, 53, 400)
const platinumMedal = new GameImage(sprite, 310, 112, 46, 45, 72, 176, 46, 45)
const goldMedal = new GameImage(sprite, 310, 158, 46, 45, 72, 176, 46, 45)
const silverMedal = new GameImage(sprite, 360, 112, 46, 45, 72, 176, 46, 45)
const bronzeMedal = new GameImage(sprite, 360, 158, 46, 45, 72, 176, 46, 45)

// -- GAME CONTROL
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

function restartGame(e) {
  // gets the canvas, this is done incase the user scrolls
  const canvasRect = cvs.getBoundingClientRect()
  // remove extra pixels if any
  // remember(0,0) is canvas default rect
  const clickX = e.clientX - canvasRect.left
  const clickY = e.clientY - canvasRect.top
  // make sure user clicks only start-game to restart
  if (clickX >= startBtn.x && clickX <= (startBtn.x + startBtn.w) && clickY >= startBtn.y && clickY <= (startBtn.y + startBtn.h)) {
    bird.resetPosition()
    pipes.reset()
    score.reset()
    state.current = state.ready
  }
}

function gameIntro() {
  setTimeout(() => {
    swooshing.play()
    state.current = state.inGame
  }, 2000)
}

function switchState(e) {
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
  // bird is drawn here to make it fall into the pipe
  bird.draw()
  pipes.draw()
  floor.drawTwice()
  // draw these only if necessary
  state.current === state.ready ? getReady.draw() : null
  state.current === state.over ? gameOver.draw() : null
  score.draw()
  if (state.current === state.over && (score.value >= 0 && score.value <= 7)) bronzeMedal.draw()
  if (state.current === state.over && (score.value >= 8 && score.value <= 18)) silverMedal.draw()
  if (state.current === state.over && (score.value >= 19 && score.value <= 30)) goldMedal.draw()
  if (state.current === state.over && score.value >= 32) platinumMedal.draw()
}

// update
function update() {
  bird.update()
  floor.update()
  pipes.update()
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
