export interface WaldoImageData {
  data: Uint8ClampedArray | Float32Array,
  width: number,
  height: number
}

export interface WaldoTexture {
  texture: WebGLTexture,
  dimensions: Dimensions
}

export interface Point {
  x: number,
  y: number
}

export interface Dimensions {
  w: number,
  h: number
}

export interface Region {
  origin: Point,
  dimensions: Dimensions
}

export interface Chunk {
  region: Region,
  computeSimilaritiesResult?: WaldoTexture,
  computeSimilaritiesResultDebug?: WaldoImageData,
  averageSimilaritiesResult?: WaldoTexture,
  averageSimilaritiesResultDebug?: WaldoImageData
  findHighestSimilaritiesResult?: WaldoTexture,
  findHighestSimilaritiesDebug?: WaldoImageData,
  findHighestSimilarityResult?: WaldoTexture,
  findHighestSimilarityDebug?: WaldoImageData
}

export interface Match {
  location: Point
  averageSimilarity: number,
  allSimilarities?: number[],
  timestamp?: number
}