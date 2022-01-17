import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default [
  {
    input: 'src/main.js',
    output: {
      name: 'KatexIt',
      file: 'dist/katexit.umd.js',
      format: 'umd'
    },
    plugins: [resolve(), commonjs(), json()]
  }
]