var app = angular.module("app",
	['ui.router','ui.bootstrap','ngAnimate','toaster','ngFileUpload']);


 app.config(['$stateProvider','$urlRouterProvider', '$locationProvider', 
	function($stateProvider, $urlRouterProvider, $locationProvider) {
		
		$urlRouterProvider.otherwise('/');
	    $stateProvider
    	.state('/', {
			url: "",
			templateUrl: './views/main.html'
		})
		.state('index', {
			url: "",
			templateUrl: './views/main.html'
		})
		.state('index.upload', {
			url: '/upload',
			templateUrl: './Views/upload.html'
		})
		.state('index.pdfviewer', {
			url: '/pdfviewer?doc',
			templateUrl: './Views/pdfviewer.html'
		})
  }]);