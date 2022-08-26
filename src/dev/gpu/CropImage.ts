import { drawBufferInfo, setUniforms } from 'twgl.js'
import { Program } from './Program'
import { resizeContext, createWaldoTexture } from './utils'
import { Region, WaldoImageData } from '../types'

import { readFileSync } from 'fs'
import { join as joinPaths } from 'path'
const fragShaderSource = readFileSync(joinPaths(__dirname, './shaders/cropImage.fs'), 'utf8')

export class CropImage extends Program {
  constructor(gl: WebGLRenderingContext) {
    super(gl, fragShaderSource)
  }

  public run(imageData: WaldoImageData, region: Region): WaldoImageData {
    this.gl.useProgram(this.programInfo.program)

    const [ outputWidth, outputHeight ] = [
      Math.floor(region.dimensions.w),
      Math.floor(region.dimensions.h)
    ]

    resizeContext(this.gl, outputWidth, outputHeight)

    // Create input texture
    const image = createWaldoTexture(this.gl, imageData)

    // Set shader inputs
    setUniforms(this.programInfo, {
      u_inputTexture: image.texture,
      u_inputDimensions: [ image.dimensions.w, image.dimensions.h ],
      u_cropOrigin: [ region.origin.x, region.origin.y ],
    })

    // Render
    drawBufferInfo(this.gl, this.bufferInfo)

    // Read output
    let pixels = new Uint8Array(outputWidth*outputHeight*4)
    this.gl.readPixels(0, 0, outputWidth, outputHeight, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels)
    const clampedPixels = new Uint8ClampedArray(pixels)
    
    // Cleanup
    this.gl.deleteTexture(image.texture)
    this.gl.useProgram(null)
    resizeContext(this.gl, 0, 0)
    pixels = new Uint8Array(0)

    return {
      data: clampedPixels,
      width: outputWidth,
      height: outputHeight
    }
  }
}