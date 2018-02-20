var App = angular.module('ChatRoom',['ngResource','ngRoute','ngStorage','socket.io','ngFileUpload','Controllers','Services'])
.run(["$rootScope", function ($rootScope){

    // $rootScope.baseUrl = 'http://218.156.17.126:8282'; //Application URL
    $rootScope.baseUrl = 'http://192.168.0.33:8282'; //Application URL
    // $rootScope.baseUrl = 'http://172.30.1.37:8282'; //Application URL
    // $rootScope.baseUrl = 'http://localhost:8282'; //Application URL
}]);
App.config(function ($routeProvider, $socketProvider){

    // $socketProvider.setConnectionUrl('http://218.156.17.126:8282'); // Socket URL
    $socketProvider.setConnectionUrl('http://192.168.0.33:8282'); // Socket URL
    // $socketProvider.setConnectionUrl('http://172.30.1.37:8282'); // Socket URL
    // $socketProvider.setConnectionUrl('http://localhost:8282'); // Socket URL

	$routeProvider	// AngularJS Routes
	/*.when('/v1/', {
		templateUrl: 'app/views/login.html',
		controller: 'loginCtrl'
	})*/
	/*.when('/v1/ChatRoom', {
		templateUrl: 'app/views/chatRoom.html',
		controller: 'chatRoomCtrl'
	})*/
	.when('/v1/:roomKey', {
		templateUrl: 'app/views/chatRoom.html',
		controller: 'chatRoomCtrl'
	})
	.when('/:roomKey/:userName/:userNo/:master', {
        templateUrl: 'app/views/login.html',
        controller: 'loginCtrl'
	})
	.when('/googleMap',{
		templateUrl:'./googleMap.html'

	})
	.otherwise({
        redirectTo: '/v1/'	// Default Route
    });
});
