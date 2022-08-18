export interface ImageData {
  data: Uint8ClampedArray,
  width: number,
  height: number
}

export interface Texture {
  texture: WebGLTexture,
  width: number,
  height: number
}