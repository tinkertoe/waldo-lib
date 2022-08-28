import { createTexture, drawBufferInfo, setUniforms } from 'twgl.js'
import { Program } from './Program'
import { Dimensions, WaldoTexture } from '../types'
import { commonTextureOptions, resizeContext } from './utils'

import { readFileSync } from 'fs'
import { join as joinPaths } from 'path'
const fragShaderSource = readFileSync(joinPaths(__dirname, './shaders/findHighestSimilarity.fs'), 'utf8')

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