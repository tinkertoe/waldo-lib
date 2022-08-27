import { createTexture, drawBufferInfo, setUniforms } from 'twgl.js'
import { Program } from './Program'
import { commonTextureOptions, resizeContext } from './utils'
import { Dimensions, WaldoImageData, WaldoTexture } from '../types'

import { readFileSync } from 'fs'
import { join as joinPaths } from 'path'
const fragShaderSource = readFileSync(joinPaths(__dirname, './shaders/downloadTexture.fs'), 'utf8')

export class DownloadTexture extends Program {
  constructor(gl: WebGLRenderingContext) {
    super(gl, fragShaderSource)
  }

  public run(texture: WaldoTexture): WaldoImageData {
    this.gl.useProgram(this.programInfo.program)

    const outputDimensions: Dimensions = {
      w: Math.floor(texture.dimensions.w),
      h: Math.floor(texture.dimensions.h)
    }

    resizeContext(this.gl, outputDimensions.w, outputDimensions.h)

    // Setup output texture

    const framebuffer = this.gl.createFramebuffer() as WebGLFramebuffer
    const outputTexture = createTexture(this.gl, {
      ...commonTextureOptions(this.gl),
      type: this.gl.FLOAT,
      width: outputDimensions.w,
      height: outputDimensions.h,
    })

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
    this.gl.bindTexture(this.gl.TEXTURE_2D, outputTexture)
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, outputTexture, 0) // Attatch output texture to framebuffer
    this.gl.bindTexture(this.gl.TEXTURE_2D, null) // Unbind output texture

    // Set shader inputs
    setUniforms(this.programInfo, {
      u_texture: texture.texture,
      u_textureDimensions: [ texture.dimensions.w, texture.dimensions.h ]
    })

    // Render to output texture
    drawBufferInfo(this.gl, this.bufferInfo)

    // Read output

    const pixels = new Float32Array(outputDimensions.w*outputDimensions.h*4)
    this.gl.readPixels(0, 0, outputDimensions.w, outputDimensions.h, this.gl.RGBA, this.gl.FLOAT, pixels)
    
    // Cleanup

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null) // Unbind framebuffer
    this.gl.deleteFramebuffer(framebuffer)

    this.gl.deleteTexture(texture.texture)
    this.gl.deleteTexture(outputTexture)
    this.gl.useProgram(null) // Unload program
    resizeContext(this.gl, 1, 1)

    return {
      data: pixels,
      width: outputDimensions.w,
      height: outputDimensions.h
    }
  }
}