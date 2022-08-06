import WebGL from 'gl'
import { ComputeSimilarities } from './ComputeSimilarities'
import { OtherProgram } from './OtherProgram'

export class Waldo {
  private gl: WebGLRenderingContext
  private computeSimilarities: ComputeSimilarities
  private otherProgram: OtherProgram

  constructor() {
    this.gl = WebGL(1, 1, { depth: false })
    this.computeSimilarities = new ComputeSimilarities(this.gl)
    this.otherProgram = new OtherProgram(this.gl)
  }

  public test() {
    this.computeSimilarities.run(1000, 1000)
    this.otherProgram.run(1000, 1000)
  }
}