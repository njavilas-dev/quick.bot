import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import { babel } from '@rollup/plugin-babel'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'
import typescript from '@rollup/plugin-typescript'
import fs from 'fs'
import replace from '@rollup/plugin-replace'

const extensions = ['.ts', '.tsx']

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const packageVersion = packageJson.version
const preamble = `// v${packageVersion}`

const indexConfig = {
  input: './src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
  external: ['react', 'react/jsx-runtime'],
  watch: {
    clearScreen: false,
    exclude: ['node_modules/**', 'dist/**', '*.d.ts', '**/*.d.ts'],
  },
  plugins: [
    resolve({ extensions }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['@babel/preset-react', '@babel/preset-typescript'],
      extensions,
    }),
    typescriptPaths({ preserveExtensions: true }),
    typescript({
      noEmitOnError: !process.env.ROLLUP_WATCH,
    }),
    terser({ format: { preamble } }),
    replace({
      'process.env.NPM_TOKEN': JSON.stringify(process.env.NPM_TOKEN || ''),
      preventAssignment: true,
    }),
  ],
}

const configs = [indexConfig]

export default configs
