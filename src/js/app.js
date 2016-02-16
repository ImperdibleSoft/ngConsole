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

  $scope.options = {
    open: false,
    fixed: false,
    fullscreen: false,
    customHeight: 450,
    customPrefix: false,
    customCommands: [
      {
        name: 'test',
        description: 'This is a test.',
        params: false,
        action: function(printLn, params){
          console.log('Testing custom command');
        }
      },
      {
        name: 'say',
        description: 'This command will prompt the specified text.',
        params: [
          {
            name: "text",
            description: "The text that is going to be displayed."
          },
          {
            name: "popup",
            description: "If it is true, the message will be displayed on a popup."
          }
        ],
        action: function(printLn, params){
          if(params){
            if(params.text){
              if(params.popup){
                alert(params.text);
              }
              else{
                printLn(params.text);
              }
            }
          }
          else{
            printLn("<b>Error</b>: You need to specify (at least) one param.");
          }
        }
      }
    ]
  };
}]);
