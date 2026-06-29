import { GoogleGenAI } from "@google/genai"
import { CalendarEvent, ExternalConstraints } from "../types"

export class ResearchAgent {
  private client: GoogleGenAI

  constructor(client: GoogleGenAI) {
    this.client = client
  }

  async checkExternalConstraints(events: CalendarEvent[]): Promise<ExternalConstraints> {
    const locations = events.map(e => e.location).filter(Boolean) as string[]
    if (locations.length === 0) {
      return { traffic_minutes: {}, weather: undefined, venue_hours: {}, transit_options: [] }
    }

    const locationText = [...new Set(locations)].join("; ")
    const prompt = `You are a research assistant. I have events at these locations: ${locationText}

For each location, check:
1. Current traffic conditions between locations
2. Weather affecting travel
3. Typical venue hours
4. Transit options

Return a JSON object with:
- "traffic_minutes": dict mapping location pairs to estimated drive times
- "weather": brief weather note
- "venue_hours": dict of location to typical hours
- "transit_options": list of transit recommendations

Return ONLY valid JSON. No markdown formatting.`

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      })
      let text = response.text?.trim() || "{}"
      if (text.startsWith("```")) text = text.split("\n").slice(1).join("\n").replace(/```/g, "").trim()
      const data = JSON.parse(text)
      return {
        traffic_minutes: data.traffic_minutes ?? {},
        weather: data.weather ?? undefined,
        venue_hours: data.venue_hours ?? {},
        transit_options: data.transit_options ?? [],
      }
    } catch {
      return { traffic_minutes: {}, weather: undefined, venue_hours: {}, transit_options: [] }
    }
  }
}
