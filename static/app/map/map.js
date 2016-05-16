angular.module('genome.map', ['angular-intro'])
.controller('MapController', function($scope, d3Service, Relatives, $rootScope, $window, $location) {

  var map;

  //SET ROOTSCOPE TO CURRENT VIEW
  var whichView = function() {
    $rootScope.view = $location.$$path;
  };
  whichView();

  //TRANSITION VIEW TO TREE
  $rootScope.showTree = function(){
    console.log('show tree');
    clearInterval($rootScope.globeSpin);
    $rootScope.killGlobe();
    $rootScope.curPage = '/tree';
    $location.path('/tree/');
  };

  var relativesList = [];
  $scope.relatives = $rootScope.rels;

  //CREATE SVG DATAMAP
  var createMap = function (rotationNums) {
    //SET SIZE OF MAP DIV TO SIZE OF WINDOW
    function sizeMap(){
      var w = $window.innerWidth;
      var h = $window.innerHeight;
      $('.mapCanvas').width(w).height(h);
    }
    sizeMap();
    map = new Datamap({
        scope: 'world',
        //element: document.getElementById('mainCanvas'),
        element: document.getElementsByClassName('mapCanvas')[0],
        projection: 'orthographic',
        geographyConfig: {
            popupOnHover: false,
            highlightOnHover: false
        },
        fills: {
            defaultFill: '#34495e'
        },
        projectionConfig: {
          rotation: rotationNums
        },
        bubblesConfig: {
          popupOnHover: false,
          animate: false,
          highlightOnHover: false
        }
    });
    map.graticule();
    //CREATE BUBBLE FOR EACH USER RELATIVE
    createBubbleHover();
  };

  //ASSIGN ROTATION PROPERTIES TO DATAMAP
  var yaw = 90;
  var roll = -17;

  //METHODS HANDLING GLOBE SPIN INTERVAL AND REMOVAL
  var keepSpinning = function () {
    $('svg.datamap').remove();
    createMap([yaw+=1, roll]);
  };

  $rootScope.killGlobe = function () {
    $('svg.datamap').remove();
  };

  $rootScope.globeSpin = setInterval(keepSpinning, 40);

  var createBubbleHover = function() {
    map.bubbles(relativesList, {
      popupTemplate: function (geo, data) {
          return '<div>relatives</div>';
      }
    });
  };

  //CREATE BUBBLE DATA FOR EACH RELATIVE
  var makeNewBubbleData = function() {
    var geoInfo = {
      'United States': [36.5, -101.25, 'USA'],
      'Canada': [54.51, -100.1953, 'CAN'],
      'South America': [-11.2, -56.25, 'SAM'],
      'Europe': [48.4419, 19.07, 'EUR'],
      'India': [21.348, 78.31, 'IND'],
      'Russia': [61.17, 90.000, 'RUS'],
      'Asia': [36.15, 105.468, 'ASN'],
      'Australia': [-25.05, 134, 'AUS'],
      'Africa': [7.612, 18.6328, 'AFR']
    };

    var fills = {
        'USA': '#FFFC00'
    };

    for(var i = 0; i < $scope.relatives.length; i++) {
      for (var places in geoInfo) {
        if ($scope.relatives[i].birthplace === places) {
          relativesList.push({
            name: $scope.relatives[i].first_name + ' ' + $scope.relatives[i].last_name,
            country: $scope.relatives[i].birthplace,
            relationship: $scope.relatives[i].relationship,
            residence: $scope.relatives[i].residence,
            similarity: $scope.relatives[i].similarity,
            latitude: (geoInfo[places][0] + (Math.floor(Math.random() * 10)+1)),
            longitude: (geoInfo[places][1] + (Math.floor(Math.random() * 10)+1)),
            borderColor: fills['USA'],
            borderWidth: 4,
            radius: 7,
            fillOpacity: 1,
            popupOnHover: false
          });
        }
      }
    }
  };

  //GRAB RELATIVES FROM DB AND INTITIALIZE
   $scope.getRelatives = function() {
     Relatives.getRelatives()
     .then(function(relatives) {
       $scope.relatives = relatives.data.relativeList;
       makeNewBubbleData();
       createMap();
     }, function(err) {
       console.error('Error retrieving relatives: ', err);
     });
   };
   $scope.getRelatives();
});