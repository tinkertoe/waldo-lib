import { Program } from './Program'
import { WaldoTexture, Region } from '../types'

import fs from 'fs'
import path from 'path'
const fragShaderSource = fs.readFileSync(path.join(__dirname, './shaders/computeSimilarities.fs'), 'utf8')

export class ComputeSimilarities extends Program {
  constructor(gl: WebGLRenderingContext) {
    super(gl, fragShaderSource)
  }

  public run(image: WaldoTexture, template: WaldoTexture, processingRegion: Region): WaldoTexture {
    this.outputDimensions({
      w: processingRegion.dimensions.w * template.dimensions.w,
      h: processingRegion.dimensions.h * template.dimensions.h
    })

    this.render({
      u_image: image.texture,
      u_template: template.texture,
      u_imageDimensions: [ image.dimensions.w, image.dimensions.h ],
      u_templateDimensions: [ template.dimensions.w, template.dimensions.h ],
      u_processingRegionOrigin: [ processingRegion.origin.x, processingRegion.origin.y ]
    })
    
    return this.outputTexture
  }
}