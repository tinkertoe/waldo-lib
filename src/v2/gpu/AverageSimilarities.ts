import { Program } from './Program'
import { Dimensions, WaldoTexture } from '../types'

import { readFileSync } from 'node:fs'
import { join as joinPaths } from 'node:path'
const fragShaderSource = readFileSync(joinPaths(__dirname, './shaders/averageSimilarities.fs'), 'utf-8')

export class AverageSimilarities extends Program {
  constructor(gl: WebGLRenderingContext) {
    super(gl, fragShaderSource)
  }

  public run(similarities: WaldoTexture, templateSize: Dimensions): WaldoTexture {
    this.outputDimensions({
      w: Math.floor(similarities.dimensions.w / templateSize.w),
      h: Math.floor(similarities.dimensions.h / templateSize.h)
    })

    this.render({
      u_similarities: similarities.texture,
      u_similarityDimensions: [ similarities.dimensions.w, similarities.dimensions.h ],
      u_templateDimensions: [ templateSize.w, templateSize.h ]
    })

    // Cleanup
    this.gl.deleteTexture(similarities.texture)

    return this.outputTexture
  }
}