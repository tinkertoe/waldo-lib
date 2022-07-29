# waldo.js

[![npm version](https://badge.fury.io/js/waldo.js.svg)](https://badge.fury.io/js/waldo.js)

Javascript library for fast and simple template matching without weird opencv bindings!

## What is template matching?

> "Template matching is a technique in digital image processing for finding small parts of an image which match a template image." - [wikipedia.org](https://en.wikipedia.org/w/index.php?title=Template_matching&oldid=1073414135)

# Quickstart

```bash
$ npm install waldo.js
```

```typescript
import { Waldo, ImageData, Match } from 'waldo.js'

const waldo = Waldo()

const image: ImageData = {
  data: Uint8ClampedArray.from([
    0,0,0,255,  0,0,0,255,        0,0,0,255,
    0,0,0,255,  255,255,255,255,  0,0,0,255, 
    0,0,0,255,  0,0,0,255,        0,0,0,255
  ]),
  width: 3,
  height: 3
}

const template: ImageData = {
  data: Uint8ClampedArray.from([
    255,255,255,255
  ]),
  width: 1,
  height: 1
}

waldo.findHighest(image, template)
  .then((match: Match) => {
    console.log(match)
  })

/*
{
  location: { x: 1, y: 1 },
  averageSimilarity: 100,
  allSimilarities: [ 100 ]
}
*/
```

## How to load in ImageData

The libary is designed to work with data in the [format used by the Canvas Web API](https://developer.mozilla.org/en-US/docs/Web/API/ImageData). For now just look at guides for loading that.

# Docs
The full API Documentation can be found under [https://tinkertoe.github.io/waldo.js](https://tinkertoe.github.io/waldo.js)
