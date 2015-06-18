// var s3v3nApp = angular.module('s3v3nApp', ['ngRoute']);

// s3v3nApp.config(function ($routeProvider) {
// 	$routeProvider
// 		.when('/login', {templateUrl: 'partials/login.html'})
// 		.when('/main', {templateUrl: 'partials/main.html'})
// 		.when('/response', {templateUrl: 'partials/response.html'})
// 		.otherwise({redirectTo: '/login'});
// });

// // --=== Factories ===--

// s3v3nApp.factory('mainFactory', function ($http) {
// 	var factory = {};

// 	factory.getLogin = function (callback) {
// 		$http.get('/auth/uber').success(function (result) {
// 			console.log("logging in...");
// 			callback(result);
// 		})
// 	}

// 	factory.showMainPage = function (callback) {
// 		$http.get('___').success(function (result) {
// 			console.log("displaying main page...");
// 			callback(result);
// 		})
// 	}

// 	return factory;
// })


// // --=== Controllers ===--

// s3v3nApp.controller('mainController', function ($scope, mainFactory) {
// 	var userLogin = function () {
// 		console.log("login at controller");
// 		factory.getLogin(function (data) {
// 			$scope.info = data;
// 		})
// 	}
// })


// /auth/uber