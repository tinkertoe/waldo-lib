import { Waldo } from '../src/v2'
import { image1 as image, template1 as template } from './assets/sampleData'

test('filteredSimilarities', () => {
  const waldo = new Waldo()
  const result = waldo.filteredSimilarities(image, template, 0.75)
  expect(result).toMatchSnapshot()

  waldo.destroy()
})