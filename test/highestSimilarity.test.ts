import { TemplateMatcher } from '../src/index'
import { image, template } from './assets/sampleImageData'


test('highestSimilarity', async () => {
  const tm = new TemplateMatcher()
  const result = await tm.highestSimilarity(image, template)
  expect(result.location).toEqual({ x: 1, y: 9 })
  expect(result).toMatchSnapshot()

  await tm.destroy()
})