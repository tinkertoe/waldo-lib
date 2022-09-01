import { Waldo, Match } from '../src/v2'
import { image1, template1, image2, template2 } from './assets/sampleData'

test('verifyMatch', async () => {
  const waldo = new Waldo()

  const validResult1: Match = {
    similarity: 1,
    location: { x: 1, y: 9 }
  }

  const falseResult1: Match = {
    similarity: 1,
    location: { x: 2, y: 2 }
  }

  expect(waldo.verifyMatch(image1, template1, validResult1)).toBe(true)
  expect(waldo.verifyMatch(image1, template1, falseResult1)).toBe(false)

  const validResult2: Match = {
    similarity: 1,
    location: { x: 1, y: 2 }
  }

  const falseResult2: Match = {
    similarity: 1,
    location: { x: 3, y: 0 }
  }

  expect(waldo.verifyMatch(image2, template2, validResult2)).toBe(true)
  expect(waldo.verifyMatch(image2, template2, falseResult2)).toBe(false)

  waldo.destroy()
})