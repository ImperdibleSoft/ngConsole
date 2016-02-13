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
* name: The keyword used to execute the command (string)
* description: A short description to show with <code>help</code>
* action: The function that's gonna be executed. 

# Params
If you wanna use params, you have to declare the 'action' function like this <code>function(params){ whatever(); }</code>
It's very important to use this param. This is the way ngConsole can use params.

On our live example, our custom command <code>say</code> accepts params, so if you execute <code>say something</code>, it's going to prompt you "something".

Of course, you can play with your params like you want, inside the "action" function
