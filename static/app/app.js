var app = angular.module('genome', [
  'genome.pool',
  'genome.self',
  'genome.relatives',
  'ngRoute',
  'ngCookies',
  'genome.d3Service',
  'genome.sideNav',
  'genome.auth',
  'genome.directive',
  'genome.footer',
  'genome.about',
  'ngMaterial',
  'angular-intro'
])

.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      redirectTo: '/self'
    })
    .when('/signin', {
      templateUrl: '/',
      controller: 'AuthController'
    })
    .when('/signout', {
      templateUrl: '/templates/landing.html',
      authenticate: true
    })
    .when('/pool', {
      templateUrl: '/static/app/pool/pool.html',
      controller: 'PoolController',
      authenticate: true
    })
    .when('/self', {
      templateUrl: '/static/app/self/self.html',
      controller: 'SelfController',
      authenticate: true
    })
    .when('/about', {
      templateUrl: '/static/app/about/about.html',
      controller: 'AboutController',
      authenticate: true
    })
    .otherwise({
      redirectTo : '/signin'
    });
})

.run(function($rootScope, $location, $cookies, AuthFactory){

  $rootScope.$on('$routeChangeStart', function(evt, next, current){
    if(next.$$route && next.$$route.authenticate && ! AuthFactory.isAuth()){
      $location.path('/signin');
    }
  });
});
