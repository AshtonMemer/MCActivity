@echo off
cls
if not exist node_modules npm i&pause&call %~n0
:start
node index.js
@echo.
@echo Press any key to restart bot...&pause >nul
call %~n0