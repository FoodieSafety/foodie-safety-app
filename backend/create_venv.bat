@echo off
setlocal enabledelayedexpansion

REM Get the script directory
set script_dir=%~dp0

REM Check if Python is installed
where python3 >nul 2>&1
if %errorlevel% neq 0 (
    echo Python3 could not be found. Please install Python3.
    exit /b 1
)

REM Check if the virtual environment already exists
if exist "%script_dir%.venv" (
    echo Virtual environment already exists
) else (
    echo Creating a new virtual environment...
    python3 -m venv "%script_dir%.venv"
)

REM Activate the virtual environment
echo Activating the virtual env
call "%script_dir%.venv\Scripts\activate"

REM Install required packages
if exist "%script_dir%requirements.txt" (
    echo requirements.txt found, installing required packages...
    pip install --upgrade pip
    for /f "tokens=*" %%i in (%script_dir%requirements.txt) do (
        pip show %%i >nul 2>&1 || pip install %%i
    )
) else (
    echo requirements.txt not found. Skipping package installation.
)

REM Inform on how to deactivate the virtual environment
echo Deactivating the virtual env...
deactivate

echo Completed virtual environment setup.
endlocal
pause