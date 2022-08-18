precision highp float;

uniform sampler2D u_image;
uniform sampler2D u_template;

uniform vec2 u_imageDimensions;
uniform vec2 u_templateDimensions;

float similarity(vec2 offset) {
  vec2 imageCoord    = (gl_FragCoord.xy + offset) / u_templateDimensions;
  vec2 templateCoord = mod( gl_FragCoord.xy + offset, u_templateDimensions);
  
  vec4 imagePixel    = texture2D(u_image,    (imageCoord + templateCoord - vec2(0.5)) / u_imageDimensions);
  vec4 templatePixel = texture2D(u_template, templateCoord                            / u_templateDimensions);

  vec4 channelSimilarities = vec4(
    1.0-abs(imagePixel.r-templatePixel.r),
    1.0-abs(imagePixel.g-templatePixel.g),
    1.0-abs(imagePixel.b-templatePixel.b),
    1.0-abs(imagePixel.a-templatePixel.a)
  );

  return (channelSimilarities.r + channelSimilarities.g + channelSimilarities.b + channelSimilarities.a) / 4.0;
}

void main() {
  gl_FragColor = vec4(
    similarity(vec2(0, 0)),
    similarity(vec2(1, 0)),
    similarity(vec2(0, 1)),
    similarity(vec2(1, 1))
  );
}