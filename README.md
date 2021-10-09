# SEAL-Simulator
Application framework to simulate web users

## Quickstart 
```
npm install
```

## Introduction
The starting point of the application is the *app.js* file.

The Application Arguments could be:
```
app.js -o outputdirectory -i inputdirectory -s src/scripts/user-simulation/distjs
```
The script-directory ( *-s* ) containing a valid *SealScript.js*, 
which needs to be a derived class from the *AbstractSealScript.js* class.
