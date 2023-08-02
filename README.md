# waldo-lib

[![npm version](https://badge.fury.io/js/waldo-lib.svg)](https://badge.fury.io/js/waldo-lib)

Javascript library for fast and simple template matching without weird opencv bindings!

## What is template matching?

> "Template matching is a technique in digital image processing for finding small parts of an image which match a template image." - [wikipedia.org](https://en.wikipedia.org/w/index.php?title=Template_matching&oldid=1073414135)

# Quickstart

```bash
$ npm install waldo-lib
```

```typescript
import { Waldo, WaldoImageData, Match } from 'waldo-lib'

// For browser, use context from HTMLCanvas
const gl = document.createElement('canvas').getContext('webgl')

// For node, use headless-gl
import WebGL from 'gl'
const gl = WebGL(1, 1)


const waldo = new Waldo(gl)

const image: WaldoImageData = { // ImageData from Web API is asignable to WaldoImageData
  width: 6,
  height: 6,
  data: Uint8ClampedArray.from([
    0, 0, 0, 0,   0, 0, 0, 0,           0, 0, 0, 0,            0, 0, 0, 0,   0, 0, 0, 0,   0, 0, 0, 0,
    0, 0, 0, 0,   0, 0, 0, 0,           0, 0, 0, 0,            0, 0, 0, 0,   0, 0, 0, 0,   0, 0, 0, 0,
    0, 0, 0, 0,   255, 255, 255, 255,   255, 255, 255, 255,    0, 0, 0, 0,   0, 0, 0, 0,   0, 0, 0, 0,
    0, 0, 0, 0,   255, 255, 255, 255,   0, 0, 0, 0,            0, 0, 0, 0,   0, 0, 0, 0,   0, 0, 0, 0,
    0, 0, 0, 0,   0, 0, 0, 0,           0, 0, 0, 0,            0, 0, 0, 0,   0, 0, 0, 0,   0, 0, 0, 0,
    0, 0, 0, 0,   0, 0, 0, 0,           0, 0, 0, 0,            0, 0, 0, 0,   0, 0, 0, 0,   0, 0, 0, 0,
  ])
}

const template: WaldoImageData = {
  width: 2,
  height: 2,
  data: Uint8ClampedArray.from([
    255, 255, 255, 255,   255, 255, 255, 255,
    255, 255, 255, 255,   0, 0, 0, 0
  ])
}

const match = waldo.highestSimilarity(image, template)
console.log(match)

/*
{
  location: { x: 1, y: 2 },
  similarity: 1, // Value goes from 0 to 1
}
*/
```

## How to load in ImageData
This library is designed to work with the [`ImageData` type from the Canvas Web API](https://developer.mozilla.org/en-US/docs/Web/API/ImageData), which is asignable to `WaldoImageData`.

To load this data from a file in NodeJS, [pngjs](https://github.com/pngjs/pngjs) could be used. See `PNG.data`, `PNG.width` and `PNG.height`.

# Docs
The full API Documentation can be found under [https://tinkertoe.github.io/waldo-lib](https://tinkertoe.github.io/waldo-lib)
