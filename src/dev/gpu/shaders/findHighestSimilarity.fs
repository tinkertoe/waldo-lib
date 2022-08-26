precision mediump float;

uniform sampler2D u_highestSimilarities;
uniform vec2 u_highestSimilaritiesDimensions;

void main() {
  float highestSimilarityValue = 0.0;
  vec2 highestSimilarityCoord = vec2(0);

  for(int y = 0; y < int(u_highestSimilaritiesDimensions.y); y++) {
    vec2 texCoord = vec2(0.5, float(y)/u_highestSimilaritiesDimensions.y);
    vec4 texel = texture2D(u_highestSimilarities, texCoord);
    if(texel.r > highestSimilarityValue) {
      highestSimilarityValue = texel.r;
      highestSimilarityCoord.x = texel.g;
      highestSimilarityCoord.y = texCoord.y;
    }
  }

  gl_FragColor = vec4(highestSimilarityValue, highestSimilarityCoord.x, highestSimilarityCoord.y, 0);
}