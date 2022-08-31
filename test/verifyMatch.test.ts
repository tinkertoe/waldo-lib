// import { Waldo, Match } from '../src/v2'
// import { image1 as image, template1 as template } from './assets/sampleData'

// test('verifyMatch', async () => {
//   const waldo = new Waldo()

//   const validResult = await waldo.highestSimilarity(image, template)

//   const falseResult: Match = {
//     similarity: 100,
//     location: { x: 2, y: 2 }
//   }

//   expect(await waldo.verifyMatch(image, template, validResult)).toBe(true)
//   expect(await waldo.verifyMatch(image, template, falseResult)).toBe(false)

//   await waldo.destroy()
// })