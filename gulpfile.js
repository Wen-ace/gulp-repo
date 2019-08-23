const gulp = require('gulp');

const autoprefixer = require('gulp-autoprefixer');

const babel = require('gulp-babel');

const cleanCss = require('gulp-clean-css');

const gulpConnect = require('gulp-connect');

const proxy = require('http-proxy-middleware');

const less = require('gulp-less');

// const uglify = require('gulp-uglify');

/**
 * hash 值添加
 */
const rev = require('gulp-rev');

const revCollector = require('gulp-rev-collector');

const del = require('del');


const buildBaseUrl = 'dist';
const tmpBaseUrl = 'tmp';

let isHttps = false;
// let isHttps = true;
// let isMock = true;
let isMock = false;
// let proxyUrl = 'http://172.16.8.139:7000/';
let proxyUrl = 'http://king.szckhd.com/';

let cdnUrl = '//jk-hdcdn.ckhdjk.com/obon';
let proxyPrefix = '/act';
let port = '8000';
let livereloadPort = '35730';

const paths = {
    css: {
        src: 'src/css/**/*',
        dest: buildBaseUrl + '/css/',
        tmp: tmpBaseUrl + '/css/'
    },
    js: {
        src: 'src/js/**/*.js',
        dest: buildBaseUrl + '/js/',
        tmp: tmpBaseUrl + '/js/'
    },
    img: {
        src: 'src/images/**/*',
        dest: buildBaseUrl + '/images/',
        tmp: tmpBaseUrl + '/images/'
    },
    html: {
        src: 'src/**/*.html',
        dest: buildBaseUrl + '/'
    }
};

function clean() {
    return del([buildBaseUrl]);
}

function css() {
    return gulp.src(paths.css.src)
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(rev())
        .pipe(gulp.dest(paths.css.dest))
        .pipe(rev.manifest())
        .pipe(gulp.dest(paths.css.tmp))
        .pipe(gulpConnect.reload())
}
function devCss() {
    return gulp.src(paths.css.src)
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest(paths.css.dest))
        .pipe(gulpConnect.reload())
}

function cssRev() {
    return gulp.src(['tmp/**/*.json', paths.css.dest + '*.css'])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                '../images': function (manifest_value) {
                    let imgUrl = '';
                    if (cdnUrl.indexOf('//') > -1) {
                        imgUrl = cdnUrl;
                    } else {
                        imgUrl = '..'
                    }
                    return imgUrl + '/images/' + manifest_value;
                }
            }
        }))
        .pipe(gulp.dest('dist/css'))
}


function js() {
    return gulp.src(paths.js.src)
        .pipe(babel({
            presets: ['@babel/env']
        }))
        // .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(paths.js.dest))
        .pipe(rev.manifest())
        .pipe(gulp.dest(paths.js.tmp))
        .pipe(gulpConnect.reload())
}

function jsRev() {
    return gulp.src(['tmp/**/*.json', paths.js.dest + '*.js'])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                'images/': function (manifest_value) {
                    let imgUrl = '';
                    if (cdnUrl.indexOf('//') > -1) {
                        imgUrl = cdnUrl;
                    } else {
                        imgUrl = '.'
                    }
                    return imgUrl + '/images/' + manifest_value;
                }
            }
        }))
        .pipe(gulp.dest('dist/js'))
}
function devJs() {
    return gulp.src(paths.js.src)
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest(paths.js.dest))
        .pipe(gulpConnect.reload())
}

function img() {
    return gulp.src(paths.img.src)
        .pipe(rev())
        .pipe(gulp.dest(paths.img.dest))
        .pipe(rev.manifest())
        .pipe(gulp.dest(paths.img.tmp))
        .pipe(gulpConnect.reload())
}
function devImg() {
    return gulp.src(paths.img.src)
        .pipe(gulp.dest(paths.img.dest))
        .pipe(gulpConnect.reload())
}

function htmlRev() {
    return gulp.src(['tmp/**/*.json', paths.html.src])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                './css': function (manifest_value) {
                    return cdnUrl + '/css/' + manifest_value;
                },
                './js': function (manifest_value) {
                    return cdnUrl + '/js/' + manifest_value;
                },
                './images': function (manifest_value) {
                    return cdnUrl + '/images/' + manifest_value;
                }
            }
        }))
        .pipe(gulp.dest('dist'))
        .pipe(gulpConnect.reload())
}
function devHtml() {
    return gulp.src(paths.html.src)
        .pipe(gulp.dest('dist'))
        .pipe(gulpConnect.reload())
}

let os = require('os');

function getIp() {
    let ips = os.networkInterfaces();
    for (let dn in ips) {
        let iface = ips[dn];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}
const childProcess = require('child_process');

function openBrowser() {
    if (process.platform === 'win32') {
        childProcess.exec(`start ${isHttps ? 'https' : 'http'}://${getIp()}:${port}`);
    } else {
        console.log('不是windows 系统！');
    }
}
openBrowser();

const { mockFn } = require('./httpMock');

const fs = require('fs');
const options = {
    key: fs.readFileSync('E:/keys/.frp/server.key'),
    cert: fs.readFileSync('E:/keys/.frp/server-2.crt')
};


function connect() {
    return gulpConnect.server({
        host: 'localhost',
        port: port,
        name: 'my server',
        livereload: { port: livereloadPort },
        ...(isMock ? { middleware: mockFn, } : {
            middleware(connect, opt) {
                return [
                    proxy(proxyPrefix, {
                        target: proxyUrl,
                        changeOrigin: true
                    })
                ]
            },
        }),
        ...(isHttps ? { https: options } : {})
    })
}
function connect2() {
    return gulpConnect.server({
        host: getIp(),
        port: port,
        name: 'my server2',
        livereload: { port: livereloadPort },
        ...(isMock ? { middleware: mockFn, } : {
            middleware(connect, opt) {
                return [
                    proxy(proxyPrefix, {
                        target: proxyUrl,
                        changeOrigin: true
                    })
                ]
            },
        }),
        ...(isHttps ? { https: options } : {})
    })
}

// watch
function watch() {
    // livereload.listen();
    gulp.watch(paths.css.src, devCss);
    gulp.watch(paths.html.src, devHtml);
    gulp.watch(paths.js.src, devJs);
    gulp.watch(paths.img.src, devImg);
}



const unit = gulp.series(clean, img, gulp.parallel(css, js), cssRev, jsRev, htmlRev, gulp.parallel(watch, connect, connect2));
const dev = gulp.series(clean, gulp.parallel(devCss, devJs, devImg, devHtml, watch, connect, connect2));

gulp.task('build', unit);

gulp.task('default', dev);