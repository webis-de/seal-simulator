# SEAL Simulator
Web user simulation framework.

[[code](https://github.com/webis-de/seal-simulator)]
[[node](https://www.npmjs.com/package/seal-simulator)]
[[docker](https://github.com/webis-de/seal-simulator/pkgs/container/seal-simulator)]

## Quickstart 
Global installation
```
npm install -g # may require sudo

# adjust for your system, might already be set
export NODE_PATH=/usr/local/lib/node_modules/

# run with configuration in input directory
seal-simulate \
  --script-directory scripts/ScrollDown \
  --input-directory doc/example/scrollDownInput \
  --output-directory output

# run with configuration from standard input
cat doc/example/scrollDownInput/config.json \
  | seal-simulate \
      --script-directory scripts/ScrollDown \
      --input-directory - \
      --output-directory output
```

## CI
Update version (X.X.X) in `package.json` and `lib/constants.js`.
```
git tag vX.X.X
git push origin vX.X.X
```
Will automatically publish to npm and ghcr.
