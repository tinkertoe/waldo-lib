import { Program } from './Program'
import { Dimensions, WaldoTexture } from '../types'

const fragShaderSource = `
  precision lowp float;

  uniform sampler2D u_similarities;

  uniform vec2 u_similarityDimensions;
  uniform vec2 u_templateDimensions;

  void main() {
    float sum = 0.0;

    // Add all similarity values of one template overlay together
    for(int y = 0; y < int(u_templateDimensions.y); y++) {
      for(int x = 0; x < int(u_templateDimensions.x); x++) {
        vec2 pixelCoord = (gl_FragCoord.xy * u_templateDimensions) + vec2(x, y) - vec2(0.75);
        vec4 pixel      = texture2D(u_similarities, pixelCoord / u_similarityDimensions);

        sum += pixel.r;
      }
    }

    // Calculate the average
    gl_FragColor = vec4(sum / (u_templateDimensions.x * u_templateDimensions.y), 0, 0, 0);
  }
`

export class AverageSimilarities extends Program {
  constructor(gl: WebGLRenderingContext) {
    super(gl, fragShaderSource)
  }

  public run(similarities: WaldoTexture, templateSize: Dimensions): WaldoTexture {
    this.outputDimensions({
      w: Math.floor(similarities.dimensions.w / templateSize.w),
      h: Math.floor(similarities.dimensions.h / templateSize.h)
    })

    this.render({
      u_similarities: similarities.texture,
      u_similarityDimensions: [ similarities.dimensions.w, similarities.dimensions.h ],
      u_templateDimensions: [ templateSize.w, templateSize.h ]
    })

    // Cleanup
    this.gl.deleteTexture(similarities.texture)

    return this.outputTexture
  }
}