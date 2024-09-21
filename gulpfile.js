const { src, dest, series, watch } = require('gulp');
const htmlMin = require('gulp-htmlmin');
const autoprefixes = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass')(require('sass'));
const svgSprite = require('gulp-svg-sprite');
const image = require('gulp-imagemin');
const include = require('gulp-file-include');
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')
const browserSync = require('browser-sync').create();

const clean = () => {
	return del(['public'])
}

const resources = () => {
	return src('src/fonts/**', { encoding: false })
		.pipe(dest('public/css/fonts'))
}

const stylesPublic = () => {
  return src('src/styles/**/*.scss')
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixes({
        cascade: false
    }))
    .pipe(cleanCSS({
        level: 2
    }))
    .pipe(dest('public/css'));
}

const stylesDev = () => {
  return src('src/styles/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(dest('public/css'));
}

const pages = () => {
  return src(['src/pages/**/*.html'])
    .pipe(include({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(dest('public'))
    .pipe(browserSync.stream())
}

const htmlMinify = () => {
	return src('src/pages/**/*.html')
	.pipe(htmlMin({
		collapseWhitespace: true,
	}))
	.pipe(dest('public'))
	.pipe(browserSync.stream())
}

const svgSprites = () => {
	return src('src/img/svg/**/*.svg')
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../sprite.svg'
				}
			}
		}))
		.pipe(dest('public'))
}

const images = () => {
	return src([
		'src/img/**/*.jpg',
		'src/img/**/*.png',
		'src/img/**/*.svg',
		'src/img/**/*.jpeg',
	], {
		encoding: false
	})
		.pipe(image())
		.pipe(dest('public/images'))
}

const imagesDev = () => {
	return src('src/img/**', { encoding: false })
		.pipe(dest('public/images'))
}

const watchFiles = () => {
	browserSync.init({
		server: {
			baseDir: 'public'
		}
	})
}

watch('src/**/*.html', htmlMinify)
watch('src/**/*.scss', stylesPublic)
watch('src/**/*.scss', stylesDev)
watch('src/img/svg/**/*.svg', svgSprites)
watch('src/fonts/**', resources)
watch('src/**/*', pages)

exports.projectStyles = stylesPublic
exports.htmlMinify = htmlMinify
exports.clean = clean
exports.dev = series(clean, resources, pages, stylesDev, imagesDev, svgSprites, watchFiles)
exports.default = series(clean, resources, htmlMinify, pages, stylesPublic, images, svgSprites)
