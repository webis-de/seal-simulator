# SEAL
Web user simulation framework.

## Quickstart 
```
npm install
node bin/simulate.js \
  --script-directory scripts/ScrollDown \
  --input-directory doc/example/scrollDownInput \
  --output-directory output

cat doc/example/scrollDownInput/run.json \
  | node bin/simulate.js \
      --script-directory scripts/ScrollDown \
      --configuration-from-stdin \
      --output-directory output
```
