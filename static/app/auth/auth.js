angular.module('genome.auth', [])

.controller('AuthController', function($scope, $rootScope, $cookies, $location, $timeout, $window, AuthFactory) {
  $scope.user = {};

  $rootScope.signOut = function() {
    // Remove cookies
    console.log('Signout being called');
    AuthFactory.signOut();
    // Delay redirect to landing page in case of cookie delays
    $timeout(function() {
      $location.path('/signout');
    }, 2000);
  };

  $scope.getUserProfileId = function () {
    $rootScope.user_profile_id = $cookies['user_profile_id'];
  };

  $scope.getUserProfileId();
})
  
 
.factory('AuthFactory', function($http, $cookies) {

  var redirectToLanding = function(){
    return $http({
      method: 'GET',
      url: '/'
    })
  };

  var isAuth = function() {
    return !!$cookies['user_profile_id'];
  };

  var signOut = function() {
    // Remove user info from cookies
    $cookies["user_profile_id"] = "";
    console.log($cookies);
  };

  return {
    signOut: signOut,
    isAuth: isAuth,
    redirectToLanding: redirectToLanding
  }
})