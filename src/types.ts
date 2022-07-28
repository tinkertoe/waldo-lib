export interface Point {
  x: number
  y: number
}

export interface Match {
  location: Point
  averageSimilarity: number,
  allSimilarities?: number[],
  timestamp?: number
}

export interface ImageData {
  data: Uint8ClampedArray,
  width: number,
  height: number
}

