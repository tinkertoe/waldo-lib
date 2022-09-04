import { Program } from './Program'
import { imageDataToTexture } from './utils'
import { Region, WaldoImageData, WaldoTexture } from '../types'

const fragShaderSource = `
  precision lowp float;

  uniform sampler2D u_inputTexture;
  uniform vec2 u_inputDimensions;
  uniform vec2 u_cropOrigin;

  void main() {
    vec2 inputCoord = u_cropOrigin.xy + gl_FragCoord.xy;
    gl_FragColor = texture2D(u_inputTexture, inputCoord/u_inputDimensions);
  }
`

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