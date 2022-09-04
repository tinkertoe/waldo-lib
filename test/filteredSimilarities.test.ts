import { Waldo } from '../src/v2/index'
import { image1, template1, image2, template2 } from './assets/sampleData'
import WebGL from 'gl'

test('filteredSimilarities', async () => {
  const waldo = new Waldo(WebGL(1, 1))

  const result1 = waldo.filteredSimilarities(image1, template1, 0.5)
  const result2 = waldo.filteredSimilarities(image2, template2, 0.5)

  expect(await result1).toMatchSnapshot('result1')
  expect(await result2).toMatchSnapshot('result2')

  await waldo.destroy()
})