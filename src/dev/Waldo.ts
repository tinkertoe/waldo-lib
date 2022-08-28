import WebGL from 'gl'
import { imageDataToTexture, chunk, stringifyImageData } from './gpu/utils'
import { AverageSimilarities } from './gpu/AverageSimilarities'
import { ComputeSimilarities } from './gpu/ComputeSimilarities'
import { FindHighestSimilarities } from './gpu/FindHighestSimilarities'
import { FindHighestSimilarity } from './gpu/FindHighestSimilarity'
import { DownloadTexture } from './gpu/DownloadTexture'
import { Match, Point, WaldoImageData } from './types'

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

  public highestSimilarity(imageData: WaldoImageData, templateData: WaldoImageData): Match {
    // Create textures
    const image = imageDataToTexture(this.gl, imageData)
    const template = imageDataToTexture(this.gl, templateData)

    // Split image into processing chunks that don't exceed the texture size limitation
    const chunks = chunk(image.dimensions, template.dimensions, this.gl.MAX_TEXTURE_SIZE)

    let highestSimilarityValue = 0
    let highestSimilarityLocation: Point = { x: 0, y: 0 }

    // Do processing for every chunk
    chunks.forEach(chunk => {
      chunk.computeSimilaritiesResult = this.computeSimilarities.run(image, template, chunk.region)
      chunk.averageSimilaritiesResult = this.averageSimilarities.run(chunk.computeSimilaritiesResult, template.dimensions)
      chunk.findHighestSimilaritiesResult = this.findHighestSimilarities.run(chunk.averageSimilaritiesResult)
      chunk.findHighestSimilarityResult = this.findHighestSimilarity.run(chunk.findHighestSimilaritiesResult)

      const { data } = this.downloadTexture.run(chunk.findHighestSimilarityResult)

      if (data[0] > highestSimilarityValue) {
        highestSimilarityValue = data[0]
        highestSimilarityLocation = {
          x: Math.floor(data[1] * chunk.region.dimensions.w + chunk.region.origin.x - 1),
          y: Math.floor(data[2] * chunk.region.dimensions.h + chunk.region.origin.y - 1)
        }
      }
    })

    return {
      location: highestSimilarityLocation,
      averageSimilarity: highestSimilarityValue
    }
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