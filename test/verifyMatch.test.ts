import { Waldo, Match } from '../src/'
import { image, template } from './assets/sampleImageData'

test('verifyMatch', async () => {
  const waldo = new Waldo()

  const validResult = await waldo.highestSimilarity(image, template)

  const falseResult: Match = {
    averageSimilarity: 100,
    location: { x: 2, y: 2 },
    allSimilarities: [ 100, 100, 100, 100, 100, 100 ]
  }

  expect(await waldo.verifyMatch(image, template, validResult)).toBe(true)
  expect(await waldo.verifyMatch(image, template, falseResult)).toBe(false)

  await waldo.destroy()
})