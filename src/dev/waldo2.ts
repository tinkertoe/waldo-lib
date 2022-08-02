import WebGL from 'gl'

import { SimilaritiesProgram, Program } from './types2'

export class Waldo {
  private gl: WebGLRenderingContext
  private similaritiesProgram: SimilaritiesProgram

  constructor() {
    this.gl = WebGL(1, 1, { alpha: false, depth: false, antialias: false })

    const vertShader = Waldo.createShader(this.gl, this.gl.VERTEX_SHADER, `
      attribute vec4 a_position;
      
      void main() {
        gl_Position = a_position;
      }
    `)

    this.similaritiesProgram = Waldo.createSimilaritiesProgram(this.gl, vertShader)
  }

  private static createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type) as WebGLShader
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const shaderLog = gl.getShaderInfoLog(shader) as string
      gl.deleteShader(shader)
      throw new Error(shaderLog)
    }

    return shader
  }

  private static createProgram(gl: WebGLRenderingContext, vertShader: WebGLShader, fragShader: WebGLShader): WebGLProgram {
    const program = gl.createProgram() as WebGLProgram
    gl.attachShader(program, vertShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const programLog = gl.getProgramInfoLog(program)
      gl.deleteProgram(program)
      throw new Error(programLog as string)
    }

    // Upload standard geometry

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0,
      1.0, -1.0,
      -1.0, 1.0,
      -1.0, 1.0,
      1.0, -1.0,
      1.0, 1.0
    ]), gl.STATIC_DRAW)

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    return program
  }

  private static createSimilaritiesProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader): SimilaritiesProgram {
    const fragmentShader = Waldo.createShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      
      void main() {
        gl_FragColor = vec4(1, 0, 0.5, 1);
      }
    `)
    const program = Waldo.createProgram(gl, vertexShader, fragmentShader)
    
    // Get uniform locations etc.

    return { program }
  }

  private resizeGl(width: number, height: number) {
    const maxSize = this.gl.MAX_TEXTURE_SIZE

    if (width >= maxSize || height >= maxSize) {
      throw new Error('Maximum WebGL texture size exceeded')
    } else {
      this.gl.getExtension('STACKGL_resize_drawingbuffer').resize(Math.round(width), Math.round(height))
      this.gl.viewport(0, 0, Math.round(width), Math.round(height))
      this.gl.clearColor(0, 0, 0, 0)
      this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    }
  }

  // private makeTexture(width: number, height: number, type: number, data: ArrayBufferView | null) {
  //   const gl = this.gl

  //   const texture = gl.createTexture()
  //   gl.bindTexture(gl.TEXTURE_2D, texture)

  //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  //   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  //   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, data)

  //   gl.bindTexture(gl.TEXTURE_2D, null)

  //   return texture
  // }

  // private attatchFrameBuffer(texture: WebGLTexture) {
  //   const gl = this.gl

  //   const frameBuffer = gl.createFramebuffer()
  //   gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
  //   gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

  //   return frameBuffer
  // }

  private computeSimilarities() {
    // Set dimensions
    // const outputWidth = image.width-template.width+1
    // const outputHeight = image.height-template.height+1
    // const outputDepth = template.data.length/4
    const width = 100
    const height = 100
    this.resizeGl(width, height)

    // Configure fragment shader inputs


    // Draw using program
    this.gl.useProgram(this.similaritiesProgram.program)

    const targetTexture = this.gl.createTexture() as WebGLTexture
    this.gl.bindTexture(this.gl.TEXTURE_2D, targetTexture)
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)

    const frameBuffer = this.gl.createFramebuffer()
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer)
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, targetTexture, 0)

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4) // WHERE DOES THIS DRAW? & WHERE DO I NEED TO READ FROM?
  }
}