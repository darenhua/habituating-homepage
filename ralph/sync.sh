#!/bin/bash
cat ./prompt.md | \
        claude -p --output-format=stream-json --verbose --dangerously-skip-permissions | \
        tee -a ralph/claude_output.jsonl
        npx repomirror visualize --debug;
