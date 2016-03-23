angular.module('genome.auth', ['ngCookies'])

.controller('AuthController', function($scope, $rootScope, $cookies, $location, $timeout, $window, AuthFactory) {
  $scope.user = {};

  $rootScope.signOut = function() {
    AuthFactory.signOut();
    
    $timeout(function() {
      $location.path('/signout');
    }, 400);
  };

  $scope.getUserProfileId = function () {
    $rootScope.user_profile_id = $cookies.user_profile_id;
  };

  $scope.getUserProfileId();
  
})
   
.factory('AuthFactory', function($http, $cookies) {

  var isAuth = function() {
    return !!$cookies.user_profile_id;
  };

  var signOut = function() {
    delete $cookies['user_profile_id'];
    delete $cookies['user_first_name'];
  };

  return {
    signOut: signOut,
    isAuth: isAuth
  };
});