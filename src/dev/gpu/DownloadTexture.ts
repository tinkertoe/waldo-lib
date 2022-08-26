import { drawBufferInfo, setUniforms } from 'twgl.js'
import { Program } from './Program'
import { resizeContext } from './utils'
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

    // Set shader inputs
    setUniforms(this.programInfo, {
      u_texture: texture.texture,
      u_textureDimensions: [ texture.dimensions.w, texture.dimensions.h ]
    })

    // Render
    drawBufferInfo(this.gl, this.bufferInfo)

    // Read output

    let pixels = new Uint8Array(outputDimensions.w*outputDimensions.h*4)
    this.gl.readPixels(0, 0, outputDimensions.w, outputDimensions.h, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels)

    const clampedPixels = new Uint8ClampedArray(pixels)
    pixels = new Uint8Array(0)
    
    // Cleanup
    this.gl.deleteTexture(texture.texture)
    this.gl.useProgram(null)
    resizeContext(this.gl, 1, 1)

    return {
      data: clampedPixels,
      width: outputDimensions.w,
      height: outputDimensions.h
    }
  }
}