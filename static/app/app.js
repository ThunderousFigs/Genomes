var app = angular.module('genome', [
  'genome.pool', 
  'genome.self',
  'genome.relatives',
  'ngRoute', 
  'genome.d3Service',
  'genome.sideNav'
])

.config(function ($routeProvider) {
  $routeProvider

    .when('/signin', {
      templateUrl: '/static/app/auth/signin.html',
      controller: 'AuthController'
    })
    .when('/signout', {
      templateUrl: '/static/app/auth/signout.html',
      controller: 'AuthController'
    })
    .when('/pool', {
      templateUrl: '/static/app/pool/pool.html',
      controller: 'PoolController'
    })
    .when('/', {
      templateUrl: '/static/app/pool/pool.html',
      controller: 'PoolController'
    })
    .when('/self/', {
      templateUrl : '/static/app/self/self.html',
      controller : 'SelfController'
    })
    .otherwise({
      redirectTo : '/'
    })
});