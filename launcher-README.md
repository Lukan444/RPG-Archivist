# RPG Archivist Launcher

This launcher provides an easy way to start the RPG Archivist application with a single click.

## Setup Instructions

1. **Run the PowerShell script to create a desktop shortcut:**
   - Right-click on `create-desktop-shortcut.ps1`
   - Select "Run with PowerShell"
   - If you get a security warning, you may need to run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first

2. **Alternative manual setup:**
   - Create a shortcut to `start-rpg-archivist.bat` on your desktop manually
   - Right-click on your desktop
   - Select New > Shortcut
   - Browse to the `start-rpg-archivist.bat` file and select it
   - Click Next and give it a name like "RPG Archivist"
   - Click Finish

## Usage

1. **Start the application:**
   - Double-click the "RPG Archivist" shortcut on your desktop
   - This will start both the backend and frontend servers
   - Your default web browser will open automatically to http://localhost:3000

2. **Stop the application:**
   - Close the command prompt windows that opened
   - Or press Ctrl+C in each command prompt window and then type 'Y' to terminate the batch job

## Troubleshooting

If you encounter any issues:

1. **Make sure Node.js is installed and in your PATH**
2. **Verify that the project path in the batch file is correct:**
   - Open `start-rpg-archivist.bat` in a text editor
   - Check that the `PROJECT_DIR` variable points to your RPG Archivist installation
3. **Check that npm dependencies are installed:**
   - Open a command prompt
   - Navigate to your project directory
   - Run `cd frontend && npm install`
   - Run `cd backend && npm install`

## Customization

You can edit the `start-rpg-archivist.bat` file to customize:

- The project directory path
- The delay times between starting services
- Whether to automatically open the browser
