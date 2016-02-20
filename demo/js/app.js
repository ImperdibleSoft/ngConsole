var app = angular.module('app', ['ngRoute', 'ngConsole']);

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

  // All this stuff is entirely OPTIONAL.
  $scope.options = {};

  // If true, console will be hidden, and will open by pressing º key.
  $scope.options.fixed = false;

  // If true and fixed=true, console will be displayed at fullscreen when open.
  $scope.options.fullscreen = false;

  // If true and fixed=true, console will start open.
  $scope.options.open = false;

  // This number will set a custom height for the console.
  $scope.options.customHeight = 350;

  // This string will replace the 'ngConsole>' prefix.
  $scope.options.customPrefix = "ngConsole";

  // This will load a theme at startup.
  $scope.options.customTheme = {
    name: "custom",
    data: {
      bg: "rgba(0,9,76,0.8)",
      color: "#ccc",
      boldColor: "#fff",
      fontsize: 11,
      fontfamily: "monospace"
    },
    labels: {
      bg: "Dark blue",
      color: "Light gray",
      boldColor: "White"
    }
  };

  // This will make these commands available for users.
  $scope.options.customCommands = [
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
  ];

}]);
