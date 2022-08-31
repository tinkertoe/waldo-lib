import { Program } from './Program'
import { WaldoTexture } from '../types'

import { readFileSync } from 'fs'
import { join as joinPaths } from 'path'
const fragShaderSource = readFileSync(joinPaths(__dirname, './shaders/findHighestSimilarities.fs'), 'utf8')

export class FindHighestSimilarities extends Program {
  constructor(gl: WebGLRenderingContext) {
    super(gl, fragShaderSource)
  }

  public run(averageSimilarites: WaldoTexture): WaldoTexture {
    this.outputDimensions({
      w: 1,
      h: averageSimilarites.dimensions.h
    })

    this.render({
      u_averageSimilarities: averageSimilarites.texture,
      u_averageSimilaritiesDimensions: [ averageSimilarites.dimensions.w, averageSimilarites.dimensions.h ]
    })

    // Cleanup
    this.gl.deleteTexture(averageSimilarites.texture)

    return this.outputTexture
  }
}