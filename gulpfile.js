const fs = require('mz/fs');
const path = require('path');
const co = require('co');

const del = require('del');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const browserSync = require('browser-sync').create();
const cssnext = require('postcss-cssnext');
const merge = require('merge-stream');

const render = require('./utils/render.js');
const mkdir = require('./utils/mkdir.js');
const footer = require('./bower_components/ftc-footer');
process.env.NODE_ENV = 'dev';

gulp.task('prod', function(done) {
  process.env.NODE_ENV = 'prod';
  done();
});

gulp.task('dev', function(done) {
  process.env.NODE_ENV = 'dev';
  done();
});

gulp.task('build-pages',() => {
  return co(function *() {

    const destDir = '.tmp';

    try {
      yield mkdir(destDir);
    } catch (e) {
      console.log(e);
    }

    const flags =  {
      production: process.env.NODE_ENV === 'prod'
    };
    const article = yield fs.readFile('./data/article.json', 'utf8');

    const context = Object.assign( 
      //NOTE:Object.assign(target,..source) 方法用于将所有可枚举的属性的值从一个或多个源对象复制到目标对象。它将返回目标对象。
      JSON.parse(article),
      {
        flags,
        footer
      }
    );
    const html = yield render('index.html',context);

    const outputFile = (process.env.NODE_ENV === 'prod') ? `${path.basename(__dirname)}.html`:'index.html';//如果为prod模式，则输出为perils-of-perception_wyc.html，否则为index.html

    yield fs.writeFile(`${destDir}/${outputFile}`,html,'utf8');
  })
  .then(function() {
    browserSync.reload('*.html');
  }, function(err) {
    console.error(err.stack);
  });
});

gulp.task('styles', () => {
  const DEST = '.tmp/styles';

  const sassOptions = {
    outputStyle:'expanded',
    precision: 10,
    includePaths: ['bower_components']
  };

  if(process.env.NODE_ENV === 'prod') {
    sassOptions.outputStyle = 'compressed';
  }

  return gulp.src('client/styles.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init({loadMaps:true}))
    .pipe($.sass(
      sassOptions
    ).on('error',$.sass.logError))
    .pipe($.postcss([
      cssnext({
        features: {
          colorRgba: false//好像是为true的话会把rgba转成十六进制
        }
      })
    ]))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(DEST))
    .pipe(browserSync.stream());
});


gulp.task('webpack', (done) => {
  if (process.env.NODE_ENV === 'prod') {
    delete webpackConfig.watch;//delete 操作符用于删除对象的某个属性
    webpackConfig.plugins.push(
      new webpack.optimize.UglifyJsPlugin()
    );
    webpackConfig.plugins.push(
      new  webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    );
  }

  webpack(webpackConfig, function (err,stats) {
    if (err) 
      throw new $.util.PluginError('webpack',err);

    $.util.log('[webpack]', stats.toString({
      colors: $.util.colors.supportsColor,
      chunks:false,
      hash:false,
      version: false
    }));

    browserSync.reload('main.js');
    done();
  });
});

gulp.task('copy', () => {
  const core = gulp.src('client/components/core/top.*')
  .pipe(gulp.dest('.tmp/components/core'));
  const adjs = gulp.src('client/components/ad/ad.js')
  .pipe(gulp.dest('.tmp/scripts'));

  return merge(core, adjs);
});

gulp.task('serve', gulp.parallel('copy','build-pages','styles','webpack',function serve() {
  browserSync.init({
    server: {
      baseDir:['.tmp', 'data'],
      index:'index.html',
      routes:{
        '/bower_components':'bower_components',
        '/ig/perils-of-perception':'data/cn'
      }
    }
  });

  gulp.watch('client/**/**/*.scss',gulp.parallel('styles'));
  gulp.watch(['views/**/*.html','data/*.json'],gulp.parallel('build-pages'));
}));

gulp.task('clean', function() {
  return del(['.tmp/**', 'dist']).then(()=>{
    console.log('dir .tmp and dist deleted');
  });
});

gulp.task('build', gulp.series('clean', 'prod', gulp.parallel(
    'copy', 'build-pages', 'styles', 'webpack'), 'dev'));

gulp.task('deploy', () => {
  return gulp.src('.tmp/*.html')
    .pipe($.inlineSource())
    .pipe($.htmlmin({
      collapseWhitespace: true,
      processConditionalComments: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe(gulp.dest('dist'));
});