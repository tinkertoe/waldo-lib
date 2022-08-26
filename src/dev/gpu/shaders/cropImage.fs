precision mediump float;

uniform sampler2D u_inputTexture;
uniform vec2 u_inputDimensions;
uniform vec2 u_cropOrigin;

void main() {
  vec2 inputCoord = u_cropOrigin.xy + gl_FragCoord.xy;
  gl_FragColor = texture2D(u_inputTexture, inputCoord/u_inputDimensions);
}