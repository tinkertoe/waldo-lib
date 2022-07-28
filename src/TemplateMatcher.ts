import { GPU, IKernelRunShortcut, Texture } from 'gpu.js'
import { Match, ImageData } from './types'

export class TemplateMatcher {
  private gpu: GPU
  private computeSimilarities: IKernelRunShortcut
  private computeAverageSimilarities: IKernelRunShortcut
  private computeHighestAverages: IKernelRunShortcut
  private computeSingleLocation: IKernelRunShortcut

  constructor () {
    this.gpu = new GPU()

    this.computeSimilarities = this.gpu.createKernel(function (
      imageData: number[],
      imageWidth: number,
      templateData: number[],
      templateWidth: number
    ): number {
      // Compute similarity value for every template pixel at all overlays

      // Template pixel values
      // Take steps in whole pixels (4x) and add channel offset
      const templateRed = templateData[4 * this.thread.x + 0]
      const templateGreen = templateData[4 * this.thread.x + 1]
      const templateBlue = templateData[4 * this.thread.x + 2]
    
      // Calculate coordinates for underlying pixel on image
      // Take template overlay origin and add x/y component of current template pixel
      const imageX = this.thread.y + (this.thread.x % templateWidth)
      const imageY = this.thread.z + Math.trunc(this.thread.x / templateWidth)
    
      // Coresponding image pixel values
      // Take steps in whole pixels (4x) and add channel offset
      const imageRed = imageData[4 * (imageY*imageWidth + imageX) + 0]
      const imageGreen = imageData[4 * (imageY*imageWidth + imageX) + 1]
      const imageBlue = imageData[4 * (imageY*imageWidth + imageX) + 2]
      
      // Difference => Similarity => Percentage
      const pixelDifference = (Math.abs(templateRed - imageRed) + Math.abs(templateGreen - imageGreen) + Math.abs(templateBlue - imageBlue)) / 3
      const pixelSimilarity = 255 - pixelDifference
      return pixelSimilarity / 255 * 100 // Percentage
    }, {
      dynamicOutput: true,
      pipeline: true
    })
    
    this.computeAverageSimilarities = this.gpu.createKernel(function (
      similarities: number[][][],
      similarityCount: number
    ) {
      // Compute average similarity value for each pixel on image
      let similaritySum = 0
      for (let z = 0; z < similarityCount; z++) {
        similaritySum += similarities[this.thread.y][this.thread.x][z]
      }
      return similaritySum / similarityCount
    }, {
      dynamicOutput: true,
      pipeline: true
    })

    this.computeHighestAverages = this.gpu.createKernel(function (
      averageSimilarities: number[][],
      rowLength: number
    ) {
      const y = this.thread.x
    
      let highestSimilarity = -1
      let highestSimilarityX = 0
    
      for (let x = 0; x < rowLength; x++) {
        if (averageSimilarities[y][x] > highestSimilarity) {
          highestSimilarity = averageSimilarities[y][x]
          highestSimilarityX = x
        }
      }
    
      return [highestSimilarity, highestSimilarityX]
    }, {
      dynamicOutput: true,
      pipeline: false
    })

    this.computeSingleLocation = this.gpu.createKernel(function (
      imageData: number[],
      imageWidth: number,
      templateData: number[],
      templateWidth: number,
      locationX: number,
      locationY: number
    ) {
      // Template pixel values
      // Take steps in whole pixels (4x) and add channel offset
      const templateRed = templateData[4 * this.thread.x + 0]
      const templateGreen = templateData[4 * this.thread.x + 1]
      const templateBlue = templateData[4 * this.thread.x + 2]
    
      // Calculate coordinates for underlying pixel on image
      // Take template overlay origin and add x/y component of current template pixel
      const imageX = locationX + (this.thread.x % templateWidth)
      const imageY = locationY + Math.trunc(this.thread.x / templateWidth)
    
      // Coresponding image pixel values
      // Take steps in whole pixels (4x) and add channel offset
      const imageRed = imageData[4 * (imageY*imageWidth + imageX) + 0]
      const imageGreen = imageData[4 * (imageY*imageWidth + imageX) + 1]
      const imageBlue = imageData[4 * (imageY*imageWidth + imageX) + 2]
       
      // Difference => Similarity => Percentage
      const pixelDifference = (Math.abs(templateRed - imageRed) + Math.abs(templateGreen - imageGreen) + Math.abs(templateBlue - imageBlue)) / 3
      const pixelSimilarity = 255 - pixelDifference
      return Math.round(pixelSimilarity / 255 * 100) // Percentage
    }, {
      dynamicOutput: true,
      pipeline: false
    })
  }

  private static async downloadTexture(texture: Texture) {
    return texture.toArray()
  }

  private async highestSimilarities(image: ImageData, template: ImageData) {
    this.computeSimilarities.setOutput([
      template.data.length/4, // this.thread.x: Pixels
      image.width-template.width+1, // this.thread.z: Image width (where template is overlayable)
      image.height-template.height+1 // this.thread.y: Image height (where template is overlayable)
    ])

    const similarities = this.computeSimilarities(image.data, image.width, template.data, template.width) as Texture
    const downloadedSimilarities = TemplateMatcher.downloadTexture(similarities) as Promise<number[][][]>

    this.computeAverageSimilarities.setOutput([
      image.width-template.width+1, // this.thread.y: Image width (where template is overlayable)
      image.height-template.height+1 // this.thread.x: Image height (where template is overlayable)
    ])
    const averageSimilarities = this.computeAverageSimilarities(similarities, template.data.length/4) as Texture

    this.computeHighestAverages.setOutput([
      image.height-template.height+1
    ])
    const highestAverageSimilarities = this.computeHighestAverages(averageSimilarities, image.width-template.width+1) as number[][]

    await downloadedSimilarities // make sure texture is downloaded before it is destroyed

    // Cleanup
    similarities.delete()
    averageSimilarities.delete()

    return {
      downloadedSimilarities,
      highestAverageSimilarities
    }
  }

  public async highestSimilarity(image: ImageData, template: ImageData) {
    const { downloadedSimilarities, highestAverageSimilarities } = await this.highestSimilarities(image, template)

    let highestSimilarity = -Infinity
    let highestSimilarityX = 0
    let highestSimilarityY = 0

    for (let y = 0; y < highestAverageSimilarities.length; y++) {
      if (highestAverageSimilarities[y][0] > highestSimilarity) {
        highestSimilarity = highestAverageSimilarities[y][0]
        highestSimilarityX = highestAverageSimilarities[y][1]
        highestSimilarityY = y
      }
    }

    const match: Match = {
      averageSimilarity: highestSimilarity,
      allSimilarities: (await downloadedSimilarities)[highestSimilarityY][highestSimilarityX],
      location: {
        x: highestSimilarityX,
        y: highestSimilarityY
      }
    }

    return match
  }

  public async filteredSimilarities(image: ImageData, template: ImageData, minSimilarity: number) {
    const { downloadedSimilarities, highestAverageSimilarities } = await this.highestSimilarities(image, template)

    const matches: Match[] = []

    for (let y = 0; y < highestAverageSimilarities.length; y++) {
      if (highestAverageSimilarities[y][0] > minSimilarity) {
        const x = highestAverageSimilarities[y][1]
        matches.push({
          averageSimilarity: highestAverageSimilarities[y][0],
          allSimilarities: (await downloadedSimilarities)[y][x],
          location: { x, y }
        })
      }
    }

    return matches
  }

  public async verifyMatch(image: ImageData, template: ImageData, match: Match) {
    this.computeSingleLocation.setOutput([
      template.data.length/4
    ])
    const similarities = this.computeSingleLocation(image.data, image.width, template.data, template.width, match.location.x, match.location.y) as number[]

    return ( JSON.stringify(similarities) === JSON.stringify(match.allSimilarities) )
  }

  public async destroy() {
    this.computeSimilarities.destroy(true)
    this.computeAverageSimilarities.destroy(true)
    this.computeHighestAverages.destroy(true)
    this.computeSingleLocation.destroy(true)
    this.gpu.destroy()
  }
}