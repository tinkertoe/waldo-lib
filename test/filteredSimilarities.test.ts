import { Waldo } from '../src/index'
import { image, template } from './assets/sampleImageData'

test('filteredSimilarities', async () => {
  const waldo = new Waldo()
  const result = await waldo.filteredSimilarities(image, template, 51)
  expect(result).toMatchSnapshot()

  await waldo.destroy()
})