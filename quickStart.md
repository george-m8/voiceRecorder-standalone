### Voice Recorder Standalone Component
This is a standalone voice recording component built on Node/React. This webapp uses a React front end and a Node server to handle uploads. reactMediaRecorder has been used to create the audio recording functionality. TailWindCSS is used for styling and requires a script to be run if styling or layout changes are made to the React webapp.

To start the webapp/server in development mode, follow the bellow steps.

## To start in development mode:
# Start React app:
From project directory, run:
```zsh
cd voice-recorder-app
npm start
```

# Start node server:
From project directory, run:
```zsh
cd server
npm start
```

## Tailwind CSS
# To generate an Tailwind CSS output once:
From project directory, run:
```zsh
cd voice-recorder-app
npx tailwindcss -c ./tailwind.config.js -i src/tailwind-input.css -o src/tailwind-output.css
```

# Watch tailwind and generate output upon change:
From project directory, run:
```zsh
cd voice-recorder-app
npx tailwindcss -c ./tailwind.config.js -i src/tailwind-input.css -o src/tailwind-output.css --watch
```