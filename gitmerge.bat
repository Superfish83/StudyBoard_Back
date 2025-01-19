echo merge develop to main
@echo off
git checkout main
git merge develop
git push -u origin main
git push -u origin develop
git checkout develop