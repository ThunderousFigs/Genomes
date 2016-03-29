angular.module('genome.tree', [])
.controller('TreeController', function($scope, d3Service, Relatives, $rootScope, $window, $location
  ) {

  $scope.relatives = [];
  $rootScope.rels = [];
  $scope.myData = [10,10,10,20];
  $scope.circles = [];
  var force;
  var similarRange;
  var boardHeight = $window.innerHeight;
  var boardWidth = $window.innerWidth;
  var relativeTree = {
                       'relationship': 'me',
                       'children': [
                        {
                         'relationship': 'maternal_side',
                         'children': []
                        },
                        {
                          'relationship' : 'paternal_side',
                          'children' : []
                        }
                        ]
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
      createTree($scope.relatives);
      initialize();
    }, function(err) {
      console.error('Error retrieving relatives: ', err);
    });
  };
  //Initialize the page with a call to getRelatives
  $scope.getRelatives();



  function createTree(relatives){

    var family = {}
    relatives.forEach(function(relative){
      relative.children = [];
      relative.name = relative.relationship;
    });

    family.paternalCloseRelatives = relatives.filter(function(relative){
        return !relative.relationship.match('Cousin') && !relative.relationship.match('Distant') && relative.paternal_side
      });
      family.maternalCloseRelatives = relatives.filter(function(relative){
        return !relative.relationship.match('Cousin') && !relative.relationship.match('Distant') && relative.maternal_side
      });
      family.paternalFirstCousins = relatives.filter(function(relative){
        return relative.relationship.match('1st Cousin') && relative.paternal_side
      });
      family.maternalFirstCousins = relatives.filter(function(relative){
        return relative.relationship.match('1st Cousin') && relative.maternal_side
      });
      family.paternalOtherCousins = relatives.filter(function(relative){
        return relative.relationship.match('2nd Cousin') && relative.relationship.match('3rd Cousin') && relative.paternal_side
      });
      family.maternalOtherCousins = relatives.filter(function(relative){
        return relative.relationship.match('2nd Cousin') && relative.relationship.match('3rd Cousin') && relative.maternal_side;
      });
      family.paternalDistantRelatives = relatives.filter(function(relative){
        return checkIfDistant(relative) && relative.paternal_side;
      });
      family.maternalDistantRelatives = relatives.filter(function(relative){
        return checkIfDistant(relative) && relative.maternal_side;
      });
 
    for(var prop in family){
      if(family[prop].length > 0){
        var which_side = (prop.search('maternal') === 0 ) ? 'maternal' : 'paternal';
        insertRelatives(family[prop], which_side)        
      }
    }
    function checkIfDistant(relative){
      return family.paternalCloseRelatives.indexOf(relative) < 0 && family.maternalCloseRelatives.indexOf(relative) < 0 && family.paternalFirstCousins.indexOf(relative) < 0 &&
      family.maternalFirstCousins.indexOf(relative) < 0 && family.paternalOtherCousins.indexOf(relative) < 0 && family.maternalOtherCousins.indexOf(relative) < 0
    }
  }


  function insertRelatives(relatives, side){
    //use recursion to find whichever level to go to
    var maternalBranch = relativeTree['children'][0];
    var paternalBranch = relativeTree['children'][1];

    if(side === 'maternal'){
      //start recursion here
      recursiveAdd(maternalBranch, relatives)
    } else {
      //start recursion here
      recursiveAdd(paternalBranch, relatives)
    }

    function recursiveAdd(parentNode, newNodes){
      if(parentNode.children.length === 0){
        newNodes.forEach(function(node){
          parentNode.children.push(node);
        });
      } else {
        recursiveAdd(parentNode.children[0], newNodes);
      }
    }
  }

  var whichView = function() {
    $rootScope.view = $location.$$path;
  }
  whichView();

  $scope.showMap = false;
  $rootScope.filterRegions = function() {
    $scope.showMap = !$scope.showMap;
  };

  //ng data map
  $scope.mapObject = {
    scope: 'world',
    options: {
      width: 1110,
      legendHeight: 60 // optionally set the padding for the legend
    },
    geographyConfig: {
      highlighBorderColor: '#EAA9A8',
      highlighBorderWidth: 2
    },
    fills: {
      'HIGH': '#CC4731',
      'MEDIUM': '#306596',
      'LOW': '#667FAF',
      'defaultFill': '#DDDDDD'
    },
  };

  //end ng data map
  $scope.popModal = {
    name: '',
    similarity: '',
    image: '',
    relationship: '',
    age: 0
  };

  var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  };

  var width = 1000 - margin.left - margin.right;
  var height = 1000 - margin.top - margin.bottom;

  var padding = 5;

  var radius = d3.scale.sqrt().range([0, 12]);

  var colorScheme = ['#1abc9c', '#2ecc71', '#f1c40f', '#27ae60', '#3498db', '#9b59b6', '#2980b9','#8e44ad','#e67e22','#d35400','#e74c3c', '#c0392b', '#bdc3c7', '#f39c12', '#95a5a6'];

  //pop up message displaying relative data when user clicks on a bubble
  var showRelative = function(bubble) {
    $scope.popModal.name = bubble.relative.first_name + ' ' + bubble.relative.last_name;
    $scope.popModal.similarity = (bubble.relative.similarity*100).toFixed(2) + '% of your DNA';
    $scope.popModal.relationship = bubble.relative.relationship  || 'Unknown';
    $scope.popModal.age = bubble.relative.birth_year ? (new Date().getFullYear() - bubble.relative.birth_year) : 'Unknown';
    $scope.popModal.image = bubble.relative.picture_url || '../../../static/assets/hipDNA.png';
    $scope.popModal.ancestry = bubble.relative.ancestry || 'Unknown';
    $scope.popModal.birthplace = bubble.relative.birthplace  || 'Unknown';
  };


  // Create bubbles ////////////////////////////
  var createBubbles = function() {
    var range = [];

    $scope.relatives.map(function (relative) {
      range.push(relative.similarity);
    }).sort(function (a, b) {
      return b - a;
    });

    similarRange = (range[0] - range[range.length-1]);

    //Add d3 force effect to layout
    force = d3.layout.force()
      .linkDistance(250)
      .charge(-120)
      .gravity(0.05)
      .size([width, height])
      .on('tick', tick);


    //Grab the pool as a canvas for our bubbles
    var svg = d3.select('.pool').append('svg')
      .attr('width', boardWidth + margin.left + margin.right)
      .attr('height', boardHeight + margin.top + margin.bottom);

    var link = svg.selectAll('.link');
    var node = svg.selectAll('.node');

    var nodes = flatten(relativeTree);
    
    var tree = d3.layout.tree();

    //TODO : figure out to make bubbles not overlap and tree maintain shape
    // .nodeSize(function(d){
    //   return 5
    // }).separation(function separation(a,b){
    //   return a == b ? 2 : 1;
    // });
    
    var links = tree.links(nodes);
    
    // Restart the force layout.
    force
        .nodes(nodes)
        .links(links)
        .start();

        // Update links.
    link = link.data(links, function(d) { 
      return d.target.id; });

    link.exit().remove();

    link.enter().insert('line', '.node')
        .attr('color', 'black')
        .attr('class', 'link');

    // Update nodes.
    node = node.data(nodes, function(d) { return d.id; });

    node.exit().remove();

    var nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .on('click', click)
        .call(force.drag);

    nodeEnter.append('circle')
        .attr('fill', 'yellow')
        .attr('r', relativeSize);

    nodeEnter.append('text')
        .attr('dy', '.35em')
        .text(function(d) { return d.relationship; });

    node.select('circle');

    function relativeSize(relative){

      if(relative.relationship === 'me'){
        relative.similarity = 0.30;
      } else if(relative.relationship === 'paternal_side' || relative.relationship === 'maternal_side'){
        relative.similarity = 0.25;
      } else if(relative.relationship === 'Distant Relative'){
        relative.similarity = 0.008;
      }

      var similarity = (relative.similarity < 0.03 && relative.similarity) ? relative.similarity * 15000 : relative.similarity * 2000;

      if (similarRange > 0 && similarRange < 0.2) {
        if (similarity < 0.01){
          return similarity * 0.03;
        } else if (similarity > 0.01 && similarity < 0.012) {
          return similarity * 0.035;
        } else if (similarity >= 0.012 && similarity < 0.015) {
          return similarity * 0.04;
        } else if (similarity >= 0.015 && similarity < 0.02) {
          return similarity * 0.05;
        } else if (similarity >= 0.02 && similarity < 0.025) {
          return similarity * 0.055;
        } else if (similarity >= 0.025 && similarity < 0.04) {
          return similarity * 0.06;
        } else if (similarity >= 0.04 && similarity < 0.049) {
          return similarity * 0.065;
        } else if (similarity >= 0.05) {
          return similarity * 0.07;
        }
      }

      if (similarRange >= 0.2 && similarRange < 0.5) {
        if (similarity < 0.01){
          return similarity * 0.02;
        } else if (similarity > 0.01 && similarity < 0.015) {
          return similarity * 0.025;
        } else if (similarity > 0.015 && similarity < 0.02) {
          return similarity * 0.03;
        } else if (similarity > 0.02 && similarity < 0.025) {
          return similarity * 0.033;
        } else if (similarity >= 0.025 && similarity < 0.035) {
          return similarity * 0.037;
        } else if (similarity >= 0.035 && similarity < 0.05) {
          return similarity * 0.041;
        } else if (similarity >= 0.05 && similarity < 0.065) {
          return similarity * 0.045;
        } else if (similarity >= 0.065 && similarity < 0.08) {
          return similarity * 0.05;
        } else if (similarity >= 0.08 && similarity < 0.09) {
          return similarity * 0.055;
        } else if (similarity > 0.1 && similarity < 0.15) {
          return similarity * 0.06;
        } else if (similarity > 0.15 && similarity < 0.2) {
          return similarity * 0.065;
        } else if (similarity >= 0.2) {
          return similarity * 0.07;
        }
      }
    }

    function tick() {
      link.attr('x1', function(d) { return d.source.x; })
          .attr('y1', function(d) { return d.source.y; })
          .attr('x2', function(d) { return d.target.x; })
          .attr('y2', function(d) { return d.target.y; });

      node.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    }


    // Toggle children on click.
    function click(d) {
      if (d3.event.defaultPrevented) return; // ignore drag
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    }

    // Returns a list of all nodes under the root.
    function flatten(root) {
      var nodes = [], i = 0;

      function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        nodes.push(node);
      }

      recurse(root);
      return nodes;
    }
  };
//////////////////////////////////////////////////////////////////////


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

      $scope.circles.push({
        radius: similarity * 1000,
        relative: $scope.relatives[i]
      });
    }
    createBubbles($scope.circles);
  };


    function dropHandler(d){
      // TODO: use  showRelative() here
    }

    function dragmove(d){
        var node = this;
        var translation = ['translate(', d3.event.x, ',', d3.event.y, ')'].join('')
        var x = d3.event.x;
        var y = d3.event.y;
        var translation = ['translate(', x, ',', y, ')'].join('');
        d3.select(node).attr('transform', translation);
    }

    function onDragDrop(dragmove, dropHandler){
      var drag = d3.behavior.drag()
                   .origin(function(d,i) { return {x:0, y:0}; })
                   .on('drag', dragmove)
                   .on('dragend', dropHandler);
      return drag;
    }
});

