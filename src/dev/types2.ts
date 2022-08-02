export class Shader {

  public shader: WebGLShader

  constructor (gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type) as WebGLShader
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const shaderLog = gl.getShaderInfoLog(shader) as string
      gl.deleteShader(shader)
      throw new Error(shaderLog)
    }

    this.shader = shader
  }

  public destroy(gl: WebGLRenderingContext) {
    gl.deleteShader(this.shader)
  }
}

export interface Program {
  program: WebGLProgram
}

export interface SimilaritiesProgram extends Program {
  
}