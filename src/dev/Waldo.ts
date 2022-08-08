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
    this.computeSimilarities.run(
      {
        data: Uint8ClampedArray.from([
          255, 255, 255, 255,   255, 255, 255, 255,  255, 255, 255, 255,
          255, 255, 255, 255,   0, 0, 0, 0,          255, 255, 255, 255,
          255, 255, 255, 255,   255, 255, 255, 255,  255, 255, 255, 255,
        ]),
        width: 3,
        height: 3
      },
      {
        data: Uint8ClampedArray.from([
          0, 0, 0, 0
        ]),
        width: 1,
        height: 1
      }
    )
  }
}