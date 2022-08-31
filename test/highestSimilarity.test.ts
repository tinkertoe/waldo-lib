import { Waldo } from '../src/v2'
import { image1 as image, template1 as template } from './assets/sampleData'


test('highestSimilarity', () => {
  const waldo = new Waldo()
  const result = waldo.highestSimilarity(image, template)
  expect(result.location).toEqual({ x: 1, y: 9 })
  expect(result).toMatchSnapshot()

  waldo.destroy()
})