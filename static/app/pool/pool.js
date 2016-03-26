angular.module('genome.pool', [])
.controller('PoolController', function($scope, d3Service, Relatives, $rootScope, $window, $location
  ) {
  //Containers for Relatives' Data
  var circle;
  $scope.relatives = [];
  $rootScope.rels = [];
  $scope.circles = [];
  //End containers for Relatives' Data

  //Set up appropriate SVG and page sizing
  var idealMargins = [50/768, 50/1024, 'bottom', 30/1024]
  var boardHeight = $window.innerHeight;
  var boardWidth = $window.innerWidth;
  var standardWidth = 1024;
  var standardHeight = 768;
  var margin = {
    top: function(){return 3 * boardHeight * 50/768}(),
    right: function(){return boardWidth * 50/1024}(),
    bottom: 200,
    left: function(){return boardWidth * 30/1024}()
  };
  var resetSizing = function() {
    var heightDiff = Math.abs(boardHeight - standardHeight);
    var widthDiff = Math.abs(boardWidth - standardWidth);
    var fraction;
    if(heightDiff > widthDiff) {
      fraction = boardHeight/standardHeight;
      boardWidth = boardWidth * fraction;
    } else {
      fraction = boardWidth/standardWidth;
      boardHeight = boardHeight * fraction;
    }
  }
  resetSizing();
  var column1 = margin['left'];
  var column2 = boardWidth/8;
  var column3 = boardWidth/3;
  var column4 = boardWidth * 8/15;
  var column5 = boardWidth * .6;
  var row1 = boardHeight/9
  var row2 = boardHeight/3.2;
  var row3 = boardHeight/2.9;
  var continents = [
    [row1, column1, 'north america'],
    [row2, column2, 'south america'],
    [row1, column3, 'europe'],
    [row2, column3, 'africa'],
    [row1, column4, 'asia'],
    [row3, column5, 'australia']
  ];
  //End SVG and Page Sizing

  //Adjust Bubble Data
  //Move Bubbles to Their Respective Locations on the Globe Based on Relative Birthplace
  var makeNewBubbleData = function(){
      for(var i = 0; i < $scope.circles.length; i++){
        if($scope.circles[i].relative.birthplace === "United States") {
          $scope.circles[i]['oldCX'] = $scope.circles[i]['cx']
          $scope.circles[i]['cx'] = row1;
          $scope.circles[i]['oldCY'] = $scope.circles[i]['cy']
          $scope.circles[i]['cy'] = column1;
          $scope.circles[i]['oldRadius'] = $scope.circles[i]['radius']
          $scope.circles[i]['radius'] = 5;
        } else {
          var birthplace = continents[i%6]
          $scope.circles[i]['oldCX'] = $scope.circles[i]['cx']
          $scope.circles[i]['cx'] = birthplace[1];
          $scope.circles[i]['oldCY'] = $scope.circles[i]['cy']
          $scope.circles[i]['cy'] = birthplace[0];
          $scope.circles[i]['oldRadius'] = $scope.circles[i]['radius']
          $scope.circles[i]['radius'] = 5;
        }
      }
    }
    //Enter New Bubble Data and Instigate Bubble Movement
    var moveBubblesToRegions = function() {
      makeNewBubbleData();
      d3.selectAll("circle").data($scope.circles).attr('r', function(d){return d.radius;});
    }

    //Move Bubbles Back to Center of Page
    replaceBubblesInCenter = function(){
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
    //End of functions adjusting bubble placement

  //Toggle Side Nav Icons
  var whichView = function() {
    $rootScope.view = $location.$$path;
  }
  whichView();
  //End Toggle Side Nav Icons

  //Toggle Map
  var mapShowing = false;
  var toggleMap = function(){
    if(!mapShowing) {
      $('div.wholepage').addClass('mapView');
      moveBubblesToRegions();
    } else {
      $('div.wholepage').removeClass('mapView');
      replaceBubblesInCenter();
    }
    mapShowing = !mapShowing;
  }
  $rootScope.filterRegions = function() {
    toggleMap();
  };
  $rootScope.removeMap = function(){
    mapShowing = false;
    $('div.wholepage').removeClass('mapView');
  }
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
  var width = 1000 - margin.left - margin.right;
  var height = 1000 - margin.top - margin.bottom;
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
      .attr('z-index', '1')
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
        if (similarity < 0.01){
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
        } else if (similarity > 0.015 && similarity < 0.02) {
          similarity = 0.03;
        } else if (similarity > 0.02 && similarity < 0.025) {
          similarity = 0.033;
        } else if (similarity >= 0.025 && similarity < 0.035) {
          similarity = 0.037;
        } else if (similarity >= 0.035 && similarity < 0.05) {
          similarity = 0.041;
        } else if (similarity >= 0.05 && similarity < 0.065) {
          similarity = 0.045;
        } else if (similarity >= 0.065 && similarity < 0.08) {
          similarity = 0.05;
        } else if (similarity >= 0.08 && similarity < 0.09) {
          similarity = 0.055;
        } else if (similarity > 0.1 && similarity < 0.15) {
          similarity = 0.06;
        } else if (similarity > 0.15 && similarity < 0.2) {
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
    }, function(err) {
      console.error('Error retrieving relatives: ', err);
    });
  };
  //Initialize the page with a call to getRelatives
  $scope.getRelatives();
});
