import SourceImage from './SourceImage.js'

const die = new Audio('./audio/sfx_die.wav')
const hit = new Audio('./audio/sfx_hit.wav')
const point = new Audio('./audio/sfx_point.wav')

export default class PipePairImage extends SourceImage {
  constructor(src, northPipe, southPipe, w, h, gap = 110, maxYPosition = -170) {
    super(src, w, h)
    this.northPipe = northPipe
    this.southPipe = southPipe
    this.gap = gap
    this.maxYPosition = maxYPosition
    this.pipePositions = []
  }
  draw(ctx) {
    for (const i in this.pipePositions) {
      const currentPosition = this.pipePositions[i]
      const topYPosition = currentPosition.y
      const bottomYPosition = currentPosition.y + this.h + currentPosition.gap
      ctx.drawImage(this.src, this.northPipe.sX, this.northPipe.sY, this.w, this.h, currentPosition.x, topYPosition, this.w, this.h)
      ctx.drawImage(this.src, this.southPipe.sX, this.southPipe.sY, this.w, this.h, currentPosition.x, bottomYPosition, this.w, this.h)
    }
  }
  update(state, cvs, frames, bird, score) {
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
