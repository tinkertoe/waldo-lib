import { createTexture, drawBufferInfo, setUniforms } from 'twgl.js'
import { Program } from './Program'
import { resizeContext, createWaldoTexture, commonTextureOptions } from './utils'
import { Dimensions, Region, WaldoImageData, WaldoTexture } from '../types'

import { readFileSync } from 'fs'
import { join as joinPaths } from 'path'
const fragShaderSource = readFileSync(joinPaths(__dirname, './shaders/cropImage.fs'), 'utf8')

export class CropImage extends Program {
  constructor(gl: WebGLRenderingContext) {
    super(gl, fragShaderSource)
  }

  public run(imageData: WaldoImageData, region: Region): WaldoTexture {
    this.gl.useProgram(this.programInfo.program)

    // Calculate output dimensions
    const outputDimensions: Dimensions = {
      w: Math.floor(region.dimensions.w),
      h: Math.floor(region.dimensions.h)
    }

    resizeContext(this.gl, outputDimensions.w, outputDimensions.h)

    // Create input texture
    const image = createWaldoTexture(this.gl, imageData)

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
      u_inputTexture: image.texture,
      u_inputDimensions: [ image.dimensions.w, image.dimensions.h ],
      u_cropOrigin: [ region.origin.x, region.origin.y ],
    })

    // Render to output texture
    drawBufferInfo(this.gl, this.bufferInfo)
    
    // Cleanup

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null) // Unbind framebuffer
    this.gl.deleteFramebuffer(framebuffer)

    this.gl.deleteTexture(image.texture)
    this.gl.useProgram(null) // Unload program
    resizeContext(this.gl, 1, 1)

    return {
      texture: outputTexture,
      dimensions: outputDimensions
    }
  }
}