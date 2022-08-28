import WebGL from 'gl'
import { imageDataToTexture, chunk, stringifyImageData } from './gpu/utils'
import { AverageSimilarities } from './gpu/AverageSimilarities'
import { ComputeSimilarities } from './gpu/ComputeSimilarities'
import { FindHighestSimilarities } from './gpu/FindHighestSimilarities'
import { FindHighestSimilarity } from './gpu/FindHighestSimilarity'
import { DownloadTexture } from './gpu/DownloadTexture'
import { image2 as imageData, template2 as templateData } from './sampleData'
import { WaldoImageData } from './types'

export class Waldo {
  private gl: WebGLRenderingContext

  private computeSimilarities: ComputeSimilarities
  private averageSimilarities: AverageSimilarities
  private findHighestSimilarities: FindHighestSimilarities
  private findHighestSimilarity: FindHighestSimilarity
  
  private downloadTexture: DownloadTexture

  constructor() {
    this.gl = WebGL(1, 1, {
      depth: false,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false
    })
    this.gl.getExtension('OES_texture_float')
    
    this.computeSimilarities = new ComputeSimilarities(this.gl)
    this.averageSimilarities = new AverageSimilarities(this.gl)
    this.findHighestSimilarities = new FindHighestSimilarities(this.gl)
    this.findHighestSimilarity = new FindHighestSimilarity(this.gl)

    this.downloadTexture = new DownloadTexture(this.gl)
  }

  public test() {
    // Create textures
    const image = imageDataToTexture(this.gl, imageData)
    const template = imageDataToTexture(this.gl, templateData)

    const chunks = chunk(image.dimensions, template.dimensions, this.gl.MAX_TEXTURE_SIZE)

    chunks.forEach(chunk => {
      chunk.computeSimilaritiesResult = this.computeSimilarities.run(image, template, chunk.region)
      chunk.averageSimilaritiesResult = this.averageSimilarities.run(chunk.computeSimilaritiesResult, template.dimensions)
      chunk.findHighestSimilaritiesResult = this.findHighestSimilarities.run(chunk.averageSimilaritiesResult)
      chunk.findHighestSimilarityResult = this.findHighestSimilarity.run(chunk.findHighestSimilaritiesResult)

      // chunk.computeSimilaritiesResultDebug = this.downloadTexture.run(chunk.computeSimilaritiesResult)
      // chunk.averageSimilaritiesResultDebug = this.downloadTexture.run(chunk.averageSimilaritiesResult)
      // chunk.findHighestSimilaritiesDebug = this.downloadTexture.run(chunk.findHighestSimilaritiesResult)
      chunk.findHighestSimilarityDebug = this.downloadTexture.run(chunk.findHighestSimilarityResult)
    })

    chunks.forEach(chunk => {
      // console.log('computeSimilarities', stringifyImageData(chunk.computeSimilaritiesResultDebug as WaldoImageData))
      // console.log('averageSimilarities', stringifyImageData(chunk.averageSimilaritiesResultDebug as WaldoImageData))
      // console.log('findHighestSimilarities', stringifyImageData(chunk.findHighestSimilarityDebug as WaldoImageData))
      console.log('findHighestSimilarity', stringifyImageData(chunk.findHighestSimilarityDebug as WaldoImageData))
    })
  }

  public destroy() {
    this.computeSimilarities.destroy()
    this.averageSimilarities.destroy()
    this.findHighestSimilarities.destroy()
    this.findHighestSimilarity.destroy()
    this.downloadTexture.destroy()
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}