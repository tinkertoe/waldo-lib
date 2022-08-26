precision mediump float;

uniform sampler2D u_image;
uniform sampler2D u_template;

uniform vec2 u_imageDimensions;
uniform vec2 u_templateDimensions;

uniform vec2 u_processingRegionOrigin;

void main() {
  /*
    To compute a similarity value for every point on the image,
    the template gets "overlayed" onto every point   
    which means that the contained pixels have to be compared 
    with the underlying pixels in the image.

    The comparison results have to fit into every corresponding pixel in the image.

    This means that this shader computes a texture,
    with a width that corresponds to the image's width
    times the templates' width and a hight that corresponds
    to the image's height times the templates' height.
  */

  vec2 templateCoord = mod(gl_FragCoord.xy,  u_templateDimensions);
  vec2 imageCoord    =    (gl_FragCoord.xy / u_templateDimensions) + u_processingRegionOrigin + templateCoord - vec2(0.5);
  
  vec4 imagePixel    = texture2D(u_image,    imageCoord    / u_imageDimensions);
  vec4 templatePixel = texture2D(u_template, templateCoord / u_templateDimensions);

  vec4 channelSimilarities = vec4(
    1.0-abs(imagePixel.r-templatePixel.r),
    1.0-abs(imagePixel.g-templatePixel.g),
    1.0-abs(imagePixel.b-templatePixel.b),
    1.0-abs(imagePixel.a-templatePixel.a)
  );

  gl_FragColor = vec4( (channelSimilarities.r + channelSimilarities.g + channelSimilarities.b + channelSimilarities.a) / 4.0 );
}