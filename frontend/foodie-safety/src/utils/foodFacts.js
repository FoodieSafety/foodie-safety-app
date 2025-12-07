// foodFact.js

export const SAFETY_TIPS = [
  "Always check your fridge and pantry for recalled items and discard them immediately.",
  "Never taste food to determine if it's safe — when in doubt, throw it out.",
  "Store raw meat separately from ready-to-eat foods to prevent cross-contamination.",
  "Wash your hands with soap and warm water for 20 seconds before handling food.",
  "Keep your refrigerator at or below 40°F (4°C) to slow bacterial growth.",
  "Regularly sanitize cutting boards, utensils, and countertops after preparing raw foods.",
  "Check expiration dates often and rotate older items to the front of your pantry.",
  "Follow recall instructions exactly — some items must be returned, others discarded.",
  "Cook foods to the recommended safe internal temperatures to kill harmful bacteria.",
  "Freeze perishable items promptly if you don't plan to use them within a few days."
];

// Helper: get a random safety tip
export function getRandomTip() {
  const randomIndex = Math.floor(Math.random() * SAFETY_TIPS.length);
  return SAFETY_TIPS[randomIndex];
}