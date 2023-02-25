import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import json from '@rollup/plugin-json'
import dts from 'rollup-plugin-dts'

const input = './src/index.ts'
const outputName = 'index'
const iifeName = 'money'
const config = [
  {
    input,
    output: [
      {
        file: `dist/${outputName}.cjs`,
        format: 'cjs',
      },
      {
        file: `dist/${outputName}.min.cjs`,
        format: 'cjs',
        plugins: [terser()],
      },
      {
        file: `dist/${outputName}.mjs`,
        format: 'es',
      },
      {
        file: `dist/${outputName}.min.mjs`,
        format: 'es',
        plugins: [terser()],
      },
      {
        file: `dist/${outputName}.iife.js`,
        format: 'iife',
        name: iifeName,
      },
      {
        file: `dist/${outputName}.iife.min.js`,
        format: 'iife',
        name: iifeName,
        plugins: [terser()],
      },
    ],
    plugins: [json(), typescript()],
  },
  {
    input,
    output: {
      file: `dist/${outputName}.d.ts`,
      format: 'es',
    },
    plugins: [dts()],
  },
]

export default config
