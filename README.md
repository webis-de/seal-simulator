# SEAL
Web user simulation framework.

## Quickstart 

Global installation
```
npm install -g

# adjust for your system, might already be set
export NODE_PATH=/usr/local/lib/node_modules/

# run with configuration in input directory
seal-simulator \
  --script-directory scripts/ScrollDown \
  --input-directory doc/example/scrollDownInput \
  --output-directory output

# run with configuration from standard input
cat doc/example/scrollDownInput/run.json \
  | seal-simulator \
      --script-directory scripts/ScrollDown \
      --configuration-from-stdin \
      --output-directory output
```

