(function(){
	angular.module("app")
	.controller("uploadCtrl",uploadController);
	
	uploadController.$inject =["$scope", "$log","toaster","Upload","$state","$stateParams"];	
	
	function uploadController($scope, $log, toaster,Upload,$state,$stateParams){
		$scope.title = "Upload";
		$scope.files ;
		$scope.uploadedFileUrl = "";
        $scope.resultFile = "";
        
		$scope.uploadFiles = function () {
            $scope.resultFile = "";
			var file = $scope.files;
			if(file == null){
				return;
			}
			Upload.upload({
				url: '/api/upload',
				data: {file: file}
			}).then(function (resp) {
				$scope.resultFile = resp.data.url;	
				console.log('Uploaded file at: ' + console.log(JSON.stringify(resp.data)) + '. Response: ' + resp.data);
			}, function (resp) {
				console.log('Error status: ' + resp.status);
			}, function (evt) {
				var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
				console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
			});
			
		};
		
		$scope.viewPdf = function () {
			$state.go("index.pdfviewer",{"doc":$scope.uploadedFileUrl});
		}
		
}})();