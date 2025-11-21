import { units, LOCKED_UNITS } from '../data/units';
import { regionalTraits } from '../data/traits';

const regionalTraitNames = regionalTraits.map(t => t[0]);
const regionalBreakpoints = Object.fromEntries(regionalTraits);
const regionalSet = new Set(regionalTraitNames);

// Filter out 5-cost and 7-cost units from the optimizer pool
const availableUnits = units.filter(u => u.cost !== 5 && u.cost !== 7);

// Pre-process units
const multiRegionalUnits = availableUnits.filter(u => {
    const reg = u.traits.filter(t => regionalSet.has(t));
    return reg.length > 1;
});

// Map of Trait -> Single-Regional Units (sorted by cost)
const traitUnitsMap = {};
regionalTraitNames.forEach(trait => {
    traitUnitsMap[trait] = availableUnits
        .filter(u => u.traits.includes(trait))
        .sort((a, b) => a.cost - b.cost);
});

function getCombinations(arr, k) {
    if (k === 0) return [[]];
    if (arr.length === 0) return [];
    const first = arr[0];
    const rest = arr.slice(1);
    const combsWithFirst = getCombinations(rest, k - 1).map(c => [first, ...c]);
    const combsWithoutFirst = getCombinations(rest, k);
    return [...combsWithFirst, ...combsWithoutFirst];
}

const allTraitCombinations = getCombinations(regionalTraitNames, 5);

export function calculateActiveTraits(currentUnits, currentEmblems) {
    const traitCounts = {};
    currentUnits.forEach(unit => {
        unit.traits.forEach(trait => {
            traitCounts[trait] = (traitCounts[trait] || 0) + 1;
        });
    });
    currentEmblems.forEach(trait => {
        traitCounts[trait] = (traitCounts[trait] || 0) + 1;
    });

    const activeRegional = [];
    for (const [trait, count] of Object.entries(traitCounts)) {
        if (regionalSet.has(trait)) {
            if (count >= regionalBreakpoints[trait]) {
                activeRegional.push(trait);
            }
        }
    }
    return { traitCounts, activeRegional };
}

export function findAllSolutions(currentUnits, currentEmblems) {
    // 1. Check if already satisfied
    const { activeRegional, traitCounts: initialCounts } = calculateActiveTraits(currentUnits, currentEmblems);
    if (activeRegional.length >= 5) {
        return {
            isUnlocked: true,
            solutions: [],
            activeTraits: activeRegional
        };
    }

    const currentUnitNames = new Set(currentUnits.map(u => u.name));
    let allSolutions = [];

    // 2. Iterate all combinations of 5 traits
    for (const combo of allTraitCombinations) {
        // Calculate needs for this combo
        const needs = {};
        combo.forEach(trait => {
            const current = initialCounts[trait] || 0;
            const needed = Math.max(0, regionalBreakpoints[trait] - current);
            if (needed > 0) {
                needs[trait] = needed;
            }
        });

        if (Object.keys(needs).length === 0) {
            return { isUnlocked: true, solutions: [], activeTraits: combo };
        }

        // 3. Solve for this combo
        const comboSet = new Set(combo);

        // Filter multi-regional units that are relevant and not already owned
        const relevantBridges = multiRegionalUnits.filter(u =>
            !currentUnitNames.has(u.name) &&
            u.traits.filter(t => comboSet.has(t) && needs[t] > 0).length >= 2
        );

        // Iterate subsets of relevant bridges
        const bridgeSubsets = (function* () {
            const n = relevantBridges.length;
            for (let i = 0; i < (1 << n); i++) {
                const subset = [];
                for (let j = 0; j < n; j++) {
                    if ((i >> j) & 1) subset.push(relevantBridges[j]);
                }
                yield subset;
            }
        })();

        for (const bridges of bridgeSubsets) {
            let currentCost = 0;
            const currentSolution = [];
            const currentNeeds = { ...needs };

            // Apply bridges
            for (const unit of bridges) {
                currentCost += unit.cost;
                currentSolution.push(unit);
                unit.traits.forEach(t => {
                    if (currentNeeds[t]) {
                        currentNeeds[t] = Math.max(0, currentNeeds[t] - 1);
                    }
                });
            }

            // Fill remaining needs with cheapest units
            let valid = true;
            for (const trait of combo) {
                let count = currentNeeds[trait];
                if (!count || count <= 0) continue;

                // Get candidates for this trait
                // Must not be in currentUnits or currentSolution
                // EXCLUDE relevantBridges to avoid double counting or suboptimal paths
                const candidates = traitUnitsMap[trait].filter(u =>
                    !currentUnitNames.has(u.name) &&
                    !currentSolution.includes(u) &&
                    !relevantBridges.includes(u)
                );

                if (candidates.length < count) {
                    valid = false;
                    break;
                }

                for (let i = 0; i < count; i++) {
                    const u = candidates[i];
                    currentCost += u.cost;
                    currentSolution.push(u);
                }
            }

            if (valid) {
                const signature = currentSolution.map(u => u.name).sort().join(',');

                allSolutions.push({
                    units: currentSolution,
                    cost: currentCost,
                    activeTraits: combo,
                    signature: signature
                });
            }
        }
    }

    // Deduplicate by signature, keeping lowest cost
    const uniqueSolutions = [];
    const seenSignatures = new Set();

    // Sort by Team Size Tier (<=8 vs >8), then by Cost
    allSolutions.sort((a, b) => {
        const sizeA = currentUnits.length + a.units.length;
        const sizeB = currentUnits.length + b.units.length;

        // Tier 0: Size <= 8
        // Tier 1: Size > 8
        const tierA = sizeA <= 8 ? 0 : 1;
        const tierB = sizeB <= 8 ? 0 : 1;

        if (tierA !== tierB) {
            return tierA - tierB; // Lower tier first
        }

        // If both in Tier 1 (Size > 8), prefer smaller size (Level 9 > Level 10)
        if (tierA === 1) {
            if (sizeA !== sizeB) return sizeA - sizeB;
        }

        // Finally sort by cost
        return a.cost - b.cost;
    });

    for (const sol of allSolutions) {
        if (!seenSignatures.has(sol.signature)) {
            seenSignatures.add(sol.signature);
            uniqueSolutions.push(sol);
        }
    }

    // Return top 20 solutions
    return {
        isUnlocked: false,
        solutions: uniqueSolutions.slice(0, 20),
        activeTraits: activeRegional
    };
}
