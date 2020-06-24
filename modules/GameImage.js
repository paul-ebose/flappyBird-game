import SourceImage from './SourceImage.js'

export default class GameImage extends SourceImage {
  constructor(src, sX, sY, w, h, x, y) {
    super(src,w,h,x,y)
    this.sX = sX
    this.sY = sY
    this.PosX = 2
  }
  draw(ctx) {
    ctx.drawImage(this.src, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
  }
  drawTwice(ctx) {
    ctx.drawImage(this.src, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
    ctx.drawImage(this.src, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
  }
  update(state) {
    if (state.current === state.inGame) this.x = (this.x - this.PosX) % (this.w/2)
  }
}
