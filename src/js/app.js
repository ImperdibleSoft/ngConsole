var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/', {
      templateUrl: 'templates/main.html',
      controller: 'mainController'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);

app.controller('mainController', ['$scope', function($scope){

  $scope.message = "Please, press 'º' key";

  $scope.console = {
    open: false,
    fixed: false,
    fullscreen: false,
    customHeight: 350,
    customPrefix: "Custom Prefix",
    customCommands: [
      {
        name: 'test',
        description: 'This is a test',
        action: function(){ console.log('Testing custom command'); }
      }
    ]
  };
}]);
