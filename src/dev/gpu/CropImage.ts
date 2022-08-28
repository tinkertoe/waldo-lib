import { createTexture, drawBufferInfo, setUniforms } from 'twgl.js'
import { Program } from './Program'
import { resizeContext, imageDataToTexture, commonTextureOptions } from './utils'
import { Dimensions, Region, WaldoImageData, WaldoTexture } from '../types'

import { readFileSync } from 'fs'
import { join as joinPaths } from 'path'
const fragShaderSource = readFileSync(joinPaths(__dirname, './shaders/cropImage.fs'), 'utf8')

export class CropImage extends Program {
  constructor(gl: WebGLRenderingContext) {
    super(gl, fragShaderSource)
  }

  public run(imageData: WaldoImageData, region: Region): WaldoTexture {
    this.outputDimensions({
      w: Math.floor(region.dimensions.w),
      h: Math.floor(region.dimensions.h)
    })

    // Create input texture
    const image = imageDataToTexture(this.gl, imageData)

    this.render({
      u_inputTexture: image.texture,
      u_inputDimensions: [ image.dimensions.w, image.dimensions.h ],
      u_cropOrigin: [ region.origin.x, region.origin.y ],
    })
    
    // Cleanup
    this.gl.deleteTexture(image.texture)

    return this.outputTexture
  }
}