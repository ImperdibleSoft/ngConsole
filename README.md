# ngConsole
Small directive for angular, to implement a console that's able to execute commands. You can see a demo <a href="http://imperdiblesoft.github.io/ngConsole/demo/" target="_blank">here</a>.<br />

With this directive, developers can avoid to design and create a user interface for small tasks like cleaning server cache, restart some backend tasks and so on. Just create the logic, and ngConsole will allow you to execute all these actions from the same place.

<h2>Self documented commands</h2>
Thanks to the format we are using, the default command <code>help</code> is able to show a small documentation for all commands (including custom comands) and their params. Also error messages are displayed for non-recognized commands or params.

# Installation
To install ngConsole on your project, follow these steps: <br />
1) Make a <code>npm install ng-console</code>. <br />
2) Copy the file <code>node_modules/ng-console/build/ngConsole.js</code> to your project's folder. <br />
3) Declare ngConsole as a dependency for your module <code>angular.module('myApp' ['ngConsole'])</code> <br />
4) Save it. You are done!

# Use
Now, you just have to write <code>&lt;ng-console&gt;&lt;/ng-console&gt;</code> on your code, and that's it,
you already have a console installed on your Angular website.

You can use different attributes to customize it:
* *open*: Open by default (<code>boolean</code>)
* *fixed*: Embeded in your HTML, or fixed and hidden (<code>boolean</code>)
  * If it's fixed, you should press º to open it.
* *fullsize*: When fixed, filling the entire screen (<code>boolean</code>)
* *custom-height*: Set a custom height, this will be ignored if fullsize is true (<code>number</code>).
* *custom-prefix*: The prefix displayed (<code>string</code>)
* *custom-commands*: An array with commands that you wanna add to the console. (<code>boolean</code>)

# Custom commands
Custom commands must have particular properties to make them work. Each command must have:
* name: The keyword used to execute the command (<code>string</code>)
* description: A short description to show with <code>help</code> command (<code>string</code>)
* params: A list of parameters that can be used with this command (Object: <code>{name: "string", description: "string"}</code>)
* action: The function that's gonna be executed (<code>function(printLn, params){ whatever(); }</code>).

<h2>Parameters</h2>
When declaring your action function, as described below, you have to use these params:
* *printLn*: A function that allows you to print on the console.
* *params*: If the user introduced parameters when executing the command, they will be returned inhere (Object <code>{paramName: paramValue}</code>).

If user wants to use parameters, he/she can use any of these combinations:
* <code>say --text Hello world</code>
* <code>say --text "Hello world"</code>
* <code>say --text=Hello world</code>
* <code>say --text="Hello world"</code>

In our live example, our custom command <code>say</code> accepts params, so if you execute <code>say --text Something</code>, it's going to prompt you "something". And we are able to get it by doing this: <br /><br />
<code>function(printLn, params){</code><br />
<code>&nbsp;&nbsp;if(params && params.text){</code><br />
<code>&nbsp;&nbsp;&nbsp;&nbsp;printLn(params.text);</code><br />
<code>&nbsp;&nbsp;}</code><br />
<code>}</code><br />

# Custom theme
If you want to customize ngConsole's default colors, you can specify a <code>customTheme</code> on your <code>options</code> object.
* If you want to use a stock theme, just write its name, like this: <code>$scope.options.customTheme = "light"</code>
* If you want to create a new theme, that's going to be available on your console, write this:

<code>$scope.options.customTheme = {</code><br />
<code>&nbsp;&nbsp;name: "my theme name",</code><br />
<code>&nbsp;&nbsp;&nbsp;&nbsp;data:{</code><br />
<code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;bg: "any-css-color",</code><br />
<code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;color: "any-css-color",</code><br />
<code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;boldColor: "any-css-color",</code><br />
<code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fontfamily: number,</code><br />
<code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fontsize: "string-font-name"</code><br />
<code>&nbsp;&nbsp;&nbsp;&nbsp;},</code><br />
<code>&nbsp;&nbsp;&nbsp;&nbsp;labels:{</code><br />
<code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;bg: "The color name that's going to be displayed",</code><br />
<code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;color: "The color name that's going to be displayed",</code><br />
<code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;boldColor: "The color name that's going to be displayed"</code><br />
<code>&nbsp;&nbsp;&nbsp;&nbsp;}</code><br />
<code>&nbsp;&nbsp;}</code><br />
<code>}</code><br />
