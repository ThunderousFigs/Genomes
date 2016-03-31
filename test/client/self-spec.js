describe('Self Controller', function () {
  beforeEach(module('genome.self', 'ngCookies'));

  var $scope, $controller, createController, $cookies, $location, SelfFactory, d3Service, $rootScope, $httpBackend;

  describe('SelfFactory', function () {
    var $http, SelfFactory;

    beforeEach(inject(function (_SelfFactory_, _$http_) {
      $http = _$http_;
      SelfFactory = _SelfFactory_;
    }));

    it('self factory should exist', function () {
      expect(SelfFactory).to.exist;
    });

    it('should have a method `getSnps`', function () {
      expect(SelfFactory.getSnps).to.be.a('function');
    });

  });

  describe('SelfController', function (){

    beforeEach(inject(function($injector) {
      
      // mock out our dependencies
      $rootScope = $injector.get('$rootScope');
      $httpBackend = $injector.get('$httpBackend');
      SelfFactory = $injector.get('SelfFactory');
      $location = $injector.get('$location');
      $scope = $rootScope.$new();
      $cookies = $injector.get('$cookies');
      $controller = $injector.get('$controller');

      createController = function () {
        return $controller('SelfController', {
          $rootScope: $rootScope,
          $cookies: $cookies,
          $scope: $scope,
          SelfFactory: SelfFactory,
          $location: $location,
          d3Service: d3Service
        });
      };
      createController();
    }));

    it('should have a functions to draw and remove the helix', function(){
      expect($rootScope.removeHelix).to.be.a('function');
      expect($scope.draw).to.be.a('function');
      expect($scope.generateData).to.be.a('function');
    });

  });


});