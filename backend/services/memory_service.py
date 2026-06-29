from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from backend.schemas import UserHabits
import json
import os
from pathlib import Path


class MemoryService(ABC):
    @abstractmethod
    async def get_habits(self, user_id: str) -> UserHabits:
        pass

    @abstractmethod
    async def save_habits(self, user_id: str, habits: UserHabits) -> None:
        pass

    @abstractmethod
    async def record_outcome(
        self, user_id: str, task_type: str, estimated: int, actual: int
    ) -> None:
        pass


class MockMemoryService(MemoryService):
    def __init__(self, path: str = "backend/data/memory.json"):
        self.path = Path(path)
        self._ensure_file()

    def _ensure_file(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            demo_habits = {
                "demo-user": {
                    "skips_morning_blocks": True,
                    "underestimates_coding_minutes": 45,
                    "preferred_focus_hours": [22, 23, 0, 1],
                    "avg_meeting_overrun_minutes": 15,
                    "productivity_patterns": {
                        "morning_productivity": 0.3,
                        "afternoon_productivity": 0.6,
                        "evening_productivity": 0.9,
                        "late_night_productivity": 0.8
                    }
                }
            }
            self.path.write_text(json.dumps(demo_habits, indent=2))

    async def get_habits(self, user_id: str) -> UserHabits:
        data = json.loads(self.path.read_text())
        if user_id in data:
            return UserHabits(**data[user_id])
        return UserHabits()

    async def save_habits(self, user_id: str, habits: UserHabits) -> None:
        data = json.loads(self.path.read_text())
        data[user_id] = habits.model_dump()
        self.path.write_text(json.dumps(data, indent=2))

    async def record_outcome(
        self, user_id: str, task_type: str, estimated: int, actual: int
    ) -> None:
        data = json.loads(self.path.read_text())
        if user_id not in data:
            data[user_id] = UserHabits().model_dump()
        if "outcomes" not in data[user_id]:
            data[user_id]["outcomes"] = []
        data[user_id]["outcomes"].append({
            "task_type": task_type,
            "estimated": estimated,
            "actual": actual,
            "ratio": actual / estimated if estimated > 0 else 1.0
        })
        self.path.write_text(json.dumps(data, indent=2))


# TODO: Replace with real implementation when credentials available
# class FirestoreMemoryService(MemoryService):
#     def __init__(self, service_account_path: str):
#         import firebase_admin
#         from firebase_admin import credentials, firestore
#         cred = credentials.Certificate(service_account_path)
#         firebase_admin.initialize_app(cred)
#         self.db = firestore.client()
#     
#     async def get_habits(self, user_id: str) -> UserHabits:
#         doc = self.db.collection("users").document(user_id).get()
#         if doc.exists:
#             return UserHabits(**doc.to_dict())
#         return UserHabits()
#     
#     async def save_habits(self, user_id: str, habits: UserHabits) -> None:
#         self.db.collection("users").document(user_id).set(habits.model_dump())
#     
#     async def record_outcome(...): pass


def get_memory_service() -> MemoryService:
    return MockMemoryService()