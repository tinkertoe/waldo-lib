precision lowp float;

uniform sampler2D u_highestSimilarities;
uniform vec2 u_highestSimilaritiesDimensions;

void main() {
  float highestSimilarityValue = 0.0;
  vec2 highestSimilarityCoord = vec2(0);

  for(int y = 0; y < int(u_highestSimilaritiesDimensions.y); y++) {
    vec2 texCoord = vec2(0.5, y);
    vec4 texel = texture2D(u_highestSimilarities, (texCoord + vec2(0.25)) / u_highestSimilaritiesDimensions);
    if(texel.r > highestSimilarityValue) {
      highestSimilarityValue = texel.r;
      highestSimilarityCoord.x = texel.g;
      highestSimilarityCoord.y = (texCoord.y + 1.0)/ u_highestSimilaritiesDimensions.y;
    }
  }

  gl_FragColor = vec4(highestSimilarityValue, highestSimilarityCoord.x, highestSimilarityCoord.y, 0);
}