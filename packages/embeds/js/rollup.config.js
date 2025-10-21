import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import { babel } from '@rollup/plugin-babel'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import typescript from '@rollup/plugin-typescript'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import fs from 'fs'

const extensions = ['.ts', '.tsx']

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const packageVersion = packageJson.version
const preamble = `// v${packageVersion}`

// Obtener workspace packages de devDependencies
const workspacePackages = Object.entries(packageJson.devDependencies || {})
  .filter(([_, version]) => version.startsWith('workspace:'))
  .map(([name]) => name)

// Lista de paquetes externos (dependencies + workspace packages)
const externalPackages = [
  ...Object.keys(packageJson.dependencies || {}),
  ...workspacePackages,
  '@prisma/client',
]

const indexConfig = {
  input: './src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
  external: (id) => {
    // Los paquetes en node_modules se bundlean
    if (id.includes('node_modules')) return false
    // Marcar como externos los workspace packages y dependencies
    return externalPackages.some((pkg) => id === pkg || id.startsWith(`${pkg}/`))
  },
  onwarn,
  watch: {
    clearScreen: false,
    exclude: ['node_modules/**', 'dist/**', '*.d.ts', '**/*.d.ts'],
  },
  plugins: [
    resolve({
      extensions,
      moduleDirectories: ['node_modules'],
      preferBuiltins: false,
      browser: true,
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['solid', '@babel/preset-typescript'],
      extensions,
    }),
    typescriptPaths({ preserveExtensions: true }),
    postcss({
      plugins: [autoprefixer(), tailwindcss()],
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
    ...indexConfig,
    input: './src/web.ts',
    output: {
      file: 'dist/web.js',
      format: 'es',
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
