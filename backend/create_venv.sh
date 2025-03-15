#!/bin/bash
echo "Setting up a virtual env for backend"

# Get the directory of the script
script_dir=$(dirname "$(realpath "$0")")

# Ensure python3 exists locally
if ! command -v python3 &> /dev/null
then
    echo "Python3 could not be found. Please install Python3."
    exit
fi

# Check if the virtual environment already exists
if [ -d "$script_dir/.venv" ]; then
    # Virtual environment already exists
    echo "Virtual env already exists"
else
    # Create a virtual environment
    echo "Creating the virtual env named venv"
    python3 -m venv "$script_dir/.venv"

# Activate the virtual environment
echo "Activating the virtual env"
source "$script_dir/.venv/bin/activate"

# Install required packages
if [ -f "$script_dir/requirements.txt" ]; then
    echo "requirements.txt found. Installing required packages."
    pip install --upgrade pip
    while IFS= read -r package; do
        pip show "$package" &> /dev/null || pip install "$package"
    done < "$script_dir/requirements.txt"
else
    echo "requirements.txt not found. Skipping package installation."
fi

# Inform on how to deactivate the virtual environment
echo "Deactivating the virtual env"
deactivate

echo "Completed virtual environment setup"