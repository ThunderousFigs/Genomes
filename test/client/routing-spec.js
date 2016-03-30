// 'use strict';

describe('Routing', function () {
  var $route;
  var AuthController;

  beforeEach(function(){
    module('genome');

    inject(function ($injector) {
      // $routeProvider = $injector.get('$routeProvider');
      // $location = $injector.get('$location');
      // $routeParams = $injector.get('$routeParams');
      $route = $injector.get('$route');
      // AuthController = $injector.get('AuthController')
    });
  });


  it('Should have /signin route, template, and controller', function () {
    expect($route.routes['/']).to.be.defined;
    expect($route.routes['/'].redirectTo).to.equal('/self');
    expect($route.routes['/signin'].controller).to.equal('AuthController');
    expect($route.routes['/signin'].templateUrl).to.equal('/');
  });

});
