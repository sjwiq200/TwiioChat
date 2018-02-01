angular.module('Services',[])
.service('sendMapService', function ($http, $rootScope) {
	this.sendMap = function (data) {
        console.log("receive value ==>" +data);

	};

});