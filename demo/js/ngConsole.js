
/* Some custom variables */
var _dev = false;
var _version = "1.7.3";

/* Create module */
var _ngc = angular.module('ngConsole', [])

/* Create directive */
.directive('ngConsole',
  ['$rootScope',
  function($rootScope) {
    return {
      restrict: 'AE',
      transclude: true,
      template: '<style>ng-console{position:relative;display:inline-block;width:100%;height:auto;padding:0px;margin:0px;z-index:999999999;} .console,.console *{left:0;box-sizing:border-box;margin:0;cursor:default;} .console *::selection{color:black;background:#fff;}.console *::-moz-selection{color:black;background:#fff;}      .console{position:relative;display:inline-block;float:left;width:100%;padding:10px;top:0;background:rgba(0,0,0,1);border:0;outline:0;overflow-x:hidden;overflow-y:scroll;transition:all .3s;z-index:50}.console.fixed{position:fixed;display:block;height:50%;top:-50%;background:rgba(0,0,0,0.8);}.console.fixed.fullscreen{height:100%!important;top:-100%!important}.console.fixed.fullscreen.open,.console.fixed.open,.console.open{top:0!important}.console *{padding:0;top:0;color:#ccc;font-family:monospace;font-size:11px;line-height:150%;list-style:none;text-align:left}.console b{color:#fff;}.console input::-webkit-calendar-picker-indicator{display:none}.console a{cursor:pointer;}.console .command-list .prefix,.console .command-list input[type=text],.console .command-list p,.console .command-new-line .prefix,.console .command-new-line input[type=text],.console .command-new-line p{position:relative;display:block;float:left;width:100%;height:auto;padding:0;margin:0;bottom:0;appearance:none;-moz-appearance:none;-webkit-appearance:none;background-color:transparent;border:none;outline:0}.console .command-list, .console .command-new-line{position: relative;display: block;float: left;width: 100%;}.console .command-new-line .prefix{width:auto}.console .command-new-line input[type=text]{width:100%;max-width:calc(100% - 130px);padding:0 5px}</style><style id="custom-bg"></style><style id="custom-color"></style><style id="custom-boldcolor"></style><style id="custom-fontsize"></style><style id="custom-fontfamily"></style><form name="console" role="form" novalidate class="console" ng-class="{\'open\': options.open, \'fixed\': options.fixed, \'fullscreen\': options.fullscreen}" ng-submit="executeCommand()"><!-- Command list --><div class="command-list"></div><div class="command-new-line"><span class="prefix">{{ options.customPrefix }}></span><input type="text" name="command" ng-model="command" tab-index="1" autofocus autocomplete="off" /><datalist id="commands"><option ng-repeat="command in commands" value="{{ command.name }}"></datalist></div></form>',
      scope:{
        options: "=options"
      },
      link: function(scope, element, attrs){

        scope.init = function(){

          /* If no scope options */
          if(!scope.options){
            scope.options = {};
          }

          /* If there is a custom height */
          if(scope.options.customHeight && !scope.options.fullscreen){
            document.querySelector(".console").style.height = scope.options.customHeight;

            if(scope.options.fixed){
              document.querySelector(".console").style.top = (scope.options.customHeight * (-1));
            }
          }

          /* If there is no prefix, set a default one */
          if(!scope.options.customPrefix){
            scope.options.customPrefix = "ngConsole";
          }

          /* Store custom commands */
          if(scope.options.customCommands){
            for(var x in scope.options.customCommands){
              var action = scope.options.customCommands[x];
              scope.commands[action.name] = new Command(action.name, action.description, action.params, action.action);
            }
          }

          /* Store and/or load custom Theme */
          if(scope.options.customTheme){

            /* If theme is an object */
            if(typeof(scope.options.customTheme) == "object"){

              /* Store it */
              scope.themes.push(scope.options.customTheme);
            }

            /* If there is no saved data */
            if(isConfigSaved() == false){

              /* If custom theme is a string */
              if(typeof(scope.options.customTheme) == "string" && scope.options.customTheme != ""){

                /* Applies that theme */
                scope.applyTheme(scope.options.customTheme);
              }

              /* If custom theme is an object */
              else if(typeof(scope.options.customTheme) == "object"){

                /* Applies that theme */
                scope.applyTheme(scope.options.customTheme);
              }
            }
          }

          /* If there are no custom options */
          if(!scope.options.customHeight){
            document.querySelector(".console").style.height = 400;

            if(scope.options && scope.options.fixed){
              document.querySelector(".console").style.top = -400;
            }
          }

          /* Load saved configuration */
          scope.loadConfig();

          /* Show initial info */
          scope.executeCommand("console --info", true);
        };

        /* Console Things */
        /* Open/close the console */
        scope.toggle = function(){
          scope.options.open = !scope.options.open;

          if(scope.options.open === true){

            /* Scrolls to new line */
            scope.scrollBottom();

            /* Focus the new line */
            if(document.querySelector(".console .command-new-line input")){
              document.querySelector(".console .command-new-line input").focus();
            }
          }
          else{

            /* Remove the focus */
            if(document.querySelector(".console .command-new-line input")){
              document.querySelector(".console .command-new-line input").blur();
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

          scope.scrollBottom();
        }

        /* Clean the new line */
        scope.cleanLn = function(){
          scope.command = "";
          scope.apply();
        };


        /* Command things */
        /* Command builder */
        function Command(name, description, params, callback){
          this.name = name;
          this.description = "&nbsp;&nbsp;<b>"+ name +"</b>: "+ description;
          this.params = params;
          this.exec = callback;
        };

        /* Execute the command the command */
        scope.executeCommand = function(manual, noPrint){

          /* Read the command */
          if(manual && manual != ""){
            var command = manual;
          }
          else{
            var command = scope.console.command.$modelValue ? scope.console.command.$modelValue : "";
          }

          /* Clean new line */
          scope.cleanLn();

          /* Print command executed */
          if(!noPrint){
            scope.printLn(scope.options.customPrefix +"> <b>"+ command +"</b>");

            /* Save command on history */
            if(command !== ""){
              scope.history.push(command);
            }
          }

          /* Update history index */
          scope.historyIndex = false;

          /* Loop all available commands */
          var existingCommand = false;
          for(var x in scope.commands){
            var elem = scope.commands[x];

            /* The first word is the command name */
            if((command.indexOf(" --") >= 0 && command.substr(0, command.indexOf(" --")) === elem.name) || (command.indexOf(" --") < 0 && command === elem.name)){
              existingCommand = true;

              /* There are params */
              if(command.indexOf(" --") >= 0){
                var params = command.split(" --");
                var temp = {}

                /* Loop all written params */
                for(var y in params){

                  /* Skip first element */
                  var existingParam = false;
                  if(y != 0){

                    /* If param uses an '=' to introduce the value */
                    if(params[y].indexOf("=") >= 1){
                      var param = params[y].split("=", 2);
                      var p = {
                        name: param[0],
                        value: (param[1] && param[1] != "") ? removeQuotes(param[1]) : true
                      };
                    }

                    /* If param uses an ' ' to introduce the value */
                    else if(params[y].indexOf(" ") >= 1){
                      var p = {
                        name: params[y].substring(0, params[y].indexOf(" ")),
                        value: removeQuotes(params[y].substring((params[y].indexOf(" ") + 1)))
                      }
                    }

                    /* If param has no value */
                    else{
                      var p = {
                        name: params[y],
                        value: true
                      }
                    }

                    /* Loop all declared params */
                    for(var z in elem.params){
                      if(p.name === elem.params[z].name){
                        existingParam = true;
                        temp[p.name] = p.value;
                        break;
                      }
                    }

                    if(!existingParam){
                      scope.printLn("\'<b>--" + p.name + "</b>\': param not found on '<b>"+ elem.name +"</b>' command. Use \'help\' for more info.");
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
          if(!existingCommand){

            /* Print empty line */
            if(command == "" || !command){
              scope.printLn("");
            }

            /* Show error message */
            else{
              var temp = command.split(" --");
              scope.printLn("\'<b>" + temp[0] + "</b>\': command not found. Use \'help\' for more info.");
            }
          }

          /* Scrolls to new line */
          scope.scrollBottom();
        };

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
                printLn("<br />");
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
          "Clean command history ('clear' alias).",
          false,
          function(printLn, params){

            /* Clean the console */
            scope.executeCommand("clear", true);
          }
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
              name: "boldcolor",
              description: "Change the ngConsole's font color, for bold text."
            },
            {
              name: "close",
              description: "Close the console and clear commands history."
            },
            {
              name: "color",
              description: "Change the ngConsole's font color."
            },
            {
              name: "fontfamily",
              description: "Change the ngConsole's font family."
            },
            {
              name: "fontsize",
              description: "Change the ngConsole's font size."
            },
            {
              name: "info",
              description: "Display info about ngConsole."
            },
            {
              name: "theme",
              description: "Allows you to swich between different themes."
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

                /* Build new styles. */
                var temp = ".console{background:"+ params.bg +"!important;}.console *::selection{color:"+ params.bg +";}.console *::-moz-selection{color:"+ params.bg +";}";
                document.querySelector("ng-console #custom-bg").innerHTML = temp;
                scope.saveConfig("ngc-bg", params.bg);
              }

              /* Change the ngConsole's font color, for bold text. */
              if(params.boldcolor){

                /* Build new styles */
                var temp = ".console, .console b{color:"+ params.boldcolor +"!important;}";
                document.querySelector("ng-console #custom-boldcolor").innerHTML = temp;
                scope.saveConfig("ngc-boldcolor", params.boldcolor);
              }

              /* Close the console and clear commands history. */
              if(params.close){

                /* Close console */
                scope.options.open = false;

                /* Clean new line */
                scope.executeCommand("clear", true);

                /* Show console info */
                scope.executeCommand("console --info", true);

                /* Clean commands history */
                scope.history = [];
                scope.historyIndex = 0;

                /* Apply changes */
                scope.apply();
              }

              /* Change the ngConsole's font color */
              if(params.color){

                /* Build new styles */
                var temp = ".console, .console *{color:"+ params.color +"!important;}.console *::selection{background:"+ params.color +";}.console *::-moz-selection{background:"+ params.color +";}";
                document.querySelector("ng-console #custom-color").innerHTML = temp;
                scope.saveConfig("ngc-color", params.color);
              }

              /* Change the ngConsole's font color */
              if(params.fontfamily){

                /* Build new styles */
                var temp = ".console, .console *{ font-family: "+ params.fontfamily +" !important; }";
                document.querySelector("ng-console #custom-fontfamily").innerHTML = temp;
                scope.saveConfig("ngc-fontfamily", params.fontfamily);
              }

              /* Change the ngConsole's font color */
              if(params.fontsize){

                /* Build new styles */
                var temp = ".console, .console *{ font-size: "+ parseInt(params.fontsize) +"px !important; }";
                document.querySelector("ng-console #custom-fontsize").innerHTML = temp;
                scope.saveConfig("ngc-fontsize", params.fontsize);
              }

              /* Display info about ngConsole */
              if(params.info){
                printLn("<b>ngConsole v"+ _version +"</b>");
                printLn("<b>Author</b>: ImperdibleSoft (<a href='http://www.imperdiblesoft.com' target='_blank'>http://www.imperdiblesoft.com</a>)");
                printLn("<b>Repository</b>: <a href='https://github.com/ImperdibleSoft/ngConsole' target='_blank'>https://github.com/ImperdibleSoft/ngConsole</a>");
                printLn("<br />");
              }

              /* Apply a new theme */
              if(params.theme){

                /* No theme selected, show a theme list */
                if(params.theme === true){
                  printLn("Available themes:");
                  for(var x in scope.themes){
                    var theme = scope.themes[x];
                    printLn("&nbsp;&nbsp;<b>" + theme.name + "</b> (background: "+ theme.labels.bg +", color: "+ theme.labels.color +", bold color: "+ theme.labels.boldColor +")");
                  }
                }

                /* Theme selected */
                else{
                  scope.applyTheme(params.theme);
                }
              }

              /* Restore ngConsole's state to its initial state */
              if(params.reset){

                /* Close the console */
                scope.executeCommand("console --close", true);

                /* Remove styles */
                document.querySelector("ng-console #custom-bg").innerHTML = "";
                document.querySelector("ng-console #custom-color").innerHTML = "";
                document.querySelector("ng-console #custom-boldcolor").innerHTML = "";
                document.querySelector("ng-console #custom-fontfamily").innerHTML = "";
                document.querySelector("ng-console #custom-fontsize").innerHTML = "";

                /* Remove local storage */
                if(localStorage){
                  localStorage.removeItem("ngc-bg");
                  localStorage.removeItem("ngc-color");
                  localStorage.removeItem("ngc-boldcolor");
                  localStorage.removeItem("ngc-fontfamily");
                  localStorage.removeItem("ngc-fontsize");
                }

                /* If custom theme loaded */
                if(scope.options.customTheme){

                  /* Apply custom theme */
                  scope.applyTheme(scope.options.customTheme);
                }
              }
            }
          }
        );
        scope.commands.exit = new Command(
          "exit",
          "Close the console and clear commands history ('console --close' alias).",
          false,
          function(printLn, params){

            /* Close the console */
            scope.executeCommand("console --close", true);
          }
        );
        scope.commands.help = new Command(
          "help",
          "Show all available commands.",
          false,
          function(printLn, params){
            var temp = "<p>Available commands: ";
            temp += "<ul>";

            /* Loop through all declared commands */
            for(var x in scope.commands){
              var elem = scope.commands[x];
              temp += "<li>";
              temp += elem.description;

              /* Loop through all declared params */
              if(elem.params){
                temp += "<ul>";
                for(var y in elem.params){
                  var param = elem.params[y];
                  temp += "<li>";
                  temp += "&nbsp;&nbsp;&nbsp;&nbsp;<b>--"+ param.name +"</b>: "+ param.description;
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

        /* Commands history */
        scope.history = [];


        /* Theme things */
        /* Default themes */
        scope.themes = [
          {
            name: 'default',
            data: {
              bg: "rgba(0,0,0,1)",
              color: "#ccc",
              boldColor: "#fff",
              fontsize: 11,
              fontfamily: "monospace"
            },
            labels: {
              bg: "black",
              color: "light gray",
              boldColor: "white",
              fontsize: "11px",
              fontfamily: "Monospace"
            }
          },
          {
            name: 'light',
            data: {
              bg: "rgba(255,255,255,0.8)",
              color: "#333",
              boldColor: "#000",
              fontsize: 11,
              fontfamily: "monospace"
            },
            labels: {
              bg: "white",
              color: "dark gray",
              boldColor: "black",
              fontsize: "11px",
              fontfamily: "Monospace"
            }
          },
          {
            name: 'atom',
            data: {
              bg: "rgba(39,43,51,1)",
              color: "#ABB2C1",
              boldColor: "#91BF71",
              fontsize: 11,
              fontfamily: "Verdana"
            },
            labels: {
              bg: "dark gray",
              color: "light gray",
              boldColor: "green",
              fontsize: "11px",
              fontfamily: "Verdana"
            }
          },
          {
            name: 'sublime',
            data: {
              bg: "rgba(39,40,34,1)",
              color: "#FFFFE1",
              boldColor: "#54D2EF",
              fontsize: 11,
              fontfamily: "Verdana"
            },
            labels: {
              bg: "dark brown",
              color: "vanilla",
              boldColor: "light blue",
              fontsize: "11px",
              fontfamily: "Verdana"
            }
          }
        ];

        /* Apply a theme */
        scope.applyTheme = function(theme){

          /* Apply a theme by name */
          if(typeof(theme) == "string"){

            /* Loop all themes */
            for(var x in scope.themes){

              /* If selected theme is this theme */
              if(scope.themes[x].name == theme){

                /* Apply theme */
                scope.applyTheme(scope.themes[x]);
              }
            }
          }

          /* Apply a custom theme */
          else{
            if(theme.data.bg){
              scope.executeCommand("console --bg "+ theme.data.bg, true);
            }

            if(theme.data.boldColor){
              scope.executeCommand("console --boldcolor "+ theme.data.boldColor, true);
            }

            if(theme.data.color){
              scope.executeCommand("console --color "+ theme.data.color, true);
            }

            if(theme.data.fontsize){
              scope.executeCommand("console --fontsize "+ theme.data.fontsize, true);
            }

            if(theme.data.fontfamily){
              scope.executeCommand("console --fontfamily "+ theme.data.fontfamily, true);
            }
          }
        }


        /* Utils */
        /* Save custom configuration */
        scope.saveConfig = function(key, value){
          if(localStorage){
            if(key && value){
              localStorage.setItem(key, value);
            }
          }
        };

        /* Load custom configuration */
        scope.loadConfig = function(){
          if(localStorage){

            /* Change the ngConsole's background */
            if(localStorage.getItem("ngc-bg") && localStorage.getItem("ngc-bg") != ""){

              /* Apply saved style */
              scope.executeCommand("console --bg "+ localStorage.getItem("ngc-bg"), true);
            }

            /* Change the ngConsole's bold color */
            if(localStorage.getItem("ngc-boldcolor") && localStorage.getItem("ngc-boldcolor") != ""){

              /* Apply saved style */
              scope.executeCommand("console --boldcolor "+ localStorage.getItem("ngc-boldcolor"), true);
            }

            /* Change the ngConsole's font color */
            if(localStorage.getItem("ngc-color") && localStorage.getItem("ngc-color") != ""){

              /* Apply saved style */
              scope.executeCommand("console --color "+ localStorage.getItem("ngc-color"), true);
            }

            /* Change the ngConsole's font color */
            if(localStorage.getItem("ngc-fontfamily") && localStorage.getItem("ngc-fontfamily") != ""){

              /* Apply saved style */
              scope.executeCommand("console --fontfamily "+ localStorage.getItem("ngc-fontfamily"), true);
            }

            /* Change the ngConsole's font color */
            if(localStorage.getItem("ngc-fontsize") && localStorage.getItem("ngc-fontsize") != ""){

              /* Apply saved style */
              scope.executeCommand("console --fontsize "+ localStorage.getItem("ngc-fontsize"), true);
            }
          }
        };

        /* Return true | false if there is config saved */
        function isConfigSaved(){
          var saved = false;

          if(localStorage){
            if((localStorage.getItem("ngc-bg") && localStorage.getItem("ngc-bg") != "") || (localStorage.getItem("ngc-boldcolor") && localStorage.getItem("ngc-boldcolor") != "") || (localStorage.getItem("ngc-color") && localStorage.getItem("ngc-color") != "") || (localStorage.getItem("ngc-fontsize") && localStorage.getItem("ngc-fontsize") != "") || (localStorage.getItem("ngc-fontfamily") && localStorage.getItem("ngc-fontfamily") != "")){
              saved = true;
            }
          }

          return saved;
        }

        /* Scroll to new Line position */
        scope.scrollBottom = function(){
          var elem = document.querySelector(".console");
          var newTop = document.querySelector(".command-list").clientHeight + document.querySelector(".command-new-line").clientHeight;
          elem.scrollTop = newTop;
        }

        /* scope.$apply() */
        scope.apply = function(force){
          if(_dev == true || force == true){ scope.$apply(); }
        };

        /* Remove all doble quotes from a given string */
        function removeQuotes(str){
          return str.replaceAll("\"", "");
        };

        /* Relplace all elements */
        String.prototype.replaceAll = function(search, replacement) {
          var target = this;
          return target.replace(new RegExp(search, 'g'), replacement);
        };


        /* Listeners */
        /* Detect key press everywhere */
        document.addEventListener('keyup', function(e){

          /* Open/Close the console */
          if(e.keyCode == 220 || e.key == "º"){
            e.preventDefault();
            scope.toggle();
          }

          /* Remove already written */
          else if(e.keyCode == 27 || e.key == "Escape"){
            e.preventDefault();
            scope.historyIndex = false;
            if(scope.command != ""){
              scope.cleanLn();
            }
            else if(scope.options.fixed == true && scope.options.open == true){
              scope.toggle();
            }
            scope.apply(true);
          }
        });

        /* Detect key press on the input field */
        var _inputField = document.querySelector(".console .command-new-line input[type='text']");
        _inputField.addEventListener('keyup', function(e){

          /* Move up/down through all the history */
          if(e.keyCode == 38 || e.key == "Up" || e.keyCode == 40 || e.key == "Down"){
            e.preventDefault();

            /* Update the index */
            /* Move up */
            if(e.keyCode == 38 || e.key == "Up"){

              /* Empty item */
              if(scope.historyIndex === false){
                scope.historyIndex = scope.history.length - 1
              }

              /* First item */
              else if(scope.historyIndex === 0){
                scope.historyIndex = false;
              }

              /* Any other item */
              else{
                scope.historyIndex--;
              }
            }

            /* Move down */
            else if(e.keyCode == 40 || e.key == "Down"){

              /* Empty item */
              if(scope.historyIndex === false){
                scope.historyIndex = 0;
              }

              /* Last item */
              if(scope.historyIndex === (scope.history.length - 1)){
                scope.historyIndex = false;
              }

              /* Any other item */
              else{
                scope.historyIndex++;
              }
            }

            /* Place the command */
            scope.command = (scope.historyIndex === false) ? "" : scope.history[ scope.historyIndex ];
            scope.apply(true);
          }
        });

        /* Detect clic on the console */
        var _console = document.querySelector(".console");
        _console.addEventListener('click', function(e){

          /* Place the focus on the input */
          _inputField.focus();
        });

        scope.init();
      }
    }
}]);
