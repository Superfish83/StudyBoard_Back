@echo off
set /p commit_message="Enter your commit message: "
git checkout develop
git add .
git commit -m "%commit_message%"