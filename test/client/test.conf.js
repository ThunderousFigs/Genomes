

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: './',

    hostname: '127.0.0.1',

    // frameworks to use
    frameworks: ['mocha', 'chai', 'sinon'],

    plugins: ['karma-phantomjs-launcher', 'karma-mocha', 'karma-chai', 'karma-sinon'],

    // list of files / patterns to load in the browser
    files: [
      '../../static/lib/angular/angular.js',
      '../../static/lib/angular-cookies/angular-cookies.js',
      '../../static/lib/angular-mocks/angular-mocks.js',
      '../../static/lib/angular-route/angular-route.js',
      '../../static/lib/angular-intro.js/src/angular-intro.js',
      '../../static/lib/jQuery/dist/jquery.min.js',
      '../../static/lib/d3/d3.min.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-animate.min.js',
      'http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-aria.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.10.0/ui-bootstrap-tpls.min.js',
      'https://ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.js',
      '../../static/app/**/*.js',
      '../../static/app/app.js',
      '../client/routing-spec.js',
      '../client/self-spec.js'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    browsers: ['PhantomJS'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 10000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};