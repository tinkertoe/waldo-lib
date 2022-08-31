import { Waldo } from '../src/v2'
import { image1, template1, image2, template2 } from './assets/sampleData'


test('highestSimilarity', () => {
  const waldo = new Waldo()

  const result1 = waldo.highestSimilarity(image1, template1)
  expect(result1.location).toEqual({ x: 1, y: 9 })
  expect(result1.similarity).toEqual(1)

  const result2 = waldo.highestSimilarity(image2, template2)
  expect(result2.location).toEqual({ x: 1, y: 2 })
  expect(result2.similarity).toEqual(1)

  waldo.destroy()
})