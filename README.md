# pomodoro timer project
This is a project from roadmaps for setting up an pomodoro timer application and can be found here:

https://roadmap.sh/projects/pomodoro-timer

## Requirements
Create pomodoro timer web application using a React frontend framework.

User should be able to start stop and resume a pomodoro timer.

User should be able to configure the default interval configuration; default work session should be 25 minutes, short break should be 5 minutes and longer break after 4 work sessions should be 15 minutes.

Application should display the current session type (e.g., Work, Short Break, Long Break).

It should also track the number of tracked work sessions

Play a sound when a session ends to notify the user.

Ensure the app is accessible and visually appealing on both desktop and mobile devices.

Implement state management for the timer and session tracking

Use modular and reusable code structure

Maintain proper accessibility standards

Deployment should be on GitHub Pages, Vercel or Cloudflare pages

## Getting Started
This React app is Vite-based. Vite is a build tool which runs a development server and bundles the code for production. React handles the screen structure and screen updates, while Vite starts a local server, reloads the page after a file save, and packages file for the app. 

To get React and Vite, use Node Package Manager (npm) to download and install these libraries.

### Install Node.js and npm on Mac
Use Homebrew to install node. You may be asked to update dependencies. Select yes to install them.
```
brew install node
```
You should now have node and npm installed. Check the versions to make sure. You will need Node version 20.19 or newer or 22.12 or newer.
```
# Example showing where node and npm are and what versions
➜  ~ which npm
/opt/homebrew/bin/npm
➜  ~ which node
/opt/homebrew/bin/node
➜  ~ node -v
v26.13.1
➜  ~ which npm
/opt/homebrew/bin/npm
➜  ~ npm -v
11.20.0
➜  ~
```

### Initialize the Pomodoro Timer Node project
Setup an initial Node project using vite and react.
If using a git repo, just use . instead of pomodoro-timer and ignore Vite warnings of existing files. Select ignore files and continue option. Do not select remove existing files, as you don't want to remove your repos content.
```
# Create new Project - non git repo area
npm create vite@latest pomodoro-timer -- --template react
cd pomodoro-timer
npm install

# OR using within a git repo named pomodoro-timer
cd ~/Projects/Roadmaps/Docker/pomodoro-timer
npm create vite@latest . -- --template react
# choose Ignore files and continue
# choose ESLint
# choose Yes to Install with npm and start now
```

### Navigate to Starter page
Navigate to the page to the Vite development server. In your browser navigate to ```http://localhost:5173```

Leave this open while you work to see 