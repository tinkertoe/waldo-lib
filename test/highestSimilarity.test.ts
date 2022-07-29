import { Waldo } from '../src/index'
import { image, template } from './assets/sampleImageData'


test('highestSimilarity', async () => {
  const waldo = new Waldo()
  const result = await waldo.highestSimilarity(image, template)
  expect(result.location).toEqual({ x: 1, y: 9 })
  expect(result).toMatchSnapshot()

  await waldo.destroy()
})