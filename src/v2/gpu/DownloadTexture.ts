import { Program } from './Program'
import { WaldoImageData, WaldoTexture } from '../types'

const fragShaderSource = `
  precision lowp float;

  uniform sampler2D u_texture;
  uniform vec2 u_textureDimensions;

  void main() {
    gl_FragColor = texture2D(u_texture, gl_FragCoord.xy/u_textureDimensions);
  }
`

export class DownloadTexture extends Program {
  constructor(gl: WebGLRenderingContext) {
    super(gl, fragShaderSource)
  }

  public run(texture: WaldoTexture): WaldoImageData {
    this.outputDimensions({
      w: texture.dimensions.w,
      h: texture.dimensions.h
    })

    this.render({
      u_texture: texture.texture,
      u_textureDimensions: [ texture.dimensions.w, texture.dimensions.h ]
    }, false) // Don't cleanup automaticly

    // Read output
    const pixels = new Float32Array(this.outputTexture.dimensions.w*this.outputTexture.dimensions.h*4)
    this.gl.readPixels(0, 0, this.outputTexture.dimensions.w, this.outputTexture.dimensions.h, this.gl.RGBA, this.gl.FLOAT, pixels)
    
    // Cleanup
    this.gl.deleteTexture(texture.texture)
    this.gl.deleteTexture(this.outputTexture.texture)
    this.cleanup() // Cleanup after texture readout

    return {
      data: pixels,
      width: this.outputTexture.dimensions.w,
      height: this.outputTexture.dimensions.h
    }
  }
}