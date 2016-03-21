angular.module('genome.auth', [])

.controller('AuthController', function($scope, $rootScope, $location, $timeout, AuthFactory) {
  $scope.user = {};

  $rootScope.signOut = function() {
    // Remove cookies
    AuthFactory.signOut();
    // Delay redirect to /signin in case of cookie delays
    $timeout(function() {
      $location.path('/signin')
    }, 2000);
  };

})
  
 
.factory('AuthFactory', function($http, $cookies) {

  var isAuth = function() {
    console.log($cookies.get('user_profile_id'))
    return !!$cookies.get('user_profile_id');
  };

  var signOut = function() {
    // Remove user info from cookies and clear localStorage
    $cookies.remove("user_profile_id");

    $window.localStorage.removeItem('');
  };

  // Nothing has access to the functions in factory unless we return an object with references to those functions
  return {
    signOut: signOut,
    isAuth: isAuth
  }
})