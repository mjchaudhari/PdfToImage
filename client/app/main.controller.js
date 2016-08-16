(function(){
	angular.module("app")
	.controller("mainCtrl",mainController);
	
	mainController.$inject =["$scope", "$log","toaster"];	
	
	function mainController($scope, $log, toaster){
		$scope.title = "Document Converter";
	}
})();