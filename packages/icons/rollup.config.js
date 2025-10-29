import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import typescript from '@rollup/plugin-typescript'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import fs from 'fs'
import url from '@rollup/plugin-url'
import dts from 'rollup-plugin-dts'
import { nodeResolve } from '@rollup/plugin-node-resolve'

const extensions = ['.ts', '.tsx']

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const packageVersion = packageJson.version
const preamble = `// v${packageVersion}`
const externalPackages = [
  ...Object.keys(packageJson.peerDependencies || {}),
  ...Object.keys(packageJson.dependencies || {}),
]

const indexConfig = {
  input: './src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
  external: (id) => {
    if (id.includes('node_modules')) return false
    return externalPackages.some((pkg) => id === pkg || id.startsWith(`${pkg}/`))
  },
  onwarn,
  watch: {
    clearScreen: false,
    exclude: ['node_modules/**', 'dist/**', '*.d.ts', '**/*.d.ts'],
  },
  plugins: [
    url({
      include: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
      limit: 0,
      publicPath: '/',
      destDir: 'dist/assets',
      fileName: '[name][extname]',
    }),
    resolve({
      extensions,
      moduleDirectories: ['node_modules'],
      preferBuiltins: false,
      browser: true,
      mainFields: ['module', 'main', 'browser'],
    }),
    commonjs({
      include: /node_modules/,
    }),
    typescriptPaths({ preserveExtensions: true }),
    typescript({
      noEmitOnError: !process.env.ROLLUP_WATCH,
    }),
    postcss({
      plugins: [autoprefixer()],
      extract: false,
      modules: false,
      autoModules: false,
      minimize: true,
      inject: false,
    }),
    terser({
      format: { preamble },
    }),
    replace({
      'process.env.NPM_TOKEN': JSON.stringify(process.env.NPM_TOKEN || ''),
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
  ],
}

const configs = [
  indexConfig,
  {
    input: './src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [
      nodeResolve(),
      commonjs(),
      dts({
        respectExternal: true,
        compilerOptions: {
          skipLibCheck: true,
          noEmitOnError: false,
        },
      }),
    ],
    external: [...externalPackages, /\.(svg|png|jpg|jpeg|gif)$/],
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY' || warning.code === 'UNRESOLVED_IMPORT') {
        return
      }
      warn(warning.message)
    },
  },
]

function onwarn(warning, warn) {
  if (warning.code === 'CIRCULAR_DEPENDENCY') {
    return
  }

  warn(warning.message)
}

export default configs
