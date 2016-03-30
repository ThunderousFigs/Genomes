angular.module('genome.about', ['ui.bootstrap'])

.controller('AboutController', function ($scope, $rootScope, $location) {

	$scope.showTeam = function () {

	}
	$scope.images = [{
			name: 'Gar Lee',
	    pic: '../../../static/assets/gar.png',
	    description: 'Kewl, awesome, humble, guy'
	  },
	  {
	  	name: 'Peter Lollo',
	    pic: '../../static/assets/peter.png',
	    description: 'jesus, smart, hilarious, calm'
	  },
	  {
	  	name: 'Alex Anthony',
	    pic: '../../static/assets/alex.jpg',
	    description: 'outgoing, mindful, intelligent, caring'
	  },
	  {
	  	name: 'Chris Bassano',
	    pic: '../../static/assets/chris.jpg',
	    description: 'genuine, hard-working, dedicated, meatballs'
	  }];

})