// Karma configuration
// Generated on Fri Mar 25 2016 11:58:55 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'mocha', 'chai'],


    // list of files / patterns to load in the browser
    files: [
      // Load up angular dependencies
      'static/lib/angular/angular.min.js',
      'static/lib/angular-cookies/angular.cookies.min.js',
      'static/lib/angular-datamaps/dist/angular-datamaps.min.js',
      'static/lib/jQuery/dist/jquery.min.js',
      'static/lib/angular-mocks/angular-mocks.js',
      'static/lib/angular-route/angular-route.min.js',

      "http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js",
      "http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-animate.min.js",
      "http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-aria.min.js",
      "http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-messages.min.js",
      "http://ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.min.js",

      // Load app files
      'static/app/**/*.js',

      // Load test specs
      'test/client/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],

    plugins: ['karma-mocha', 'karma-jasmine'],
    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
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


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'], //add phantomjs


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}

