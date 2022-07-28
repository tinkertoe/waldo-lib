import { TemplateMatcher } from '../src/index'
import { Match } from '../src/types'
import { image, template } from './assets/sampleImageData'

test('verifyMatch', async () => {
  const tm = new TemplateMatcher()

  const validResult = await tm.highestSimilarity(image, template)

  const falseResult: Match = {
    averageSimilarity: 100,
    location: { x: 2, y: 2 },
    allSimilarities: [ 100, 100, 100, 100, 100, 100 ]
  }

  expect(await tm.verifyMatch(image, template, validResult)).toBe(true)
  expect(await tm.verifyMatch(image, template, falseResult)).toBe(false)

  await tm.destroy()
})