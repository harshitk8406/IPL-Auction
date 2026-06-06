/**
 * Gemini AI Service
 * Uses Google Gemini 2.0 Flash (free tier) for three features:
 *   1. Live auction commentary after each sold/unsold event
 *   2. Player scouting report when a player is nominated
 *   3. Squad analysis at auction completion
 *
 * All functions are non-blocking — they return a promise but the caller
 * never awaits them, so the auction flow is never delayed.
 *
 * Free tier: 15 RPM, 1M tokens/day — no billing required.
 * Get your key at: https://aistudio.google.com/app/apikey
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;

let genAI = null;
let model = null;

function getModel() {
  if (!API_KEY) return null;
  if (!model) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.9,
      },
    });
  }
  return model;
}

/**
 * Safely call Gemini — returns null if key is missing or call fails.
 */
async function callGemini(prompt) {
  const m = getModel();
  if (!m) return null;
  try {
    const result = await m.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.warn('[Gemini] API error:', err.message);
    return null;
  }
}

/**
 * 1. Generate a one-liner cricket commentary after a player is sold or unsold.
 *    Returns a string like:
 *    "What a steal! CSK pick up Virat Kohli for a whopping ₹15 Crore!"
 */
async function getAuctionCommentary(player, outcome) {
  const { name, role, nationality, basePrice } = player;

  let prompt;
  if (outcome.type === 'sold') {
    const { soldTo, soldPrice } = outcome;
    const crore = (soldPrice / 100).toFixed(2);
    prompt = `You are a witty, enthusiastic IPL auction commentator. Write ONE punchy sentence (max 20 words) reacting to this sale:
Player: ${name} (${role}, ${nationality})
Sold to: ${soldTo}
Price: ₹${crore} Crore (base price was ₹${(basePrice / 100).toFixed(2)} Crore)
Tone: Excited, cricket-commentator style. Use cricket lingo. No hashtags.`;
  } else {
    prompt = `You are a witty IPL auction commentator. Write ONE punchy sentence (max 18 words) reacting to this player going unsold:
Player: ${name} (${role}, ${nationality})
Base price: ₹${(basePrice / 100).toFixed(2)} Crore
Tone: Surprised or sympathetic. Cricket-commentator style. No hashtags.`;
  }

  return callGemini(prompt);
}

/**
 * 2. Generate a quick scouting report when a player is nominated.
 *    Returns 2 sentences like:
 *    "A destructive middle-order batsman with a T20 strike rate of 160+. Could be the X-factor for any team chasing totals."
 */
async function getPlayerScoutingReport(player) {
  const { name, role, nationality, basePrice } = player;
  const crore = (basePrice / 100).toFixed(2);

  const prompt = `You are an IPL talent scout. Write a 2-sentence scouting report (max 40 words total) for this player entering the auction:
Name: ${name}
Role: ${role}
Nationality: ${nationality}
Base Price: ₹${crore} Crore
Be specific to cricket. Highlight their likely value and what kind of team would want them. No hashtags or emojis.`;

  return callGemini(prompt);
}

/**
 * 3. Generate squad analysis for all teams at the end of the auction.
 *    teamSummaries is an array of { teamName, squadSize, purseRemaining, overseasCount, players[] }
 *    Returns a JSON string: [{ teamName, grade, verdict }]
 */
async function getSquadAnalysis(teamSummaries) {
  if (!teamSummaries || teamSummaries.length === 0) return null;

  const teamsText = teamSummaries
    .map(
      (t) =>
        `${t.teamName}: ${t.squadSize} players, ₹${(t.purseRemaining / 100).toFixed(1)}Cr left, ${t.overseasCount} overseas. Key buys: ${(t.keyBuys || []).slice(0, 3).join(', ') || 'none listed'}`
    )
    .join('\n');

  const prompt = `You are an expert IPL analyst. Based on these IPL auction results, give each team a draft grade (A, B, C, or D) and a ONE-sentence verdict (max 15 words).

Teams:
${teamsText}

Respond ONLY with valid JSON array, no markdown, no explanation:
[{"teamName":"...","grade":"A","verdict":"..."},...]`;

  const raw = await callGemini(prompt);
  if (!raw) return null;

  try {
    // Strip any markdown code fences if present
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    console.warn('[Gemini] Squad analysis parse error:', raw);
    return null;
  }
}

module.exports = { getAuctionCommentary, getPlayerScoutingReport, getSquadAnalysis };
