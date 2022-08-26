precision mediump float;

uniform sampler2D u_similarities;

uniform vec2 u_similarityDimensions;
uniform vec2 u_templateDimensions;

float average(vec2 offset) {
  float sum = 0.0;
  for(int y = 0; y < int(u_templateDimensions.y); y++) {
    for(int x = 0; x < int(u_templateDimensions.x); x++) {

      vec4 pixel = texture2D(u_similarities, ( ((gl_FragCoord.xy+offset) * u_templateDimensions) + vec2(x, y) - vec2(0.75) ) / u_similarityDimensions);
      sum = sum + pixel.r + pixel.g + pixel.b + pixel.a;

    }
  }
  return sum / (u_templateDimensions.x * u_templateDimensions.y * 4.0);

}

void main() {
  gl_FragColor = vec4(average(vec2(0, 0)));
}