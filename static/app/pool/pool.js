angular.module('genome.pool', ['angular-intro'])
.controller('PoolController', function($scope, d3Service, Relatives, $rootScope, $window, $location) {

  //Containers for Relatives' Data
  var circle;
  $scope.relatives = [];
  $rootScope.rels = [];
  $scope.circles = [];

  var boardHeight = $window.innerHeight;
  var boardWidth = $window.innerWidth;
  var relativesList = [];

  var createMap = function () {
    var map = new Datamap({
        element: document.getElementById('mainCanvas'),
        scope: 'world',
        geographyConfig: {
            popupOnHover: false,
            highlightOnHover: false
        },
        fills: {
            'USA': '#4CAF50',
            'RUS': '#4DB6AC',
            'EUR': '#d62728',
            'CAN': '#AB47BC',
            'ASN': '#f44336',
            'SAM': '#FFF59D',
            'AUS': '#00838F',
            'AFR': '#FB8C00',
            defaultFill: '#607D8B'
        },
        data: {
            'USA': {fillKey: 'USA'},
            'RUS': {fillKey: 'RUS'},
            'EUR': {fillKey: 'EUR'},
            'CAN': {fillKey: 'CAN'},
            'SAM': {fillKey: 'SAM'},
            'AUS': {fillKey: 'AUS'},
            'AFR': {fillKey: 'AFR'},
            'ASIA': {fillKey: 'ASN'}
        }
    });

    //create bubbles for each relative in the relative list, after parsing with makeNewBubbleData
    map.bubbles(relativesList, {
      popupTemplate: function (geo, data) {
              return ['<div class="hoverinfo">' +  data.name,
              '<br/>Relationship: ' +  data.relationship,
              '<br/>Similarity: ' +  data.similarity,
              '<br/>Residence: ' +  data.residence + '',
              '</div>'].join('');
      }
    });
  };

   $scope.makeNewBubbleData = function() {
    var geoInfo = {
      'United States': [39.5, -98.43, 'USA'],
      'Canada': [54.51, -100.1953, 'CAN'],
      'South America': [-11.2, -56.25, 'SAM'],
      'Europe': [48.4419, 19.07, 'EUR'],
      'India': [21.348, 78.31, 'IND'],
      'Russia': [61.17, 90.000, 'RUS'],
      'Asia': [36.15, 105.468, 'ASN'],
      'Australia': [-25.05, 134, 'AUS'],
      'Africa': [7.612, 18.6328, 'AFR']
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
            fillKey: geoInfo[places][2],
            radius: 7
          })
        }
      }
    }
  };

  var moveBubblesToRegions = function() {
    d3.selectAll("circle").data($scope.circles).attr('r', function(d){return d.radius;});
  }

    //Move Bubbles Back to Center of Page
   var replaceBubblesInCenter = function() {
      $scope.circles.forEach(function(bubble){
        bubble['cx'] = bubble['oldCX'];
        bubble['cy'] = bubble['oldCY'];
        bubble['radius'] = bubble['oldRadius'];
      })
      //Explicitly restate the force layout
      var nodes = $scope.circles;
      var force = d3.layout.force()
      .nodes(nodes)
      .size([width, height])
      .gravity(0)
      .charge(0)
      .on("tick", tick)
      .start();
      d3.selectAll("circle").data($scope.circles).attr('r', function(d){return d.radius;}).call(force.drag);
  };

  //Toggle Side Nav Icons
  var whichView = function() {
    $rootScope.view = $location.$$path;
  }
  whichView();
  //End Toggle Side Nav Icons

  //Toggle Map
  var mapShowing = false;

  var toggleMap = function() {
    if(!mapShowing) {
      d3.selectAll("circle").attr("visibility", "hidden");
      createMap();
      mapShowing = true;
    } else {
      initialize();
      $rootScope.removeMap();
      mapShowing = false;
    }
  }

  $rootScope.filterRegions = function() {
    toggleMap();
  };

  $rootScope.removeMap = function () {
    d3.select("svg.datamap").remove();
  };
  //End Map Toggle

  //Pop Modal
  $scope.popModal = {
    name: '',
    similarity: '',
    image: '',
    relationship: '',
    age: 0
  };

  //pop up message displaying relative data when user clicks on a bubble
  var showRelative = function(bubble) {
    $scope.popModal.name = bubble.relative.first_name + ' ' + bubble.relative.last_name;
    $scope.popModal.similarity = (bubble.relative.similarity*100).toFixed(2) + "% of your DNA";
    $scope.popModal.relationship = bubble.relative.relationship  || "Unknown";
    $scope.popModal.age = bubble.relative.birth_year ? (new Date().getFullYear() - bubble.relative.birth_year) : "Unknown";
    $scope.popModal.image = bubble.relative.picture_url || '../../../static/assets/hipDNA.png';
    $scope.popModal.ancestry = bubble.relative.ancestry || "Unknown";
    $scope.popModal.birthplace = bubble.relative.birthplace  || "Unknown";
  };
  //End Pop Modal

  //Force and Bubble Layout Settings
  var width = $window.innerWidth //- margin.left - margin.right;
  var height = $window.innerHeight //- margin.top - margin.bottom;
  var padding = 5;
  var radius = d3.scale.sqrt().range([0, 12]);
  var colorScheme = ['#1abc9c', '#2ecc71', '#f1c40f', '#27ae60', '#3498db', '#9b59b6', '#2980b9','#8e44ad','#e67e22','#d35400','#e74c3c', '#c0392b', '#bdc3c7', '#f39c12', '#95a5a6'];
  //End force and bubble layout settings

  //Grab the pool as a canvas for our bubbles
  var svg = d3.select('.pool').append("svg")
    .attr("fill", "transparent")
    .attr("width", $window.innerWidth)
    .attr("height", $window.innerHeight)
    .attr("id", "mainCanvas")
    .append("g")
    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Create Initial bubbles
  var createBubbles = function(circleData) {
    nodes = $scope.circles;
    //Add d3 force effect to layout
    var force = d3.layout.force()
      .nodes(nodes)
      .size([width, height])
      .gravity(0)
      .charge(0)
      .on("tick", tick)
      .start();
    //Add bubbles to DOM
    circle = svg.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .on('mouseover', function(d){

        // Get this bubble's x/y values, then augment for the tooltip
        // This will allow the tool tip to be centered in the middle of the bubble
        var xPosition = parseFloat(d3.select(this).attr("cx"));
        var yPosition = parseFloat(d3.select(this).attr("cy"));

        var similarity = d3.select(this)[0][0].__data__.relative.similarity * 100;
        svg.append("text")
          .attr("id", "tooltip")
          .attr("x", xPosition)
          .attr("y", yPosition)
          .attr("text-anchor", "middle")
          .attr("font-family", "sans-serif")
          .attr("font-size", "13px")
          .attr("font-weight", "bold")
          .attr("fill", "black")
          .attr("pointer-events", "none")
          .text(similarity.toFixed(2) + "%");

        d3.select(this)
          .attr("opacity", ".7");

      })
      .on('mouseout', function(){
        d3.select('#tooltip').remove();
        d3.select(this)
          .attr("opacity", "1");
      })
      .on('click', function(bubble) {
        $scope.$apply(
          showRelative(bubble)
        );
      })
      .attr("data-target", "#myModal")
      .attr("data-toggle", "modal")
      .attr("r", function (d) {
          return d.radius;
      })
      .style('fill', function(d) {
         return d.color;
       })
      .call(force.drag);
  };
  //End initial bubble creation

  //Control bubble entry onto DOM and magnetic resistance to each other
  function tick(e) {
    circle.each(gravity(0.8 * e.alpha))
    .each(collide(0.5))
    .attr("cx", function (d) {
      return d.x;
    })
    .attr("cy", function (d) {
      return d.y;
    });
  }

  // Move nodes toward cluster focus.
  function gravity(alpha) {
    return function (d) {
      d.y += (d.cy - d.y) * alpha;
      d.x += (d.cx - d.x) * alpha;
    };
  }

  // Resolve collisions between nodes.
  function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function (d) {
      var r = d.radius + radius.domain()[1] + padding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
      quadtree.visit(function (quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }

  //After grabbing relatives from the DB, create a bubbles array based on length of relatives array
  var initialize = function() {
    //set up range of values in similarity between all relatives
    var range = [];
    $scope.relatives.map(function (relative) {
      range.push(relative.similarity);
    }).sort(function (a, b) {
      return b - a;
    });

    for (var i = 0; i < $scope.relatives.length || 0; i++) {
      var similarity = $scope.relatives[i].similarity;
      var similarRange = (range[0] - range[range.length-1]);

      if (similarRange > 0 && similarRange < 0.2) {
        if (similarity <= 0.01){
          similarity = 0.03;
        } else if (similarity > 0.01 && similarity < 0.012) {
          similarity = 0.035;
        } else if (similarity >= 0.012 && similarity < 0.015) {
          similarity = 0.04;
        } else if (similarity >= 0.015 && similarity < 0.02) {
          similarity = 0.05;
        } else if (similarity >= 0.02 && similarity < 0.025) {
          similarity = 0.055;
        } else if (similarity >= 0.025 && similarity < 0.04) {
          similarity = 0.06;
        } else if (similarity >= 0.04 && similarity < 0.049) {
          similarity = 0.065;
        } else if (similarity >= 0.05) {
          similarity = 0.07;
        }
      }
      if (similarRange >= 0.2 && similarRange < 0.5) {
        if (similarity < 0.01){
          similarity = 0.02;
        } else if (similarity > 0.01 && similarity < 0.015) {
          similarity = 0.025;
        } else if (similarity >= 0.015 && similarity < 0.02) {
          similarity = 0.03;
        } else if (similarity >= 0.02 && similarity < 0.025) {
          similarity = 0.033;
        } else if (similarity >= 0.025 && similarity < 0.035) {
          similarity = 0.037;
        } else if (similarity >= 0.035 && similarity < 0.05) {
          similarity = 0.041;
        } else if (similarity >= 0.05 && similarity < 0.065) {
          similarity = 0.045;
        } else if (similarity >= 0.065 && similarity < 0.08) {
          similarity = 0.05;
        } else if (similarity >= 0.08 && similarity < 0.1) {
          similarity = 0.055;
        } else if (similarity >= 0.1 && similarity < 0.15) {
          similarity = 0.06;
        } else if (similarity >= 0.15 && similarity < 0.2) {
          similarity = 0.065;
        } else if (similarity >= 0.2) {
          similarity = 0.07;
        }
      }
      //Set initial bubble properties
      $scope.circles.push({
        cx: $window.innerWidth/3.5,
        cy: $window.innerHeight/2,
        color: colorScheme[Math.floor(Math.random() * colorScheme.length)],
        radius: similarity * 1000,
        relative: $scope.relatives[i]
      });
    }
    createBubbles($scope.circles);
  };


 //Grab relatives from the database, then initialize bubbles
  $scope.getRelatives = function() {
    Relatives.getRelatives()
    //Can refactor to return the promise values within the relatives factory if so desired
    .then(function(relatives) {
      //Refactor? potentially redundant addition of relatives to $scope and $rootScope.
      $scope.relatives = relatives.data.relativeList;
      //Add relatives to rootScope to allow access within other controllers
      $rootScope.rels = relatives.data.relativeList;
      initialize();
      $scope.makeNewBubbleData();
    }, function(err) {
      console.error('Error retrieving relatives: ', err);
    });
  };
  //Initialize the page with a call to getRelatives
  $scope.getRelatives();

  $rootScope.IntroOptions = {
      steps:[{ 
          // element: document.querySelector('#test3'),
          intro: "Welcome to the Family Pool page. Each bubble represents a relative and is sized based on percentage of shared DNA. Click on the bubbles for more information."
        },
        {
          element: document.querySelector('#path2'),
          intro: "Access the map view and the help menu from over here.",
          position: 'right'
        }
      ],
      showStepNumbers: false,
      exitOnOverlayClick: true,
      exitOnEsc:true,
      nextLabel: '<strong><span style="color:green">Next</span></strong>',
      prevLabel: '<span style="color:red">Previous</span>',
      skipLabel: 'Exit',
      doneLabel: 'Thanks'
  };

});