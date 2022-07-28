import { TemplateMatcher } from '../src/index'
import { image, template } from './assets/sampleImageData'

test('filteredSimilarities', async () => {
  const tm = new TemplateMatcher()
  const result = await tm.filteredSimilarities(image, template, 51)
  expect(result).toMatchSnapshot()

  await tm.destroy()
})