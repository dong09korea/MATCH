/**
 * Tennis Match Scheduler Algorithm
 */

// Helper: Calculate time slots
const generateTimeSlots = (start, end, duration) => {
    const slots = [];
    let current = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);

    while (current < endTime) {
        const next = new Date(current.getTime() + duration * 60000);
        if (next > endTime) break;

        slots.push(current.toTimeString().slice(0, 5));
        current = next;
    }
    return slots;
};

// Helper: Calculate player score
const getPlayerScore = (stats) => {
    const speed = stats.speed || 3;
    return stats.forehand + stats.backhand + stats.volley + stats.serve + speed;
};

// Core Generation Function
export const generateSchedule = (players, config, constraints = []) => {
    const rounds = generateTimeSlots(config.startTime, config.endTime, config.matchDuration);

    // Tracking State
    const playerState = players.reduce((acc, p, index) => {
        acc[p.id] = {
            ...p,
            originalIndex: index, // Track registration order vs index
            gamesPlayed: 0, // Reset to 0
            roundsRested: 0, // Consecutive rounds rested
            playedWith: {}, // partnerId -> count
            playedAgainst: {}, // opponentId -> count
            totalScore: getPlayerScore(p.stats)
        };
        return acc;
    }, {});

    const schedule = [];

    for (let roundIdx = 0; roundIdx < rounds.length; roundIdx++) {
        const time = rounds[roundIdx];

        // Get all constraints for this round
        const roundConstraints = constraints.filter(c => c.roundIndex === roundIdx);
        // If no constraints found (fallback), generate default for court count
        // But SettingsForm should have handled this. 
        // Ensure we process 'config.courtCount' number of matches.

        const slotsToFill = [];
        for (let c = 0; c < config.courtCount; c++) {
            const constraint = roundConstraints.find(rc => rc.courtIndex === c) || { type: 'ANY' };
            slotsToFill.push({ courtId: c + 1, type: constraint.type });
        }

        // Sort slots: Specific requirements first
        slotsToFill.sort((a, b) => {
            const scoreA = a.type === 'ANY' ? 0 : 1;
            const scoreB = b.type === 'ANY' ? 0 : 1;
            return scoreB - scoreA; // Specific first
        });

        const roundMatches = [];
        const playersInRound = []; // Ids of players selected this round

        // Process each slot
        for (const slot of slotsToFill) {
            // 1. Filter Available Players
            // Criteria: 
            // - Not already playing this round
            // - Available via 'Arrival Time'
            // - Matches Gender Constraint
            // - Has not exceeded MAX GAMES quota
            let candidates = Object.values(playerState).filter(p => {
                if (playersInRound.includes(p.id)) return false;

                // CHECK ARRIVAL TIME
                // If player has arrivalTime and it is AFTER the current round time, they are not available
                // e.g. Arrival "20:30", Round "20:00" -> "20:30" > "20:00" -> TRUE (Unavailable)
                if (p.arrivalTime && p.arrivalTime > time) return false;

                // Max Games Check
                const limit = p.maxGames !== undefined ? p.maxGames : 4; // Default to 4 if undefined, allow 0
                if (limit === 0) return false; // Explicitly exclude maxGames=0 from playing
                if (p.gamesPlayed >= limit) return false;

                if (slot.type === 'MALE_ONLY') return p.gender === 'M';
                if (slot.type === 'FEMALE_ONLY') return p.gender === 'F';
                return true;
            });

            // 2. Sort Candidates (Games Played -> Rested -> Registration Order)
            candidates.sort((a, b) => {
                // Priority 1: Least games played (Fairness)
                if (a.gamesPlayed !== b.gamesPlayed) return a.gamesPlayed - b.gamesPlayed;

                // Priority 2: Not playing consecutive games (Rest)
                // If one has rested more, they should play.
                if (a.roundsRested !== b.roundsRested) return b.roundsRested - a.roundsRested;

                // Priority 3: Registration Order (Original Index)
                // Earlier registrants get priority for "extra" games
                return a.originalIndex - b.originalIndex;
            });

            // 3. Pick 4
            if (candidates.length >= 4) {
                const selected = candidates.slice(0, 4);
                selected.forEach(p => playersInRound.push(p.id));

                // Form match
                const match = formMatchesInternal(selected, playerState); // Returns array of 1 match
                if (match.length > 0) {
                    roundMatches.push({
                        ...match[0],
                        courtId: slot.courtId, // Override court ID from internal logic
                        type: slot.type
                    });
                }
            }
        }

        // Update State
        // Selected
        playersInRound.forEach(pid => {
            playerState[pid].roundsRested = 0;
            playerState[pid].gamesPlayed++;
        });
        // Resting (Available but not picked)
        // Note: Only count as "resting" if they were AVAILABLE this round
        const allAvailableInTime = Object.values(playerState).filter(p => {
            if (p.arrivalTime && p.arrivalTime > time) return false;
            if ((p.maxGames !== undefined ? p.maxGames : 4) === 0) return false; // Exclude explicit non-participants
            return true;
        });
        const restingPlayers = allAvailableInTime.filter(p => !playersInRound.includes(p.id));
        restingPlayers.forEach(p => {
            playerState[p.id].roundsRested++;
        });

        // Update History
        roundMatches.forEach(match => {
            const { team1, team2 } = match;
            updatePartnerHistory(playerState, team1[0], team1[1]);
            updatePartnerHistory(playerState, team2[0], team2[1]);

            team1.forEach(p1 => {
                team2.forEach(p2 => {
                    updateOpponentHistory(playerState, p1, p2);
                });
            });
        });

        // Sort matches by Court ID for display
        roundMatches.sort((a, b) => a.courtId - b.courtId);

        schedule.push({
            round: roundIdx + 1,
            time,
            matches: roundMatches,
            resting: restingPlayers.map(p => ({ id: p.id, name: p.name }))
        });
    }

    return schedule;
};

const updatePartnerHistory = (state, p1, p2) => {
    state[p1.id].playedWith[p2.id] = (state[p1.id].playedWith[p2.id] || 0) + 1;
    state[p2.id].playedWith[p1.id] = (state[p2.id].playedWith[p1.id] || 0) + 1;
};

const updateOpponentHistory = (state, p1, p2) => {
    state[p1.id].playedAgainst[p2.id] = (state[p1.id].playedAgainst[p2.id] || 0) + 1;
    state[p2.id].playedAgainst[p1.id] = (state[p2.id].playedAgainst[p1.id] || 0) + 1;
};

const formMatchesInternal = (pool, playerState) => {
    // Generate best pairing for these 4
    // Since pool is exactly 4, we just find best 2v2 combo

    const pairings = [
        { t1: [pool[0], pool[1]], t2: [pool[2], pool[3]] },
        { t1: [pool[0], pool[2]], t2: [pool[1], pool[3]] },
        { t1: [pool[0], pool[3]], t2: [pool[1], pool[2]] }
    ];

    let bestPairing = pairings[0];
    let bestPairScore = -Infinity;

    pairings.forEach(p => {
        const score = calculateMatchQuality(p.t1, p.t2, playerState);
        if (score > bestPairScore) {
            bestPairScore = score;
            bestPairing = p;
        }
    });

    return [{
        team1: bestPairing.t1,
        team2: bestPairing.t2
    }];
};

const calculateMatchQuality = (team1, team2, state) => {
    let score = 0;

    // 1. Skill Balance
    const score1 = team1.reduce((sum, p) => sum + state[p.id].totalScore, 0);
    const score2 = team2.reduce((sum, p) => sum + state[p.id].totalScore, 0);
    const diff = Math.abs(score1 - score2);
    score -= (diff * diff) * 2;

    // 2. Gender Balance
    const getGenderStr = (team) => team.map(p => p.gender).sort().join('');
    const g1 = getGenderStr(team1);
    const g2 = getGenderStr(team2);

    if (g1 === 'FM' && g2 === 'FM') score += 50;
    else if (g1 === g2) score += 30;
    else score -= 20;

    // 3. Partner Variety
    const partnerRepeatCost = 100;
    const p1History = state[team1[0].id].playedWith[team1[1].id] || 0;
    const p2History = state[team2[0].id].playedWith[team2[1].id] || 0;
    score -= (p1History + p2History) * partnerRepeatCost;

    // 4. Opponent Variety
    const opponentRepeatCost = 20;
    let opponentRepeats = 0;
    team1.forEach(p1 => {
        team2.forEach(p2 => {
            opponentRepeats += state[p1.id].playedAgainst[p2.id] || 0;
        });
    });
    score -= opponentRepeats * opponentRepeatCost;

    return score;
};
