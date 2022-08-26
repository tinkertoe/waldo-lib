precision mediump float;

uniform sampler2D u_averageSimilarities;
uniform vec2 u_averageSimilaritiesDimensions;

void main() {
  float highestSimilarityXCoord = 0.0;
  float highestSimilarityValue = 0.0;

  for(int x = 0; x < int(u_averageSimilaritiesDimensions.x); x++) {
    vec2 texCoord = vec2(x, gl_FragCoord.y);
    vec4 texel = texture2D(u_averageSimilarities, texCoord/u_averageSimilaritiesDimensions);
    if (texel.r > highestSimilarityValue) {
      highestSimilarityValue = texel.r;
      highestSimilarityXCoord = texCoord.x;
    }
  }

  gl_FragColor = vec4(highestSimilarityValue, highestSimilarityXCoord/u_averageSimilaritiesDimensions.x, 0, 0);
}