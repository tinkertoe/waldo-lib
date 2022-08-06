import {
  ProgramInfo,
  createBufferInfoFromArrays,
  BufferInfo,
  setBuffersAndAttributes,
  drawBufferInfo,
  createProgramInfoFromProgram,
} from 'twgl.js'

import { resizeContext, createProgramFromSource, vertShader } from './utils'

export class ComputeSimilarities {
  private gl: WebGLRenderingContext
  private programInfo: ProgramInfo
  private bufferInfo: BufferInfo

  constructor(gl: WebGLRenderingContext) {
    const program = createProgramFromSource(gl, vertShader, `
      precision mediump float;

      void main() {
        gl_FragColor = vec4(0.5, 0.5, 0.5, 0.5);
      }
    `)
    
    const programInfo = createProgramInfoFromProgram(gl, program)

    const bufferInfo = createBufferInfoFromArrays(gl, {
      position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
    })

    this.gl = gl
    this.programInfo = programInfo
    this.bufferInfo = bufferInfo
  }

  public run(width: number, height: number) {
    resizeContext(this.gl, width, height)
    this.gl.useProgram(this.programInfo.program)
    setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo)

    // uniforms

    drawBufferInfo(this.gl, this.bufferInfo)

    const pixels = new Uint8Array(width*height*4)
    this.gl.readPixels(0, 0, width, height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels)
    console.log(pixels)
  }
}