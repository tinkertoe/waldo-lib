import {
  ProgramInfo,
  createBufferInfoFromArrays,
  BufferInfo,
  setBuffersAndAttributes,
  drawBufferInfo,
  createProgramInfoFromProgram,
  setUniforms
} from 'twgl.js'

import { resizeContext, createProgramFromSource, vertShaderSource } from './utils'

export class ComputeSimilarities {
  private gl: WebGLRenderingContext
  private programInfo: ProgramInfo
  private bufferInfo: BufferInfo

  constructor(gl: WebGLRenderingContext) {
    const program = createProgramFromSource(gl, vertShaderSource, `
      precision mediump float;

      uniform vec2 resolution;

      void main() {
        vec2 d = gl_FragCoord.xy / resolution.xy;
        
        gl_FragColor = vec4(d, 1.0, 1.0);
      }
    `)
    
    const programInfo = createProgramInfoFromProgram(gl, program)
    const bufferInfo = createBufferInfoFromArrays(gl, {
      position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
    })

    setBuffersAndAttributes(gl, programInfo, bufferInfo)

    this.gl = gl
    this.programInfo = programInfo
    this.bufferInfo = bufferInfo
  }

  public run(width: number, height: number) {
    width = Math.round(width)
    height = Math.round(height)

    resizeContext(this.gl, width, height)
    this.gl.useProgram(this.programInfo.program)

    // set uniforms
    setUniforms(this.programInfo, {
      resolution: [ width, height ]
    })


    // render
    drawBufferInfo(this.gl, this.bufferInfo)

    const pixels = new Uint8Array(width*height*4)
    this.gl.readPixels(0, 0, width, height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels)
    console.log(pixels)
  }
}