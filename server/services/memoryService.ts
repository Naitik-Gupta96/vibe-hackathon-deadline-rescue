import { UserHabits } from "../types"
import * as fs from "fs"
import * as path from "path"

export interface IMemoryService {
  getHabits(userId: string): Promise<UserHabits>
  saveHabits(userId: string, habits: UserHabits): Promise<void>
  recordOutcome(userId: string, taskType: string, estimated: number, actual: number): Promise<void>
}

export class MockMemoryService implements IMemoryService {
  private filePath: string

  constructor(filePath = "server/data/memory.json") {
    this.filePath = filePath
    this.ensureFile()
  }

  private ensureFile() {
    const dir = path.dirname(this.filePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    if (!fs.existsSync(this.filePath)) {
      const demo: Record<string, any> = {
        "demo-user": {
          skips_morning_blocks: true,
          underestimates_coding_minutes: 45,
          preferred_focus_hours: [22, 23, 0, 1],
          avg_meeting_overrun_minutes: 15,
          productivity_patterns: {
            morning_productivity: 0.3,
            afternoon_productivity: 0.6,
            evening_productivity: 0.9,
            late_night_productivity: 0.8,
          },
        },
      }
      fs.writeFileSync(this.filePath, JSON.stringify(demo, null, 2))
    }
  }

  private readData(): Record<string, any> {
    return JSON.parse(fs.readFileSync(this.filePath, "utf-8"))
  }

  private writeData(data: Record<string, any>) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2))
  }

  async getHabits(userId: string): Promise<UserHabits> {
    const data = this.readData()
    if (data[userId]) return data[userId] as UserHabits
    return {
      skips_morning_blocks: false,
      underestimates_coding_minutes: 0,
      preferred_focus_hours: [],
      avg_meeting_overrun_minutes: 0,
      productivity_patterns: {},
    }
  }

  async saveHabits(userId: string, habits: UserHabits): Promise<void> {
    const data = this.readData()
    data[userId] = habits
    this.writeData(data)
  }

  async recordOutcome(userId: string, taskType: string, estimated: number, actual: number): Promise<void> {
    const data = this.readData()
    if (!data[userId]) data[userId] = { outcomes: [] }
    if (!data[userId].outcomes) data[userId].outcomes = []
    data[userId].outcomes.push({ task_type: taskType, estimated, actual, ratio: actual / (estimated || 1) })
    this.writeData(data)
  }
}

// TODO: Replace with real Firebase Firestore implementation
// export class FirestoreMemoryService implements IMemoryService { ... }
