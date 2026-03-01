import { CompanionPersona, ALL_COMPANIONS, MAYA, MATEO, CLAIRE, DANIEL } from "./personas";

export type UserNeed =
  | "someone_to_listen"
  | "motivation"
  | "story"
  | "advice"
  | "just_chat";

export type UserMood = "good" | "okay" | "low";

export interface MatchResult {
  companion: CompanionPersona;
  reason: string;
}

export function matchCompanionToNeed(need: UserNeed, mood?: UserMood): MatchResult {
  switch (need) {
    case "someone_to_listen":
      return {
        companion: CLAIRE,
        reason: "Claire is wonderful at making you feel truly heard without judgment.",
      };

    case "motivation":
      return {
        companion: mood === "low" ? MATEO : MAYA,
        reason:
          mood === "low"
            ? "Mateo offers grounded encouragement without pressure."
            : "Maya understands ambition and can help you find your drive.",
      };

    case "story":
      return {
        companion: DANIEL,
        reason: "Daniel has wonderful stories from his years in the lab and as a father.",
      };

    case "advice":
      return {
        companion: MATEO,
        reason: "Mateo gives practical, grounded perspective from real experience.",
      };

    case "just_chat":
    default: {
      const index = new Date().getHours() % 4;
      return {
        companion: ALL_COMPANIONS[index],
        reason: "Any companion would love to chat with you.",
      };
    }
  }
}

export function getCompanionForMood(mood: UserMood): MatchResult[] {
  switch (mood) {
    case "low":
      return [
        { companion: CLAIRE, reason: "Claire's warmth can help when you're feeling down." },
        { companion: DANIEL, reason: "Daniel's calm presence can be grounding." },
      ];

    case "okay":
      return [
        { companion: MATEO, reason: "Mateo's steady energy matches your mood." },
        { companion: CLAIRE, reason: "Claire can help you explore what's on your mind." },
      ];

    case "good":
      return [
        { companion: MAYA, reason: "Maya's energy matches when you're feeling good!" },
        { companion: MATEO, reason: "Mateo would love to hear what's going well." },
      ];
  }
}
