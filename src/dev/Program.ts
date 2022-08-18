import {
  ProgramInfo,
  BufferInfo,
  TextureOptions,
  createProgramInfoFromProgram,
  createBufferInfoFromArrays,
  setBuffersAndAttributes,
} from 'twgl.js'
import { createProgramFromSource, vertShaderSource } from './utils'


export abstract class Program {
  protected gl: WebGLRenderingContext
  protected programInfo: ProgramInfo
  protected bufferInfo: BufferInfo
  protected commonTextureOptions: TextureOptions

  constructor (gl: WebGLRenderingContext, fragShaderSource: string) {
    this.gl = gl
    this.programInfo = createProgramInfoFromProgram(gl, createProgramFromSource(gl, vertShaderSource, fragShaderSource))
    this.bufferInfo = createBufferInfoFromArrays(gl, {
      position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
    })

    setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo)

    this.commonTextureOptions = {
      format: gl.RGBA,
      internalFormat: gl.RGBA,
      type: gl.UNSIGNED_BYTE,
      minMag: gl.NEAREST,
      wrap: gl.CLAMP_TO_EDGE
    }
  }

  public destroy() {
    this.gl.deleteProgram(this.programInfo.program)
    if (this.bufferInfo.indices) {
      this.gl.deleteBuffer(this.bufferInfo.indices)
    }
  }
}