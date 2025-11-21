import { units, LOCKED_UNITS } from '../data/units';
import { regionalTraits } from '../data/traits';

const regionalTraitNames = regionalTraits.map(t => t[0]);
const regionalBreakpoints = Object.fromEntries(regionalTraits);
const regionalSet = new Set(regionalTraitNames);

// Filter out 5-cost and 7-cost units from the optimizer pool
const availableUnits = units.filter(u => u.cost !== 5 && u.cost !== 7);

// Classify units as wildcards (single regional) or specific (multi-regional)
const wildcardUnits = availableUnits.filter(u => {
    const reg = u.traits.filter(t => regionalSet.has(t));
    return reg.length === 1;
});

const multiRegionalUnits = availableUnits.filter(u => {
    const reg = u.traits.filter(t => regionalSet.has(t));
    return reg.length > 1;
});

// Map of Trait -> Wildcard count available
const wildcardCountMap = {};
regionalTraitNames.forEach(trait => {
    wildcardCountMap[trait] = wildcardUnits.filter(u => u.traits.includes(trait)).length;
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

        // 3. Solve for this combo using wildcards
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
            const currentSolution = [];
            const currentNeeds = { ...needs };

            // Apply bridges (multi-regional units)
            for (const unit of bridges) {
                currentSolution.push({ type: 'unit', unit });
                unit.traits.forEach(t => {
                    if (currentNeeds[t]) {
                        currentNeeds[t] = Math.max(0, currentNeeds[t] - 1);
                    }
                });
            }

            // Fill remaining needs with wildcards
            let valid = true;
            for (const trait of combo) {
                let count = currentNeeds[trait];
                if (!count || count <= 0) continue;

                // Check if we have enough wildcards available
                const availableWildcards = wildcardCountMap[trait];
                // Count how many wildcards from this trait are already in currentUnits
                const usedWildcards = currentUnits.filter(u =>
                    u.traits.includes(trait) &&
                    u.traits.filter(t => regionalSet.has(t)).length === 1
                ).length;

                const remainingWildcards = availableWildcards - usedWildcards;

                if (remainingWildcards < count) {
                    valid = false;
                    break;
                }

                // Add wildcard slots
                for (let i = 0; i < count; i++) {
                    currentSolution.push({ type: 'wildcard', trait });
                }
            }

            if (valid) {
                // Create a signature for deduplication
                const bridgeNames = bridges.map(u => u.name).sort().join(',');
                const wildcardCounts = {};
                currentSolution.forEach(item => {
                    if (item.type === 'wildcard') {
                        wildcardCounts[item.trait] = (wildcardCounts[item.trait] || 0) + 1;
                    }
                });
                const wildcardSig = Object.entries(wildcardCounts)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([t, c]) => `${t}:${c}`)
                    .join('|');
                const signature = `${bridgeNames}__${wildcardSig}`;

                allSolutions.push({
                    units: currentSolution,
                    activeTraits: combo,
                    signature: signature
                });
            }
        }
    }

    // Deduplicate by signature
    const uniqueSolutions = [];
    const seenSignatures = new Set();

    // Sort by team size (prefer smaller teams)
    allSolutions.sort((a, b) => {
        const sizeA = currentUnits.length + a.units.length;
        const sizeB = currentUnits.length + b.units.length;

        // Prefer size <= 8
        const tierA = sizeA <= 8 ? 0 : 1;
        const tierB = sizeB <= 8 ? 0 : 1;

        if (tierA !== tierB) {
            return tierA - tierB;
        }

        // Within same tier, prefer smaller size
        return sizeA - sizeB;
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
