#!/bin/bash

function isSimulationComplete() {
  local logFile=1

  cat $logFile \
    | jq '.
      | select(.event == "script-run-finished")
      | .simulationComplete' \
    | tail -n 1
}

