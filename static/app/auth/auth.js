angular.module('genome.auth', [])

.controller('AuthController', function($scope, $rootScope, $cookies, $location, $timeout, AuthFactory) {
  $scope.user = {};

  $rootScope.signOut = function() {
    // Remove cookies
    AuthFactory.signOut();
    // Delay redirect to /signin in case of cookie delays
    $timeout(function() {
      $location.path('/signin')
    }, 2000);
  };

  $scope.getUserProfileId = function () {
    $rootScope.user_profile_id = $cookies['user_profile_id'];
  };

  $scope.getUserProfileId();
})
  
 
.factory('AuthFactory', function($http, $cookies) {

  var isAuth = function() {
    return !!$cookies['user_profile_id'];
  };

  var signOut = function() {
    // Remove user info from cookies
    $cookies["user_profile_id"] = "";
  };

  return {
    signOut: signOut,
    isAuth: isAuth
  }
})