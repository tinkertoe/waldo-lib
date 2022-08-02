import WebGl from 'gl'

export class GPU {
  private gl: WebGLRenderingContext

  constructor() {
    this.gl = WebGl(1, 1, { depth: true })
  }

  public test() {
    const fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER) as WebGLShader
    this.gl.shaderSource(fragShader, `

    `)

    this.gl.compileShader(fragShader)
  }

  public destroy() {
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}