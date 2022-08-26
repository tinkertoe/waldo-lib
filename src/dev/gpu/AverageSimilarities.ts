import { createTexture, setUniforms, drawBufferInfo } from 'twgl.js'
import { Program } from './Program'
import { commonTextureOptions, resizeContext } from './utils'
import { Dimensions, WaldoTexture } from '../types'

import { readFileSync } from 'fs'
import { join as joinPaths } from 'path'
const fragShaderSource = readFileSync(joinPaths(__dirname, './shaders/averageSimilarities.fs'), 'utf8')

export class AverageSimilarities extends Program {
  constructor(gl: WebGLRenderingContext) {
    super(gl, fragShaderSource)
  }

  public run(similarities: WaldoTexture, templateSize: Dimensions): WaldoTexture {
    this.gl.useProgram(this.programInfo.program)

    // Calculate output dimensions
    const [ outputWidth, outputHeight ] = [
      Math.floor(similarities.dimensions.w  / templateSize.w),
      Math.floor(similarities.dimensions.h / templateSize.h)
    ]

    resizeContext(this.gl, outputWidth, outputHeight)

    // Setup output texture

    const framebuffer = this.gl.createFramebuffer() as WebGLFramebuffer
    const outputTexture = createTexture(this.gl, {
      ...commonTextureOptions(this.gl),
      width: outputWidth,
      height: outputHeight,
    })

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
    this.gl.bindTexture(this.gl.TEXTURE_2D, outputTexture)
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, outputTexture, 0) // Attatch output texture to framebuffer
    this.gl.bindTexture(this.gl.TEXTURE_2D, null) // Unbind output texture

    // Set shader inputs
    setUniforms(this.programInfo, {
      u_similarities: similarities.texture,
      u_similarityDimensions: [ similarities.dimensions.w, similarities.dimensions.h ],
      u_templateDimensions: [ templateSize.w, templateSize.h ]
    })

    // Render to output texture
    drawBufferInfo(this.gl, this.bufferInfo)

    // Cleanup

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null) // Unbind framebuffer
    this.gl.deleteFramebuffer(framebuffer)

    this.gl.deleteTexture(similarities.texture)
    this.gl.useProgram(null) // Unload program

    return {
      texture: outputTexture,
      dimensions: {
        w: outputWidth,
        h: outputHeight
      }
    }

    // const pixels = new Uint8Array(outputWidth*outputHeight*4)
    // this.gl.readPixels(0, 0, outputWidth, outputHeight, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels)

    // let buffer = ''
    // for (let i = 0; i < pixels.length; i++) {
    //   if(i%(outputWidth*4)==0) {
    //     buffer += '\n'
    //   }
    //   if (i%4==0) {
    //     buffer += pixels[i].toString() + ', '
    //   }
    // }
    // console.log(buffer)
  }
}