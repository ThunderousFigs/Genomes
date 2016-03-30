'use strict';

describe('Self Controller', function () {
  beforeEach(module('genome.self'));

  var $scope, $cookies, $location, SelfFactory, d3Service, $rootScope;


  describe('Helix Production', function () {
    var $http, SelfFactory;

    beforeEach(inject(function (_SelfFactory_, _$http_) {
      $http = _$http_;
      SelfFactory = _SelfFactory_;
    }));

    it('should exist', function () {
      expect(SelfFactory).to.exist;
    });

    xit('should have a method `getAll`', function () {
      expect(Links.getAll).to.be.a('function');
    });

    xit('should have a method `addOne`', function () {
      expect(Links.addOne).to.be.a('function');
    });

    xit('should get all links with `getAll`', function () {
      var mockResponse = [
        { title: 'Twitter',
          url: 'https://twitter.com' },
        { title: 'Reddit',
          url: 'https://reddit.com/r/javascript' }
      ];

      $httpBackend.expect('GET', '/api/links').respond(mockResponse);

      Links.getAll().then(function (links) {
        expect(links).to.deep.equal(mockResponse);
      });

      $httpBackend.flush();
    });

    xit('should add a new link with `addOne`', function () {
      var github = { url: 'https://github.com/hackreactor-labs' };

      $httpBackend
        .expect('POST', '/api/links', JSON.stringify(github))
        .respond(201, {
          url: 'https://github.com/hackreactor-labs',
          title: 'Hack Reactor Labs'
        });

      Links.addOne(github).then(function (resp) {
        expect(resp.status).to.equal(201);
        expect(resp.data.title).to.equal('Hack Reactor Labs');
      });

      $httpBackend.flush();
    });

  });

});