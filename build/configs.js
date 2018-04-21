const path = require('path')
const babel = require('rollup-plugin-babel')
const replace = require('rollup-plugin-replace')
const version = process.env.VERSION || require('../package.json').version
const name = require('../package.json').name
const banner =
`/**
 * ${name} v${version}
 * (c) ${new Date().getFullYear()} zhuoqi_chen@126.com
 * @license MIT
 */`

const resolve = _path => path.resolve(__dirname, '../', _path)

const configs = {
  umdDev: {
    input: resolve('src/index.js'),
    file: resolve(`dist/${name}.js`),
    format: 'umd',
    env: 'development'
  },
  umdProd: {
    input: resolve('src/index.js'),
    file: resolve(`dist/${name}.min.js`),
    format: 'umd',
    env: 'production'
  },
  commonjs: {
    input: resolve('src/index.js'),
    file: resolve(`dist/${name}.common.js`),
    format: 'cjs'
  },
  esm: {
    input: resolve('src/index.js'),
    file: resolve(`dist/${name}.esm.js`),
    format: 'es'
  }
}

function genConfig (opts) {
  const config = {
    input: {
      input: opts.input,
      plugins: [
        replace({
          __VERSION__: version
        }),
        babel()
      ]
    },
    output: {
      banner,
      file: opts.file,
      format: opts.format,
      name: 'Uppy.Qiniu'
    }
  }

  if (opts.env) {
    config.input.plugins.unshift(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }

  return config
}

function mapValues (obj, fn) {
  const res = {}
  Object.keys(obj).forEach(key => {
    res[key] = fn(obj[key], key)
  })
  return res
}

module.exports = mapValues(configs, genConfig)