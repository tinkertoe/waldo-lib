import { Waldo } from './Waldo'
import { image1 as imageData, template1 as templateData } from './sampleData'


const waldo = new Waldo()

const match = waldo.highestSimilarity(imageData, templateData)
console.log(match)

// const matches = waldo.filteredSimilarities(imageData, templateData, 0.5)
// console.log(matches)