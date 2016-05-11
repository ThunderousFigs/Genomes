angular.module('genome.map', ['angular-intro'])
.controller('MapController', function($scope, d3Service, Relatives, $rootScope, $window, $location) {
  var map;
  var whichView = function() {
    $rootScope.view = $location.$$path;
  };
  whichView();

  var relativesList = [];
  $scope.relatives = $rootScope.rels;

  var svg;

  var createMap = function (rotationNums) {
    map = new Datamap({
        element: document.getElementById('mainCanvas'),
        scope: 'world',
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
    createBubbleHover();
    //create bubbles for each relative in the relative list, after parsing with makeNewBubbleData
  };

  var yaw = 90;
  var roll = -17;

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

  //Grab relatives from the database, then initialize bubbles
   $scope.getRelatives = function() {
     svg = d3.select('.mapCanvas').append("svg")
              .attr("fill", "transparent")
              .attr("width", $window.innerWidth)
              .attr("height", $window.innerHeight - 500)
              .attr("id", "mainCanvas")
              .append("g");

     Relatives.getRelatives()
     //Can refactor to return the promise values within the relatives factory if so desired
     .then(function(relatives) {
       //Refactor? potentially redundant addition of relatives to $scope and $rootScope.
       $scope.relatives = relatives.data.relativeList;
       makeNewBubbleData();
       createMap();
     }, function(err) {
       console.error('Error retrieving relatives: ', err);
     });
   };
   //Initialize the page with a call to getRelatives
   $scope.getRelatives();
});