import WebGL from 'gl'

export class Waldo {
  private gl: WebGLRenderingContext
  
  constructor() {
    this.gl = WebGL(1, 1, { depth: false })
  }

  public test() {
    
  }

  public destroy() {
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}