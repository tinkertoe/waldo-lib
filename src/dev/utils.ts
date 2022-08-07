export function resizeContext(gl: WebGLRenderingContext, width: number, height: number) {
  // if (width >= gl.MAX_TEXTURE_SIZE || height >= gl.MAX_TEXTURE_SIZE) {
  //   throw new Error(`Maximum WebGL texture size exceeded: ${gl.MAX_TEXTURE_SIZE}`)
  // }

  width = Math.round(width)
  height = Math.round(height)

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

export const vertShaderSource = `
  attribute vec4 position;

  void main() {
    gl_Position = position;
  }
`