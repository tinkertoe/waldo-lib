import { createTexture, setUniforms, drawBufferInfo } from 'twgl.js'
import { Program } from './Program'
import { commonTextureOptions, resizeContext } from './utils'
import { WaldoTexture, Region, Dimensions } from '../types'

import { readFileSync } from 'fs'
import { join as joinPaths } from 'path'
const fragShaderSource = readFileSync(joinPaths(__dirname, './shaders/computeSimilarities.fs'), 'utf8')

export class ComputeSimilarities extends Program {
  constructor(gl: WebGLRenderingContext) {
    super(gl, fragShaderSource)
  }

  public run(image: WaldoTexture, template: WaldoTexture, processingRegion: Region): WaldoTexture {
    this.gl.useProgram(this.programInfo.program)

    // Calculate output dimensions
    const outputDimensions: Dimensions = {
      w: Math.floor(processingRegion.dimensions.w * template.dimensions.w),
      h: Math.floor(processingRegion.dimensions.h * template.dimensions.h)
    }

    resizeContext(this.gl, outputDimensions.w, outputDimensions.h)

    // Setup output texture

    const framebuffer = this.gl.createFramebuffer() as WebGLFramebuffer
    const outputTexture = createTexture(this.gl, {
      ...commonTextureOptions(this.gl),
      type: this.gl.FLOAT,
      width: outputDimensions.w,
      height: outputDimensions.h
    })

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
    this.gl.bindTexture(this.gl.TEXTURE_2D, outputTexture)
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, outputTexture, 0) // Attatch output texture to framebuffer
    this.gl.bindTexture(this.gl.TEXTURE_2D, null) // Unbind output texture


    // Set shader inputs
    setUniforms(this.programInfo, {
      u_image: image.texture,
      u_template: template.texture,
      u_imageDimensions: [ image.dimensions.w, image.dimensions.h ],
      u_templateDimensions: [ template.dimensions.w, template.dimensions.h ],
      u_processingRegionOrigin: [ processingRegion.origin.x, processingRegion.origin.y ]
    })

    // Render to output texture
    drawBufferInfo(this.gl, this.bufferInfo)

    // Cleanup

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null) // Unbind framebuffer
    this.gl.deleteFramebuffer(framebuffer)
    
    this.gl.useProgram(null) // Unload program
    resizeContext(this.gl, 1, 1)

    return {
      texture: outputTexture,
      dimensions: outputDimensions
    }
  }
}