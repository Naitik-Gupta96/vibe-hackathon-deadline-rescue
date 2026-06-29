import sys
sys.path.insert(0, '.')

from dotenv import load_dotenv
load_dotenv()

import asyncio
from backend.agent import DeadlineRescueAgent


async def test():
    agent = DeadlineRescueAgent()
    result = await agent.process_message(
        "Rescue my day - I have a hackathon deadline at 2PM today"
    )
    rp = result["rescue_plan"]
    fp = rp["failure_prediction"]
    print(f"Failure Probability: {fp['probability']}%")
    print(f"Explanation: {fp['explanation'][:120]}...")
    print(f"Events to delete: {len(rp['events_to_delete'])}")
    print(f"Focus blocks to create: {len(rp['focus_blocks_to_create'])}")
    print(f"Thoughts logged: {len(result['thought_log'])}")
    for t in result["thought_log"]:
        print(f"  [{t['agent']}] {t['message'][:70]}")
    print("\nPIPELINE TEST PASSED")


asyncio.run(test())
