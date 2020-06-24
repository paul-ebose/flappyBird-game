import SourceImage from './SourceImage.js'

const DEGREE = 45 * (Math.PI/180)

export default class BirdImage extends SourceImage {
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
  draw(ctx) {
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
  update(state, cvs, frames, floor) {
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
