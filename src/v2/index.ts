import WebGL from 'gl'
import * as gpu from './gpu'
import { imageDataToTexture, chunk } from './gpu/utils'
import { Chunk, Match, Point, WaldoImageData, WaldoTexture } from './types'

// Export types (weird workarround)
type _Match = Match
type _Point = Point
type _WaldoImageData = WaldoImageData
export { _Match as Match, _Point as Point, _WaldoImageData as WaldoImageData }

export class Waldo {
  private gl: WebGLRenderingContext

  private computeSimilarities: gpu.ComputeSimilarities
  private averageSimilarities: gpu.AverageSimilarities
  private findHighestSimilarities: gpu.FindHighestSimilarities
  private findHighestSimilarity: gpu.FindHighestSimilarity
  
  private downloadTexture: gpu.DownloadTexture

  constructor() {
    this.gl = WebGL(1, 1, {
      depth: false,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false
    })
    this.gl.getExtension('OES_texture_float')
    
    this.computeSimilarities = new gpu.ComputeSimilarities(this.gl)
    this.averageSimilarities = new gpu.AverageSimilarities(this.gl)
    this.findHighestSimilarities = new gpu.FindHighestSimilarities(this.gl)
    this.findHighestSimilarity = new gpu.FindHighestSimilarity(this.gl)

    this.downloadTexture = new gpu.DownloadTexture(this.gl)
  }

  private highestSimilarities(imageData: WaldoImageData, templateData: WaldoImageData): Chunk[] {
    // Create textures
    const image = imageDataToTexture(this.gl, imageData)
    const template = imageDataToTexture(this.gl, templateData)

    // Split image into processing chunks that don't exceed the texture size limitation
    const chunks = chunk(image.dimensions, template.dimensions, this.gl.MAX_TEXTURE_SIZE)

    // Do processing for every chunk
    chunks.forEach(chunk => {
      chunk.computedSimilarities = this.computeSimilarities.run(image, template, chunk.region)
      chunk.averagedSimilarities = this.averageSimilarities.run(chunk.computedSimilarities, template.dimensions)
      chunk.highestSimilarities = this.findHighestSimilarities.run(chunk.averagedSimilarities)
    })

    return chunks
  }

  public highestSimilarity(imageData: WaldoImageData, templateData: WaldoImageData): Match {
    const chunks: Chunk[] = this.highestSimilarities(imageData, templateData)

    let highestSimilarityValue = 0
    let highestSimilarityLocation: Point = { x: 0, y: 0 }

    chunks.forEach(chunk => {
      chunk.highestSimilarity = this.findHighestSimilarity.run(chunk.highestSimilarities as WaldoTexture)
      const { data } = this.downloadTexture.run(chunk.highestSimilarity)

      if (data[0] >= highestSimilarityValue) {
        highestSimilarityValue = data[0]
        highestSimilarityLocation = {
          x: Math.floor(data[1] + chunk.region.origin.x),
          y: Math.floor(data[2] + chunk.region.origin.y)
        }
      }
    })

    return {
      location: highestSimilarityLocation,
      similarity: highestSimilarityValue
    }
  }

  public filteredSimilarities(imageData: WaldoImageData, templateData: WaldoImageData, minSimilarity: number): Match[] {
    const chunks: Chunk[] = this.highestSimilarities(imageData, templateData)
    const matches: Match[] = []

    chunks.forEach(chunk => {
      const { data } = this.downloadTexture.run(chunk.highestSimilarities as WaldoTexture)

      for (let i = 0; i < data.length; i = i+4) {
        if (data[i+0] >= minSimilarity) {
          matches.push({
            similarity: data[i+0],
            location: {
              x: Math.floor(data[i+1] + chunk.region.origin.x),
              y: Math.floor(i/4       + chunk.region.origin.y)
            }
          })
        }
      }
    })

    return matches
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