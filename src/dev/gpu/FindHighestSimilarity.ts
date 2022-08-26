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
    this.gl.useProgram(this.programInfo.program)

    // Calculate output dimensions
    const outputDimensions: Dimensions = { w: 1, h: 1 }
    resizeContext(this.gl, outputDimensions.w, outputDimensions.h)

    // Setup output texture

    const framebuffer = this.gl.createFramebuffer() as WebGLFramebuffer
    const outputTexture = createTexture(this.gl, {
      ...commonTextureOptions(this.gl),
      width: outputDimensions.w,
      height: outputDimensions.h,
    })

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
    this.gl.bindTexture(this.gl.TEXTURE_2D, outputTexture)
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, outputTexture, 0) // Attatch output texture to framebuffer
    this.gl.bindTexture(this.gl.TEXTURE_2D, null) // Unbind output texture

    // Set shader inputs
    setUniforms(this.programInfo, {
      u_highestSimilarities: highestSimilarities.texture,
      u_highestSimilaritiesDimensions: [ highestSimilarities.dimensions.w, highestSimilarities.dimensions.h ]
    })

    // Render to output texture
    drawBufferInfo(this.gl, this.bufferInfo)

    // Cleanup

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null) // Unbind framebuffer
    this.gl.deleteFramebuffer(framebuffer)

    this.gl.deleteTexture(highestSimilarities.texture)
    this.gl.useProgram(null) // Unload program
    resizeContext(this.gl, 1, 1)

    return {
      texture: outputTexture,
      dimensions: outputDimensions
    }
  }
}