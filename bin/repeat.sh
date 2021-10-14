#!/bin/bash

if [ $# -lt 2 ];then
  echo "Usage:"
  echo "  $0 <base-directory> <seal-command> [<seal-command-arguments>] "
  echo "Where:"
  echo "  base-directory"
  echo "    Is the input directory for the first iteration (if the directory"
  echo "    exists) and prefix for the output directories (the suffix is the"
  echo "    iteration number) and used as input directory for the next"
  echo "    iteration."
  echo "  seal-command and seal-command-arguments"
  echo "    Is the command and arguments that is run repeatedly (the arguments"
  echo "    must contain neither --input-directory nor --output-directory!)"
  exit 1
fi

baseDirectory=$1
shift
baseCommand="$@"

outputDirectory=$baseDirectory-$(printf '%06d' 1)
command="$baseCommand --output-directory $outputDirectory"
if [ -d $baseDirectory ];then
  command="$command --input-directory $baseDirectory"
fi

iteration=1
simulationComplete=false
while [ "$simulationComplete" == "false" ];do
  mkdir -p $outputDirectory
  eval "$command" 2>&1 | tee $outputDirectory/simulate.log

  let iteration++
  simulationComplete=$(cat $outputDirectory/simulate.log | jq 'select(.event == "script-run") | .simulationComplete' | tail -n 1)
  inputDirectory=$outputDirectory
  outputDirectory=$baseDirectory-$(printf '%06d' $iteration)
  command="$baseCommand --input-directory $inputDirectory --output-directory $outputDirectory"
done
