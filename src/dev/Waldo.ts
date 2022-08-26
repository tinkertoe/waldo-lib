import WebGL from 'gl'
import { createWaldoTexture, chunk } from './gpu/utils'
import { AverageSimilarities } from './gpu/AverageSimilarities'
import { ComputeSimilarities } from './gpu/ComputeSimilarities'
import { image2 as imageData, template2 as templateData } from './sampleData'

export class Waldo {
  private gl: WebGLRenderingContext
  private computeSimilarities: ComputeSimilarities
  private averageSimilarities: AverageSimilarities

  constructor() {
    this.gl = WebGL(1, 1, {
      depth: false,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false
    })
    this.computeSimilarities = new ComputeSimilarities(this.gl)
    this.averageSimilarities = new AverageSimilarities(this.gl)
  }

  public test() {
    // Create textures
    const image = createWaldoTexture(this.gl, imageData)
    const template = createWaldoTexture(this.gl, templateData)

    const chunks = chunk(image.dimensions, template.dimensions, this.gl.MAX_TEXTURE_SIZE)

    chunks.forEach(chunk => {
      chunk.computeSimilaritiesResult = this.computeSimilarities.run(image, template, chunk.region)
      chunk.averageSimilaritiesResult = this.averageSimilarities.run(chunk.computeSimilaritiesResult, template.dimensions)
    })

    console.log(chunks)
  }
}