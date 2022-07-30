import WebGL from 'gl'

import { ImageData } from './types'

export class Waldo {
  private gl: WebGLRenderingContext
  private vertexShader: WebGLShader
  private fragmentShader: WebGLShader
  private program: WebGLProgram

  constructor() {
    this.gl = WebGL(1, 1, { alpha: false, depth: false, antialias: false })

    this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER) as WebGLShader
    this.gl.shaderSource(this.vertexShader, `
    
    `)
    this.gl.compileShader(this.vertexShader)

    this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER) as WebGLShader
    this.gl.shaderSource(this.fragmentShader, `
    
    `)
    this.gl.compileShader(this.fragmentShader)

    this.program = this.gl.createProgram() as WebGLProgram
    this.gl.attachShader(this.program, this.vertexShader)
    this.gl.attachShader(this.program, this.fragmentShader)
    this.gl.linkProgram(this.program)
  }

  private standardGeometry: Float32Array = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0
  ])

  private resizeGl(width: number, height: number) {
    const maxSize = this.gl.MAX_TEXTURE_SIZE

    if (width >= maxSize || height >= maxSize) {
      throw new Error('Maximum WebGL texture size exceeded')
    } else {
      this.gl.getExtension('STACKGL_resize_drawingbuffer').resize(Math.round(width), Math.round(height))
    }
  }

  private makeTexture(width: number, height: number, type: number, data: ArrayBufferView | null) {
    const gl = this.gl

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, type, data)

    gl.bindTexture(gl.TEXTURE_2D, null)

    return texture
  }

  private attatchFrameBuffer(texture: WebGLTexture) {
    const gl = this.gl

    const frameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

    return frameBuffer
  }

  private compute(program: WebGLProgram) {
    // Create buffer containing vertex positions
    const vertexBuffer = this.gl.createBuffer() as WebGLBuffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.standardGeometry, this.gl.STATIC_DRAW)

    // Load buffer into vertex buffer location
    const vertexBufferLocation = this.gl.getAttribLocation(program, 'position')
    this.gl.enableVertexAttribArray(vertexBufferLocation)
    this.gl.vertexAttribPointer(vertexBufferLocation, 2, this.gl.FLOAT, false, 0, 0)

    // Draw using program
    this.gl.useProgram(program)
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4) // WHERE DOES THIS DRAW? & WHERE DO I NEED TO READ FROM?
  }

  private computeSimilarities(image: ImageData, template: ImageData) {
    // set dimensions
    const outputWidth = image.width-template.width+1
    const outputHeight = image.height-template.height+1
    const outputDepth = template.data.length/4
    this.resizeGl(outputWidth*outputDepth, outputHeight)

    // HOW DO I LOAD IN A TEXTURE?
    
    this.compute(this.program)
  }
}