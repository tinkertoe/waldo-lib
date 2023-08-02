import * as gpu from './gpu/index'
import { imageDataToTexture, chunk } from './gpu/utils'
import { Chunk, Dimensions, Match, Point, WaldoImageData, WaldoTexture } from './types'

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
  private _glLocked: boolean = false

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
    this.gl.getExtension('OES_texture_float')
    
    this.computeSimilarities = new gpu.ComputeSimilarities(this.gl)
    this.averageSimilarities = new gpu.AverageSimilarities(this.gl)
    this.findHighestSimilarities = new gpu.FindHighestSimilarities(this.gl)
    this.findHighestSimilarity = new gpu.FindHighestSimilarity(this.gl)

    this.downloadTexture = new gpu.DownloadTexture(this.gl)
  }

  private lockGl(): Promise<void> {
    // Wait for unlock, then lock
    const poll = (resolve: () => void) => {
      if (!this._glLocked) {
        this._glLocked = true
        resolve()
      } else {
        // GL is locked, retrying in 10ms
        setTimeout(() => { poll(resolve) }, 10)
      }
    }
    return new Promise(poll)
  }

  private unlockGl(): void {
    this._glLocked = false
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

  public async highestSimilarity(imageData: WaldoImageData, templateData: WaldoImageData): Promise<Match> {
    await this.lockGl()

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

    this.unlockGl()

    return {
      location: highestSimilarityLocation,
      similarity: highestSimilarityValue
    }
  }

  public async filteredSimilarities(imageData: WaldoImageData, templateData: WaldoImageData, minSimilarity: number): Promise<Match[]> {
    await this.lockGl()

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

    this.unlockGl()
    return matches
  }

  public async verifyMatch(imageData: WaldoImageData, templateData: WaldoImageData, match: Match, similarityMargin: number = 0.05): Promise<boolean> {
    await this.lockGl()

    const image = imageDataToTexture(this.gl, imageData)
    const template = imageDataToTexture(this.gl, templateData)

    const chunk: Chunk = {
      region: {
        origin: {
          x: match.location.x,
          y: match.location.y
        },
        dimensions: { w: 1, h: 1 }
      }
    }

    chunk.computedSimilarities = this.computeSimilarities.run(image, template, chunk.region)
    chunk.averagedSimilarities = this.averageSimilarities.run(chunk.computedSimilarities, template.dimensions)
    const { data } = this.downloadTexture.run(chunk.averagedSimilarities)

    this.unlockGl()
  
    /*
      Check if provided match location is possible!

      Texture lookup at coordinates that are outside of the actual
      texture size return the value of the closest coordinate.
      (Texture doesn't wrap arround but is clamped to the edge)

      Without this check this function could also verify a match that is located outside of the image!
      (As long as the to be verified similarity value is the same as the acutal similarity value on the edge of the image)
    */
    const validDimensions: Dimensions = {
      w: image.dimensions.w - template.dimensions.w + 1,
      h: image.dimensions.h - template.dimensions.h + 1
    }

    if (match.location.x > validDimensions.w || match.location.y > validDimensions.h) {
      return false
    }

    // Verify match if difference between recalculated similarity and specified similarity is within 5% (default)
    return (Math.abs(data[0] - match.similarity) < similarityMargin)
  }

  public async destroy() {
    this.computeSimilarities.destroy()
    this.averageSimilarities.destroy()
    this.findHighestSimilarities.destroy()
    this.findHighestSimilarity.destroy()
    this.downloadTexture.destroy()
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
    (this.gl.canvas as HTMLCanvasElement)?.remove()
  }
}