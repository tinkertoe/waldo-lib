import { Chunk, Dimensions, Point, WaldoTexture, WaldoImageData } from '../types'
import { createTexture as twglCreateTexture, TextureOptions } from 'twgl.js'

export function resizeContext(gl: WebGLRenderingContext, width: number, height: number) {
  gl.getExtension('STACKGL_resize_drawingbuffer')?.resize(width, height)
  gl.viewport(0, 0, width, height)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
}

export function createShader(gl: WebGLRenderingContext, type: number, source: string) {
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

export function createProgramFromSource(gl: WebGLRenderingContext, vertShaderSource: string, fragShaderSource: string) {
  const vertShader = createShader(gl, gl.VERTEX_SHADER, vertShaderSource)
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragShaderSource)

  const program = gl.createProgram() as WebGLProgram
  gl.attachShader(program, vertShader)
  gl.attachShader(program, fragShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const programLog = gl.getProgramInfoLog(program) as string
    gl.deleteProgram(program)
    throw new Error(programLog)
  }

  return program
}

export function chunk(imageSize: Dimensions, templateSize: Dimensions, maxTextureSize: number): Chunk[] {
  const chunks: Dimensions = {
    w: Math.ceil(imageSize.w*templateSize.w / maxTextureSize),
    h: Math.ceil(imageSize.h*templateSize.h / maxTextureSize)
  }

  const chunkSize: Dimensions = {
    w: Math.ceil(imageSize.w / chunks.w),
    h: Math.ceil(imageSize.h / chunks.h)
  }

  const chunkList: Chunk[] = []

  for (let y = 0; y < chunks.h; y++) {
    for (let x = 0; x < chunks.w; x++) {
      const origin: Point = {
        x: x*chunkSize.w,
        y: y*chunkSize.h
      }

      const dimensions: Dimensions = {
        w: chunkSize.w,
        h: chunkSize.h
      }

      // Last chunk on row?
      if (x === chunks.w-1) {
        dimensions.w = imageSize.w - x*chunkSize.w
      }

      // Last chunk on column
      if (y === chunks.h-1) {
        dimensions.h = imageSize.h - y*chunkSize.h
      }

      chunkList.push({ region: {origin, dimensions} })
    }
  }

  return chunkList
}

export function commonTextureOptions(gl: WebGLRenderingContext): TextureOptions {
  return {
    format: gl.RGBA,
    internalFormat: gl.RGBA,
    type: gl.UNSIGNED_BYTE,
    minMag: gl.NEAREST,
    wrap: gl.CLAMP_TO_EDGE
  }
}

export function createWaldoTexture(gl: WebGLRenderingContext, imageData: WaldoImageData): WaldoTexture {
  return {
    texture: twglCreateTexture(gl, {
      ...commonTextureOptions(gl),
      src: imageData.data,
      width: imageData.width,
      height: imageData.height
    }),
    dimensions: {
      w: imageData.width,
      h: imageData.height
    }
  }
}

export function stringifyImageData(imageData: WaldoImageData): string {
  let buffer = ''
  for (let i = 0; i < imageData.data.length; i++) {
    if (i%(imageData.width*4)==0) {
      buffer += '\n'
    }
    if (true) {
      buffer += imageData.data[i].toString() + ', '
    }
  }
  return buffer
}

export const vertShaderSource = `attribute vec4 position; void main() { gl_Position = position; }`