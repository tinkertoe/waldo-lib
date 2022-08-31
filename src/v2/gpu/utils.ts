import { Chunk, Dimensions, Point, WaldoTexture, WaldoImageData } from '../types'
import { createTexture, TextureOptions } from 'twgl.js'

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

export function imageDataToTexture(gl: WebGLRenderingContext, imageData: WaldoImageData): WaldoTexture {
  const texture = gl.createTexture() as WebGLTexture
  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imageData.width, imageData.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageData.data as Uint8ClampedArray)

  gl.bindTexture(gl.TEXTURE_2D, null)

  return {
    texture,
    dimensions: {
      w: imageData.width,
      h: imageData.height
    }
  }

}

export function stringifyImageData(imageData: WaldoImageData, includeFullPixel: boolean = false): string {
  let buffer = ''
  for (let i = 0; i < imageData.data.length; i++) {
    if (i%(imageData.width*4)==0) {
      buffer += '\n'
    }
    if ((!includeFullPixel && i%4==0) || includeFullPixel) {
      buffer += imageData.data[i].toString() + ', '
    }
  }
  return buffer
}

export const vertShaderSource = `attribute vec4 position; void main() { gl_Position = position; }`