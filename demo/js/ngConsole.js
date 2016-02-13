var dev = false;
app.directive('ngConsole', ['$rootScope', function($rootScope) {
    return {
      restrict: 'AE',
      transclude: true,
      template: '<style>ng-console{position:relative;display:inline-block;width:100%;height:auto;padding:0px;margin:0px;} .console,.console *{left:0;box-sizing:border-box;margin:0}.console{position:relative;display:inline-block;float:left;width:100%;min-height:300px;padding:10px;top:0;background-color:rgba(0,0,0,.8);border:0;outline:0;overflow-x:hidden;overflow-y:scroll;transition:all .3s;z-index:50}.console.fixed{position:fixed;display:block;height:50%;top:-50%}.console.fixed.fullscreen{height:100%!important;top:-100%!important}.console.fixed.fullscreen.open,.console.fixed.open,.console.open{top:0!important}.console *{padding:0;top:0;color:#ccc;font-family:monospace;font-size:11px;line-height:16px;list-style:none;text-align:left}.console input::-webkit-calendar-picker-indicator{display:none}.console .command-list .prefix,.console .command-list input[type=text],.console .command-list p,.console .new-line .prefix,.console .new-line input[type=text],.console .new-line p{position:relative;display:block;float:left;width:100%;height:auto;padding:0;margin:0;bottom:0;color:#ccc;font-family:monospace;font-size:11px;line-height:16px;text-align:left;appearance:none;-moz-appearance:none;-webkit-appearance:none;background-color:transparent;border:none;outline:0}.console .command-list, .console .new-line{position: relative;display: block;float: left;width: 100%;}.console .new-line .prefix{width:auto}.console .new-line input[type=text]{width:100%;max-width:calc(100% - 130px);padding:0 5px}</style><form name="console" role="form" novalidate class="console" ng-class="{\'open\': open, \'fixed\': fixed, \'fullscreen\': fullscreen}" ng-submit="executeCommand()"><!-- Command list --><div class="command-list"></div><div class="new-line"><span class="prefix">{{ customPrefix }}</span><input type="text" name="command" ng-model="command" tab-index="1" autofocus autocomplete="off" /><datalist id="commands"><option ng-repeat="command in commands" value="{{ command.name }}"></datalist></div></form>',
      scope:{
        open: "=open",                         // Open by default
        fixed: "=fixed",                       // Fixed and hidden
        fullscreen: "=fullscreen",             // Full height
        customHeight: "=customHeight",         // Custom height

        customPrefix: "=customPrefix",         // Prefix shown
        customCommands: "=customCommands"      // New commands
      },
      link: function(scope, element, attrs){

        scope.init = function(){

          /* If there is a custom height */
          if(scope.customHeight && !scope.fullscreen){
            document.querySelector(".console").style.height = scope.customHeight;

            if(scope.fixed){
              document.querySelector(".console").style.top = (scope.customHeight * (-1));
            }
          }

          /* If there is no prefix, set a default one */
          if(!scope.customPrefix){
            scope.customPrefix = "ngConsole";
          }
          scope.customPrefix += ">";

          /* Default commands */
          scope.commands = {};
          scope.commands.browser = new Command(
            "browser",
            "Some actions related to the browser.",
            [
              {
                name: "info",
                description: "Show the the version of the browser you are using."
              }
            ],
            function(printLn, params){
              if(params){
                if(params.info){
                  printLn(navigator.userAgent);
                }
              }
            }

          );
          scope.commands.clear = new Command(
            "clear",
            "Clean command history.",
            false,
            function(printLn, params){
              document.querySelector(".command-list").innerHTML = "";
            }
          );
          scope.commands.cls = new Command(
            "cls",
            "Clean command history.",
            false,
            scope.commands.clear.exec
          );
          scope.commands.console = new Command(
            "console",
            "Some actions related to ngConsole",
            [
              {
                name: "bg",
                description: "Change the ngConsole's background."
              },
              {
                name: "info",
                description: "Display info about ngConsole."
              },
              {
                name: "reset",
                description: "Restore ngConsole's state to its initial state."
              }
            ],
            function(printLn, params){
              if(params){

                /* Change the ngConsole's background */
                if(params.bg){
                  document.querySelector(".console").style.background = params.bg;
                }

                /* Display info about ngConsole */
                if(params.info){
                  printLn("<b><span style='color: white'>ngConsole v1.2.0</span></b>");
                  printLn("<b><span style='color: white'>Author</span></b>: ImperdibleSoft (<a href='http://www.imperdiblesoft.com' target='_blank'>http://www.imperdiblesoft.com</a>)");
                }

                /* Restore ngConsole's state to its initial state */
                if(params.reset){
                  document.querySelector(".console").style.background = "rgba(0, 0, 0, 0.8)";
                }
              }
            }
          );
          scope.commands.exit = new Command(
            "exit",
            "Close the console.",
            false,
            function(printLn, params){
              scope.commands.clear.exec();
              scope.toggle();
            }
          );
          scope.commands.help = new Command(
            "help",
            "Show all available commands.",
            false,
            function(printLn, params){
              var temp = "<p>Available commands: ";
              temp += "<ul>";

              /* Loop throught all declared commands */
              for(var x in scope.commands){
                var elem = scope.commands[x];
                temp += "<li>";
                temp += elem.description;

                /* Loop throught all declared params */
                if(elem.params){
                  temp += "<ul>";
                  for(var y in elem.params){
                    var param = elem.params[y];
                    temp += "<li>";
                    temp += "&nbsp;&nbsp;&nbsp;&nbsp;<span style='color: white'>--"+ param.name +"</span>: "+ param.description;
                    temp += "</li>";
                  }
                  temp += "</ul>";
                }

                temp += "</li>";
              }
              temp += "</ul>";
              printLn(temp);
            }
          );

          /* Store custom commands */
          if(scope.customCommands){
            for(var x in scope.customCommands){
              var action = scope.customCommands[x];
              scope.commands[action.name] = new Command(action.name, action.description, action.params, action.action);
            }
          }
        };

        /* Open/close the console */
        scope.toggle = function(){
          scope.open = !scope.open;

          if(scope.open === true){

            /* Scrolls to new line */
            scope.scrollBottom();

            /* Focus the new line */
            if(document.querySelector(".console .new-line input")){
              document.querySelector(".console .new-line input").focus();
            }
          }
          else{

            /* Remove the focus */
            if(document.querySelector(".console .new-line input")){
              document.querySelector(".console .new-line input").blur();
              scope.cleanLn();
            }
          }
          scope.apply();
        };

        /* Print a new line */
        scope.printLn = function(string){

          /* Save command history */
          var prev = document.querySelector(".console .command-list").innerHTML;

          /* Append new command to history */
          document.querySelector(".console .command-list").innerHTML = prev + "<p>" + string + "</p>";
        }

        /* Clean the new line */
        scope.cleanLn = function(){
          scope.command = "";
        };

        /* Scroll to new Line position */
        scope.scrollBottom = function(){
          var elem = document.querySelector(".console");
          var newTop = document.querySelector(".command-list").clientHeight + document.querySelector(".new-line").clientHeight;
          elem.scrollTop = newTop;
        }

        /* scope.$apply() */
        scope.apply = function(){
          if(!dev || dev === true){ scope.$apply(); }
        };

        /* Send the command */
        scope.executeCommand = function(){

          /* Read the command */
          var command = scope.console.command.$modelValue ? scope.console.command.$modelValue : "";

          /* Clean new line */
          scope.cleanLn();

          /* Print command executed */
          scope.printLn(scope.customPrefix +" <span style=\'color: white;\'>"+ command +"</span>");

          /* Loop all available commands */
          var existing = false;
          for(var x in scope.commands){
            var elem = scope.commands[x];

            /* The first word is the command name */
            if((command.indexOf(" --") >= 0 && command.substr(0, command.indexOf(" --")) === elem.name) || (command.indexOf(" --") < 0 && command === elem.name)){
              existing = true;

              /* There are params */
              if(command.indexOf(" --") >= 0){
                var params = command.split(" --");
                var temp = {}

                /* Loop all written params */
                for(var y in params){

                  /* Skip first element */
                  if(y != 0){
                    var param = params[y].split("=");
                    var p = {
                      name: param[0],
                      value: (param[1] && param[1] != "") ? param[1].replaceAll("\"", "") : true
                    };

                    /* Loop all declared params */
                    for(var z in elem.params){
                      if(p.name === elem.params[z].name){
                        temp[p.name] = p.value;
                      }
                    }
                  }
                }
                elem.exec(scope.printLn, temp);
              }

              /* There are no params */
              else{
                elem.exec(scope.printLn);
              }

              break;
            }
          }

          /* If no available command */
          if(!existing){

            /* Print empty line */
            if(command == "" || !command){
              scope.printLn("");
            }

            /* Show error message */
            else{
              scope.printLn("\'<b><span style=\'color: white;\'>" + command + "</span></b>\': command not found. Use \'help\' for more info.");
            }
          }

          /* Scrolls to new line */
          scope.scrollBottom();
        };

        /* Command builder */
        function Command(name, description, params, callback){
          this.name = name;
          this.description = "&nbsp;&nbsp;<span style=\'color: white;\'>"+ name +"</span>: "+ description;
          this.params = params;
          this.exec = callback;
        };

        /* Relplace all elements */
        String.prototype.replaceAll = function(search, replacement) {
          var target = this;
          return target.replace(new RegExp(search, 'g'), replacement);
        };

        /* Detect key press */
        document.addEventListener('keyup', function(e){

          /* Open/Close the console */
          if(e.keyCode == 220 || e.key == "º"){
            e.preventDefault();
            scope.toggle();
          }

          /* Remove already written */
          else if(e.keyCode == 27 || e.key== "Escape"){
            e.preventDefault();
            if(scope.command != ""){
              scope.cleanLn();
            }
            else if(scope.fixed == true && scope.open == true){
              scope.toggle();
            }
            scope.apply();
          }
        });

        scope.init();
      }
    }
}]);
