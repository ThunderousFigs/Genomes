 describe('Routing', function () {
  var $route;
  var AuthController;

  beforeEach(function(){
    module('genome');

    inject(function ($injector) {
      $route = $injector.get('$route');
    });
  });


  it('Should have /signin route, template, and controller', function () {
    expect($route.routes['/']).to.be.defined;
    expect($route.routes['/'].redirectTo).to.equal('/self');
    expect($route.routes['/signin'].controller).to.equal('AuthController');
    expect($route.routes['/signin'].templateUrl).to.equal('/');
  });

  it('Should have /pool route, template, and controller', function () {
    expect($route.routes['/pool']).to.be.defined;
    expect($route.routes['/pool'].controller).to.equal('PoolController');
    expect($route.routes['/pool'].templateUrl).to.equal('/static/app/pool/pool.html');
  });

  it('Should have /self route, template, and controller', function () {
    expect($route.routes['/self']).to.be.defined;
    expect($route.routes['/self'].controller).to.equal('SelfController');
    expect($route.routes['/self'].templateUrl).to.equal('/static/app/self/self.html');
  });

});