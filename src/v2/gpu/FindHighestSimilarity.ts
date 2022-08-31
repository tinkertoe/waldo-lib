import { Program } from './Program'
import { WaldoTexture } from '../types'

import fs from 'fs'
import path from 'path'
const fragShaderSource = fs.readFileSync(path.join(__dirname, './shaders/findHighestSimilarity.fs'), 'utf8')

export class FindHighestSimilarity extends Program {
  constructor(gl: WebGLRenderingContext) {
    super(gl, fragShaderSource)
  }

  public run(highestSimilarities: WaldoTexture): WaldoTexture {
    this.outputDimensions({ w: 1, h: 1 })

    this.render({
      u_highestSimilarities: highestSimilarities.texture,
      u_highestSimilaritiesDimensions: [ highestSimilarities.dimensions.w, highestSimilarities.dimensions.h ]
    })

    // Cleanup
    this.gl.deleteTexture(highestSimilarities.texture)

    return this.outputTexture
  }
}