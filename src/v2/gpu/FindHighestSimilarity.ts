import { Program } from './Program'
import { WaldoTexture } from '../types'

const fragShaderSource = `
  precision lowp float;

  uniform sampler2D u_highestSimilarities;
  uniform vec2 u_highestSimilaritiesDimensions;

  // Loop through all the highest similarities per row to find the overall highest similarity

  void main() {
    float highestSimilarityValue = 0.0;
    ivec2 highestSimilarityCoord = ivec2(0);

    for(int y = 0; y < int(u_highestSimilaritiesDimensions.y); y++) {
      vec2 texCoord = vec2(0.5, y);
      vec4 texel = texture2D(u_highestSimilarities, (texCoord + vec2(0.25)) / u_highestSimilaritiesDimensions);
      if(texel.r > highestSimilarityValue) {
        highestSimilarityValue = texel.r;
        highestSimilarityCoord = ivec2(texel.g, max(0.0, float(y)));
      }
    }

    gl_FragColor = vec4(highestSimilarityValue, highestSimilarityCoord.x, highestSimilarityCoord.y, 0);
  }
`

export class FindHighestSimilarity extends Program {
  constructor(gl: WebGLRenderingContext) {
    super(gl, fragShaderSource)
  }

  public run(highestSimilarities: WaldoTexture): WaldoTexture {
    this.outputDimensions({ w: 1, h: 1 })

    this.render({
      u_highestSimilarities: highestSimilarities.texture,
      u_highestSimilaritiesDimensions: [ highestSimilarities.dimensions.w, highestSimilarities.dimensions.h ]
    })

    // Cleanup
    this.gl.deleteTexture(highestSimilarities.texture)

    return this.outputTexture
  }
}