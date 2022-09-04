import { defineConfig } from 'rollup'

import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'

const glBrowserOnly = {
  name: 'rollup-plugin-gl-browser-only',
  async resolveId(id, importer, opt) {
    if (id.endsWith('node-index') && importer.endsWith('gl/index.js')) {
      return await this.resolve(id.replace('node-index', 'browser-index'), importer, opt)
    }
  }
}

export default defineConfig({
  input: 'src/v2/index.ts',
  output: {
    file: 'dist/browser.js',
    format: 'iife',
    name: 'waldolib'
  },
  plugins: [ glBrowserOnly, typescript(), nodeResolve(), commonjs(), json()]
})