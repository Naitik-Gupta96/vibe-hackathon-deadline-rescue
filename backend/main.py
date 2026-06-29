import os
import json
import asyncio
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.schemas import WSMessage, RescuePlan
from backend.agent import get_agent

load_dotenv()

app = FastAPI(title="Deadline Rescue Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def safe_send(websocket: WebSocket, message: dict):
    try:
        await websocket.send_json(message)
    except Exception:
        pass


@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    agent = get_agent()
    user_id = "demo-user"
    pending_plan = None

    await safe_send(websocket, {
        "type": "agent_thought",
        "payload": {
            "agent": "system",
            "message": "Deadline Rescue Agent ready. Describe your critical deadline or say 'Rescue my day'.",
            "status": "complete"
        },
        "timestamp": datetime.now().isoformat()
    })

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "user_message")
            payload = data.get("payload", {})

            if msg_type == "user_message":
                text = payload.get("text", "")

                if text.lower() in ["approve", "approve & execute", "approve and execute"]:
                    if pending_plan:
                        await safe_send(websocket, {
                            "type": "agent_thought",
                            "payload": {
                                "agent": "scheduler",
                                "message": "Executing rescue plan on your calendar...",
                                "status": "thinking"
                            },
                            "timestamp": datetime.now().isoformat()
                        })
                        result = await agent.execute_plan(pending_plan, user_id)
                        await safe_send(websocket, {
                            "type": "execution_result",
                            "payload": result,
                            "timestamp": datetime.now().isoformat()
                        })
                        pending_plan = None
                    continue

                await safe_send(websocket, {
                    "type": "agent_thought",
                    "payload": {
                        "agent": "planner",
                        "message": "Analyzing your schedule and calculating deadline risk...",
                        "status": "thinking"
                    },
                    "timestamp": datetime.now().isoformat()
                })

                result = await agent.process_message(text, user_id)

                for thought in result["thought_log"]:
                    await safe_send(websocket, {
                        "type": "agent_thought",
                        "payload": thought,
                        "timestamp": datetime.now().isoformat()
                    })
                    await asyncio.sleep(0.3)

                rescue_plan_data = result["rescue_plan"]
                pending_plan = RescuePlan(**rescue_plan_data)

                await safe_send(websocket, {
                    "type": "plan_ready",
                    "payload": {
                        "rescue_plan": rescue_plan_data,
                        "message": "Rescue plan is ready. Review and click 'Approve & Execute' to implement."
                    },
                    "timestamp": datetime.now().isoformat()
                })

            elif msg_type == "approval":
                if pending_plan:
                    await safe_send(websocket, {
                        "type": "agent_thought",
                        "payload": {
                            "agent": "scheduler",
                            "message": "Executing rescue plan on your calendar...",
                            "status": "thinking"
                        },
                        "timestamp": datetime.now().isoformat()
                    })
                    result = await agent.execute_plan(pending_plan, user_id)
                    await safe_send(websocket, {
                        "type": "execution_result",
                        "payload": result,
                        "timestamp": datetime.now().isoformat()
                    })
                    pending_plan = None

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await safe_send(websocket, {
            "type": "error",
            "payload": {"message": f"Error: {str(e)}"},
            "timestamp": datetime.now().isoformat()
        })


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0", "timestamp": datetime.now().isoformat()}


dist_path = os.path.join(os.path.dirname(__file__), "..", "dist")
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="frontend")