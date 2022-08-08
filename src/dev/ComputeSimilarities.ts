import {
  ProgramInfo,
  createBufferInfoFromArrays,
  BufferInfo,
  setBuffersAndAttributes,
  drawBufferInfo,
  createProgramInfoFromProgram,
  setUniforms,
  createTexture,
  createTextures
} from 'twgl.js'
import { resizeContext, createProgramFromSource, vertShaderSource } from './utils'
import { ImageData } from './types'

export class ComputeSimilarities {
  private gl: WebGLRenderingContext
  private programInfo: ProgramInfo
  private bufferInfo: BufferInfo

  constructor(gl: WebGLRenderingContext) {
    const program = createProgramFromSource(gl, vertShaderSource, `
    precision mediump float;


    uniform sampler2D u_image;
    uniform sampler2D u_template;
    
    uniform vec2 u_templateDimensions;
    uniform vec2 u_imageDimensions;
    
    float dif(int offset) {
      vec2 imageCoord = gl_FragCoord.xy / u_templateDimensions;
      vec2 templateCoord = mod(gl_FragCoord.xy, u_templateDimensions);
      
      vec4 imagePixel = texture2D(u_image, (imageCoord+templateCoord) / u_imageDimensions);
      vec4 templatePixel = texture2D(u_template, templateCoord / u_templateDimensions);
    
      vec4 dif = vec4(
        abs(imagePixel.r-templatePixel.r),
        abs(imagePixel.g-templatePixel.g),
        abs(imagePixel.b-templatePixel.b),
        abs(imagePixel.a-templatePixel.a)
      );
    
      return (dif.r + dif.g + dif.b + dif.a) / 4.0;
    }
    
    void main() {
      gl_FragColor = vec4(dif(0));
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

  public run(image: ImageData, template: ImageData) {
    const imageTexture = createTexture(this.gl, {
      format: this.gl.RGBA,
      internalFormat: this.gl.RGBA,
      type: this.gl.UNSIGNED_BYTE,
      minMag: this.gl.NEAREST,
      wrap: this.gl.CLAMP_TO_EDGE,
      src: image.data,
      width: image.width,
      height: image.height
    })

    const templateTexture = createTexture(this.gl, {
      format: this.gl.RGBA,
      internalFormat: this.gl.RGBA,
      type: this.gl.UNSIGNED_BYTE,
      minMag: this.gl.NEAREST,
      wrap: this.gl.CLAMP_TO_EDGE,
      src: template.data,
      width: template.width,
      height: template.height
    })

    const [ outputWidth, outputHeight ] = [
      Math.round((image.width-template.width+1)*template.width),
      Math.round((image.height-template.height+1)*template.height)
    ]

    resizeContext(this.gl, outputWidth, outputHeight)
    this.gl.useProgram(this.programInfo.program)

    // set uniforms
    setUniforms(this.programInfo, {
      u_image: imageTexture,
      u_template: templateTexture,
      u_templateDimensions: [ template.width, template.height ]
    })

    // render
    drawBufferInfo(this.gl, this.bufferInfo)

    const pixels = new Uint8Array(outputWidth*outputHeight*4)
    this.gl.readPixels(0, 0, outputWidth, outputHeight, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels)
    console.log(pixels)
  }
}