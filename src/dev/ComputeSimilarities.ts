import {
  createTexture,
  setUniforms,
  drawBufferInfo
} from 'twgl.js'
import { Program } from './Program'
import { resizeContext } from './utils'
import { ImageData, Texture } from './types'

import { readFileSync } from 'fs'
import { join as joinPaths } from 'path'
const fragShaderSource = readFileSync(joinPaths(__dirname, './shaders/computeSimilarities.fs'), 'utf8')

export class ComputeSimilarities extends Program {
  constructor(gl: WebGLRenderingContext) {
    super(gl, fragShaderSource)
  }

  public run(image: ImageData, template: ImageData): Texture {
    this.gl.useProgram(this.programInfo.program)

    // Calculate output dimensions
    const [ outputWidth, outputHeight ] = [
      Math.floor( (image.width  - template.width  + 1) * template.width  / 2),
      Math.floor( (image.height - template.height + 1) * template.height / 2)
    ]

    resizeContext(this.gl, outputWidth, outputHeight)

    // Setup output texture

    const framebuffer = this.gl.createFramebuffer() as WebGLFramebuffer
    const outputTexture = createTexture(this.gl, {
      ...this.commonTextureOptions,
      width: outputWidth,
      height: outputHeight
    })

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
    this.gl.bindTexture(this.gl.TEXTURE_2D, outputTexture)
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, outputTexture, 0) // Attatch output texture to framebuffer
    this.gl.bindTexture(this.gl.TEXTURE_2D, null) // Unbind output texture

    // Create input textures
    const imageTexture = createTexture(this.gl, {
      ...this.commonTextureOptions,
      src: image.data,
      width: image.width,
      height: image.height
    })
    const templateTexture = createTexture(this.gl, {
      ...this.commonTextureOptions,
      src: template.data,
      width: template.width,
      height: template.height
    })

    // Set shader inputs
    setUniforms(this.programInfo, {
      u_image: imageTexture,
      u_template: templateTexture,
      u_imageDimensions: [ image.width, image.height ],
      u_templateDimensions: [ template.width, template.height ]
    })

    // Render to output texture
    drawBufferInfo(this.gl, this.bufferInfo)

    // Cleanup

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null) // Unbind framebuffer
    this.gl.deleteFramebuffer(framebuffer)

    this.gl.deleteTexture(imageTexture)
    this.gl.deleteTexture(templateTexture)
    
    this.gl.useProgram(null) // Unload program

    return {
      texture: outputTexture,
      width: outputWidth,
      height: outputHeight
    }

    // console.log(outputWidth, outputHeight)

    // const pixels = new Uint8Array(outputWidth*outputHeight*4)
    // this.gl.readPixels(0, 0, outputWidth, outputHeight, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels)

    // let buffer = ''
    // for (let i = 0; i < pixels.length; i++) {
    //   if(i%(template.width*4)==0) {
    //     buffer += '                                      '
    //   }

    //   if(i%(template.width*4*outputWidth/template.width)==0) {
    //     buffer += '\n'
    //   }

    //   if(i%(template.width*4*outputWidth/template.width*template.height)==0) {
    //     buffer += '\n\n'
    //   }

    //   if(i%4==0) {
    //     buffer += pixels[i].toString() + ', '
    //   }
      
    // }
    // console.log(buffer)
  }
}