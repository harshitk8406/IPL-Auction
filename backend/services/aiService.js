/**
 * AI Bidding Service
 * Determines whether an AI-controlled team should bid and how much.
 */

const ROLE_WEIGHTS = {
  Batsman: 1.2,
  Bowler: 1.1,
  'All-Rounder': 1.35,
  Wicketkeeper: 1.3,
};

const MAX_SQUAD = 25;
const MAX_OVERSEAS = 8;
const MIN_SQUAD = 18;

/**
 * Calculates whether an AI team should bid and at what amount.
 * Returns { shouldBid: boolean, bidAmount: number }
 */
function getAIDecision(team, player, currentBid, teamStates) {
  const state = teamStates.get(team.id);
  if (!state) return { shouldBid: false };

  const { purseRemaining, squadSize, overseasCount } = state;

  // Hard constraints
  if (squadSize >= MAX_SQUAD) return { shouldBid: false };
  if (player.nationality === 'Overseas' && overseasCount >= MAX_OVERSEAS) return { shouldBid: false };

  // Need to keep at least some purse for future players
  // Estimate minimum needed: (MIN_SQUAD - squadSize) * minBasePrice * 0.8
  const slotsNeeded = Math.max(0, MIN_SQUAD - squadSize);
  const reservePurse = slotsNeeded > 1 ? (slotsNeeded - 1) * 20 * 0.8 : 0;
  const spendablePurse = purseRemaining - reservePurse;

  if (spendablePurse <= 0) return { shouldBid: false };

  // Role weight — AI values certain roles more
  const roleWeight = ROLE_WEIGHTS[player.role] || 1.0;

  // Need-based multiplier: if squad is short on a role, bid higher
  const roleNeedMultiplier = getRoleNeedMultiplier(state, player.role);

  // AI's maximum willing bid
  const baseMultiplier = 2.5 + Math.random() * 1.5; // 2.5x to 4x base price
  let maxWillingBid = Math.floor(
    player.basePrice * baseMultiplier * roleWeight * roleNeedMultiplier
  );

  // Cap at 20% of remaining spendable purse for any one player (unless desperate)
  const purseCapPct = slotsNeeded <= 2 ? 0.5 : 0.22;
  maxWillingBid = Math.min(maxWillingBid, Math.floor(spendablePurse * purseCapPct));

  // Round to nearest 5
  maxWillingBid = Math.ceil(maxWillingBid / 5) * 5;

  const nextBid = currentBid + getBidIncrement(currentBid);

  if (nextBid > maxWillingBid || nextBid > spendablePurse) {
    return { shouldBid: false };
  }

  // Add randomness: sometimes AI passes even if it could bid (30% chance for non-star players)
  const aggressionFactor = player.basePrice >= 150 ? 0.85 : 0.65;
  if (Math.random() > aggressionFactor) return { shouldBid: false };

  return { shouldBid: true, bidAmount: nextBid };
}

function getRoleNeedMultiplier(state, role) {
  const { squadSize, roleBreakdown } = state;
  if (!roleBreakdown) return 1.0;

  const targetBreakdown = {
    Batsman: 6,
    Bowler: 6,
    'All-Rounder': 4,
    Wicketkeeper: 2,
  };

  const current = roleBreakdown[role] || 0;
  const target = targetBreakdown[role] || 4;
  const deficit = target - current;

  if (deficit >= 3) return 1.4;
  if (deficit >= 2) return 1.2;
  if (deficit >= 1) return 1.1;
  if (deficit <= -2) return 0.7; // already has plenty
  return 1.0;
}

function getBidIncrement(currentBid) {
  if (currentBid < 50) return 5;
  if (currentBid < 200) return 10;
  if (currentBid < 500) return 25;
  if (currentBid < 1000) return 50;
  return 100;
}

module.exports = { getAIDecision, getBidIncrement };
