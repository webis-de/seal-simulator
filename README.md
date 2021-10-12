# SEAL
Web user simulation framework.

## Quickstart 
```
npm install
node src/app.js \
  --script-directory src/scripts/ScrollDown \
  --input-directory doc/example/scrollDownInput \
  --output-directory output

cat doc/example/scrollDownInput/run.json \
  | node src/app.js \
      --script-directory src/scripts/ScrollDown \
      --configuration-from-stdin \
      --output-directory output
```
