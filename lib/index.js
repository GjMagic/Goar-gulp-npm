const { src, dest, parallel, series, watch } = require('gulp')

const browserSync = require('browser-sync')
const bs = browserSync.create()

const del = require('del')

const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()

const cwd = process.cwd();
let config = {
  // default config
}

try {
  const loadConfig = require(`${cwd}/config.js`)
  config = Object.assign({}, config, loadConfig);
} catch (e) {}

const { builds } = config
const { dist, temp, public, paths } = builds
const { styles, scripts, pages, images, fonts } = paths

const clean = () => del([dist, temp])

const style = () =>
  src(styles, { base: builds.src, cwd: builds.src })
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest(temp))
    .pipe(bs.reload({ stream: true }))

const script = () =>
  src(scripts, { base: builds.src, cwd: builds.src })
    .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
    .pipe(dest(temp))
    .pipe(bs.reload({ stream: true }))

const page = () =>
  src(pages, { base: builds.src, cwd: builds.src })
    .pipe(plugins.swig({ data: config.data, defaults: { cache: false } }))
    .pipe(dest(temp))
    .pipe(bs.reload({ stream: true }))

const image = () =>
  src(images, { base: builds.src, cwd: builds.src })
    .pipe(plugins.imagemin())
    .pipe(dest(dist))

const font = () =>
    src(fonts, { base: builds.src, cwd: builds.src })
      .pipe(plugins.imagemin())
      .pipe(dest(dist))

const extra = () =>
  src('**', { base: public, cwd: public })
    .pipe(dest(dist))

const serve = () => {
  watch(styles, { cwd: builds.src }, style)
  watch(scripts, { cwd: builds.src }, script)
  watch(pages, { cwd: builds.src }, page)

  watch([images, fonts], { cwd: builds.src }, bs.reload)
  watch(['**'], { cwd: public }, bs.reload)

  bs.init({
    notify: false,
    // files: 'dist/**',
    server: {
      baseDir: [temp, builds.src, public],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}

const useref = () =>
  src(pages, { base: temp, cwd: temp })
    .pipe(plugins.useref({ searchPath: [temp, '.'] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
    })))
    .pipe(dest(dist))

const compile = parallel(style, script, page)

// 上线之前执行的任务
const build = series(clean, parallel(series(compile, useref), image, font, extra))

const dev = series(compile, serve)

module.exports = {
  clean,
  build,
  dev,
}