#!/bin/bash
# Microcommit Daemon for Local Agentic Workflows
# Watches for file changes and creates atomic commits with AI-generated messages

WATCH_DIR="."
BRANCH="main"

echo "Initializing Agentic Microcommit Daemon on directory: $WATCH_DIR..."

# Validate the presence of the inotify-tools package
if ! command -v inotifywait &> /dev/null; then
    echo "CRITICAL ERROR: inotifywait could not be found. Please install inotify-tools via apt or brew."
    exit 1
fi

# Initialize git if not already
if [ ! -d ".git" ]; then
    git init
    git checkout -b $BRANCH
fi

# Infinite execution loop monitoring kernel-level file events
while true; do
    # Suspend execution until a modify, create, delete, or move event occurs.
    # The .git directory is strictly excluded to prevent infinite recursive loops.
    inotifywait -r -q -e modify,create,delete,move --exclude "\.git" "$WATCH_DIR"
    
    echo "File state mutation detected. Initiating automated microcommit sequence..."
    
    # Debounce mechanism: suspend for 3 seconds to allow the agent to finish writing chunked file streams
    sleep 3
    
    # Stage all mutated files
    git add .
    
    # Extract the cached diff to provide context for the LLM
    DIFF_CONTENT=$(git diff --cached)
    
    # If the diff is empty (e.g., file saved with no changes), bypass the loop
    if [ -z "$DIFF_CONTENT" ]; then
        continue
    fi
    
    # Execute a lightweight Python bridge script to query the Google GenAI SDK
    # and generate a semantic commit message based on the diff content.
    echo "Analyzing diff via Gemini 2.5 Flash to generate semantic commit message..."
    COMMIT_MSG=$(python3 generate_commit_msg.py "$DIFF_CONTENT")
    
    # Fallback safety mechanism if the API call fails or times out
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Auto-commit: Agent state mutation and file update"
    fi
    
    # Execute the commit with the AI-generated message
    git commit -m "$COMMIT_MSG"
    
    # Push changes immediately to the remote origin to ensure cloud synchronization
    git push origin "$BRANCH" --force 2>/dev/null || true
    
    echo "Microcommit finalized and pushed: $COMMIT_MSG"
done