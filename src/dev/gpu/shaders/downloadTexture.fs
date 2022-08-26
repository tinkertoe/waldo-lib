precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_textureDimensions;

void main() {
  gl_FragColor = texture2D(u_texture, gl_FragCoord.xy/u_textureDimensions);
}