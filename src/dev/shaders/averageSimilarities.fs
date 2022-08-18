precision highp float;

uniform sampler2D u_similarities;

uniform vec2 u_similarityDimensions;
uniform vec2 u_templateDimensions;

void main() {
  float sum = 0.0;

  for(int y = 0; y < int(u_templateDimensions.y); y++) {
    for(int x = 0; x < int(u_templateDimensions.x); x++) {

      vec4 pixel = texture2D(u_similarities, ( (gl_FragCoord.xy * u_templateDimensions) + vec2(x, y) - vec2(0.75) ) / u_similarityDimensions);
      sum = sum + pixel.r + pixel.g + pixel.b + pixel.a;

    }
  }

  gl_FragColor = vec4(sum / (u_templateDimensions.x * u_templateDimensions.y * 4));
}