import WebGL from 'gl'
import { ComputeSimilarities } from './ComputeSimilarities'

export class Waldo {
  private gl: WebGLRenderingContext
  private computeSimilarities: ComputeSimilarities

  constructor() {
    this.gl = WebGL(1, 1, { depth: false })
    this.computeSimilarities = new ComputeSimilarities(this.gl)
  }

  public test() {
    this.computeSimilarities.run(2, 2)
  }
}