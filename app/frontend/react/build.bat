@echo off
cd /d "I:\MyProjects\TaskBeacon\app\frontend\react"
mkdir react-build
cd react-build
call npx --yes create-vite@5.5.5 . --template react
call npm install
del src\*.jsx
del src\*.css
del src\assets\*.svg
del vite.config.js
copy ..\main.jsx src
copy ..\LoginPage.jsx src
copy ..\vite.config.js .
call npm run build
cd ..\..
mkdir assets
copy react\react-build\dist\index.html .
cd assets
copy ..\react\react-build\dist\assets\* .
cd ..\react
rmdir /S /Q react-build
exit