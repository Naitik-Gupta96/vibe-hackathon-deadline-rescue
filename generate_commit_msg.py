#!/usr/bin/env python3
import sys
import os
from google import genai

# Initialize the client; assumes GEMINI_API_KEY is present in the environment
client = genai.Client()

# Read the git diff passed as a command-line argument from the bash script
if len(sys.argv) < 2:
    print("")
    sys.exit(0)

diff_payload = sys.argv[1]

# Construct the highly constrained prompt for the LLM
prompt = f"""
You are an expert DevOps AI operating within an automated microcommit pipeline.
Your sole function is to analyze the following Git diff and generate a single, concise commit message.
The message must be strictly under 50 characters.
You must use the imperative mood (e.g., 'Add user authentication feature' NOT 'Added user authentication feature' or 'Adding...').
Do not explain the why, only describe the what.
Respond ONLY with the raw text of the commit message. Do not include markdown formatting, quotes, or any conversational filler.

Diff Payload:
{diff_payload}
"""

# Execute the synchronous generation request using a highly efficient flash model
try:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    print(response.text.strip())
except Exception as e:
    # Fail silently to allow the bash script fallback to trigger without breaking the pipeline
    print("")