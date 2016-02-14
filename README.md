# ngConsole
Small directive for angular, to implement a console that's able to execute commands. You can see a demo <a href="http://imperdiblesoft.github.io/ngConsole/demo/" target="_blank">here</a>.

# Install
To install ngConsole on your project, just type <code>npm install ng-console</code>

# Use
Simply write <code>&lt;ng-console&gt;&lt;/ng-console&gt;</code> on your code, and that's it,
you already have a console installed on your Angular website.

You can use different attributes to customize it:
* *open*: Open by default (true|false)
* *fixed*: Embeded in your HTML, or fixed and hidden (true|false)
  * If it's fixed, you should press º to open it.
* *fullsize*: When fixed, filling the entire screen (true|false)
* *custom-height*: Set a custom height, this will be ignored if fullsize is true (number).
* *custom-prefix*: The prefix displayed (string)
* *custom-commands*: An array with commands that you wanna add to the console. (true|false)

# Custom commands
Custom commands should have a particular properties. Each command must have:
* name: The keyword used to execute the command (<code>"string"</code>)
* description: A short description to show with <code>help</code> command (<code>"string"</code>)
* params: A list of parameters that can be used with this command (Object: <code>{name: "string", description: "string"}</code>)
* action: The function that's gonna be executed (<code>function(printLn, params){ whatever(); }</code>). 

# Params
When declaring your action function, as described below, you have to use these params:
* *printLn*: A function that allows you to print on the console.
* *params*: If the user introduced parameters when executing the command, they will be returned inhere (Object <code>{paramName: paramValue}</code>).

In our live example, our custom command <code>say</code> accepts params, so if you execute <code>say --text="something"</code>, it's going to prompt you "something". And we are able to get it by doing this: <br /><br />
function(printLn, params){ <br />
&nbsp;&nbsp;if(params && params.text){ <br />
&nbsp;&nbsp;&nbsp;&nbsp;printLn(params.text); <br />
&nbsp;&nbsp;} <br />
} <br />
