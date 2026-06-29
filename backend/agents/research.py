from typing import List
from google import genai
from google.genai import types
from backend.schemas import CalendarEvent, ExternalConstraints


class ResearchAgent:
    def __init__(self, client: genai.Client):
        self.client = client
        search_tool = types.Tool(google_search=types.GoogleSearch())
        self.config = types.GenerateContentConfig(tools=[search_tool])

    async def check_external_constraints(
        self, events: List[CalendarEvent]
    ) -> ExternalConstraints:
        locations = [e.location for e in events if e.location]
        if not locations:
            return ExternalConstraints()

        location_text = "; ".join(set(locations))
        prompt = f"""You are a research assistant. I have events at these locations: {location_text}

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

Return ONLY valid JSON. No markdown formatting."""
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=self.config
            )
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            import json
            data = json.loads(text)
            return ExternalConstraints(
                traffic_minutes=data.get("traffic_minutes", {}),
                weather=data.get("weather"),
                venue_hours=data.get("venue_hours", {}),
                transit_options=data.get("transit_options", [])
            )
        except Exception:
            return ExternalConstraints()