import {
  ProgramInfo,
  BufferInfo,
  createProgramInfoFromProgram,
  createBufferInfoFromArrays,
  setBuffersAndAttributes,
} from 'twgl.js'
import { createProgramFromSource, vertShaderSource } from './utils'

export abstract class Program {
  protected gl: WebGLRenderingContext
  protected programInfo: ProgramInfo
  protected bufferInfo: BufferInfo

  constructor (gl: WebGLRenderingContext, fragShaderSource: string) {
    this.gl = gl
    this.programInfo = createProgramInfoFromProgram(gl, createProgramFromSource(gl, vertShaderSource, fragShaderSource))
    this.bufferInfo = createBufferInfoFromArrays(gl, {
      position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
    })

    setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo)
  }

  public destroy() {
    this.gl.deleteProgram(this.programInfo.program)
    if (this.bufferInfo.indices) {
      this.gl.deleteBuffer(this.bufferInfo.indices)
    }
  }
}