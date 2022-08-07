import WebGL from 'gl'
import { ComputeSimilarities } from './ComputeSimilarities'

export class Waldo {
  private gl: WebGLRenderingContext
  private computeSimilarities: ComputeSimilarities

  constructor() {
    this.gl = WebGL(1, 1, { depth: false })
    this.computeSimilarities = new ComputeSimilarities(this.gl)

    console.log(this.gl.MAX_TEXTURE_SIZE)
  }

  public test() {
    this.computeSimilarities.run(10000, 10000)
  }
}