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

  it('Should have /tree route, template, and controller', function () {
    expect($route.routes['/tree']).to.be.defined;
    expect($route.routes['/tree'].controller).to.equal('TreeController');
    expect($route.routes['/tree'].templateUrl).to.equal('/static/app/tree/tree.html');
  });

  it('Should have /self route, template, and controller', function () {
    expect($route.routes['/self']).to.be.defined;
    expect($route.routes['/self'].controller).to.equal('SelfController');
    expect($route.routes['/self'].templateUrl).to.equal('/static/app/self/self.html');
  });

});