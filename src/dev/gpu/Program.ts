import {
  ProgramInfo,
  BufferInfo,
  createProgramInfoFromProgram,
  createBufferInfoFromArrays,
  setBuffersAndAttributes,
  createTexture,
  drawBufferInfo,
  setUniforms,
} from 'twgl.js'
import { commonTextureOptions, createProgramFromSource, resizeContext, vertShaderSource } from './utils'
import { Dimensions, WaldoTexture } from '../types'

export abstract class Program {
  protected gl: WebGLRenderingContext
  protected programInfo: ProgramInfo
  protected bufferInfo: BufferInfo
  private framebuffer?: WebGLFramebuffer
  private _outputTexture?: WaldoTexture

  constructor (gl: WebGLRenderingContext, fragShaderSource: string) {
    this.gl = gl
    this.programInfo = createProgramInfoFromProgram(gl, createProgramFromSource(gl, vertShaderSource, fragShaderSource))
    this.bufferInfo = createBufferInfoFromArrays(gl, { position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0] })
    setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo)
  }

  protected outputDimensions(d : Dimensions) {
    d = { w: Math.floor(d.w), h: Math.floor(d.h) }

    resizeContext(this.gl, d.w, d.h)

    // Delete old framebuffer if it exits
    if (this.framebuffer !== undefined) {
      this.gl.deleteFramebuffer(this.framebuffer)
    }

    // Delete old texture if it exits
    if (this._outputTexture !== undefined) {
      this.gl.deleteTexture(this._outputTexture.texture)
    }

    // Set new framebuffer
    this.framebuffer = this.gl.createFramebuffer() as WebGLFramebuffer

    // Set new output texture
    this._outputTexture = {
      texture: createTexture(this.gl, {
        ...commonTextureOptions(this.gl),
        type: this.gl.FLOAT,
        width: d.w,
        height: d.h
      }),
      dimensions: {
        w: d.w,
        h: d.h
      }
    }

    // Attach output texture to framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this._outputTexture.texture)
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this._outputTexture.texture, 0) // Attatch output texture to framebuffer
    this.gl.bindTexture(this.gl.TEXTURE_2D, null) // Unbind output texture
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null) // Unbind framebuffer
  }

  protected render(inputs: { [key: string]: any }, cleanup: boolean = true) {
    if (this.framebuffer === undefined || this._outputTexture === undefined) {
      throw new Error('outputDimensions unset!')
    }

    // Use program to render
    this.gl.useProgram(this.programInfo.program)

    // Set shader inputs
    setUniforms(this.programInfo, inputs) 

    // Render to framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer)
    drawBufferInfo(this.gl, this.bufferInfo)

    if (cleanup) {
      this.cleanup()
    }
  }

  protected cleanup() {
    if (this.framebuffer !== undefined) {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null) // Unbind framebuffer  
      this.gl.deleteFramebuffer(this.framebuffer)
    }
    this.gl.useProgram(null) // Unload program
    resizeContext(this.gl, 1, 1)
  }

  protected get outputTexture(): WaldoTexture {
    if (this.framebuffer === undefined || this._outputTexture === undefined) {
      throw new Error('outputDimensions unset!')
    }
    return this._outputTexture
  }
  
  public destroy() {
    this.gl.deleteProgram(this.programInfo.program)
    if (this.bufferInfo.indices) {
      this.gl.deleteBuffer(this.bufferInfo.indices)
    }
    if (this.framebuffer !== undefined) {
      this.gl.deleteFramebuffer(this.framebuffer)
    }
    if (this._outputTexture !== undefined) {
      this.gl.deleteTexture(this._outputTexture.texture)
    }
  }
}