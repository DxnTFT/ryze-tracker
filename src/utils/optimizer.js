import { units } from '../data/units';
import { regionalTraits } from '../data/traits';

// --- Pre-computation & Bitmask Setup ---

const REGIONAL_NAMES = regionalTraits.map(t => t[0]);
const REGIONAL_BREAKPOINTS = Object.fromEntries(regionalTraits);
const REGIONAL_SET = new Set(REGIONAL_NAMES);

// Assign a bit index to each regional trait (0 to 12)
const TRAIT_TO_BIT = {};
REGIONAL_NAMES.forEach((name, index) => {
    TRAIT_TO_BIT[name] = 1 << index;
});

// Helper to get bitmask for a list of traits
const getTraitMask = (traits) => {
    let mask = 0;
    for (const t of traits) {
        if (TRAIT_TO_BIT[t] !== undefined) {
            mask |= TRAIT_TO_BIT[t];
        }
    }
    return mask;
};

// Filter units
const AVAILABLE_UNITS = units.filter(u => u.cost !== 5 && u.cost !== 7);

// Classify units
const WILDCARD_UNITS = [];
const MULTI_REGIONAL_UNITS = [];

AVAILABLE_UNITS.forEach(u => {
    const regionalCount = u.traits.reduce((acc, t) => acc + (REGIONAL_SET.has(t) ? 1 : 0), 0);
    if (regionalCount === 1) {
        WILDCARD_UNITS.push(u);
    } else if (regionalCount > 1) {
        // Pre-compute mask for multi-regional units
        MULTI_REGIONAL_UNITS.push({
            ...u,
            mask: getTraitMask(u.traits)
        });
    }
});

// Map of Trait -> Count of available wildcards
const WILDCARD_COUNTS = {};
REGIONAL_NAMES.forEach(trait => {
    WILDCARD_COUNTS[trait] = WILDCARD_UNITS.filter(u => u.traits.includes(trait)).length;
});

// Generate Combinations
function getCombinations(arr, k) {
    if (k === 0) return [[]];
    if (arr.length === 0) return [];
    const first = arr[0];
    const rest = arr.slice(1);
    return [
        ...getCombinations(rest, k - 1).map(c => [first, ...c]),
        ...getCombinations(rest, k)
    ];
}

// Pre-compute all 4-trait combinations with their masks
const ALL_COMBOS = getCombinations(REGIONAL_NAMES, 4).map(combo => ({
    traits: combo,
    mask: getTraitMask(combo)
}));

// --- Core Logic ---

export function calculateActiveTraits(currentUnits, currentEmblems) {
    const traitCounts = {};
    // Count unit traits
    for (const unit of currentUnits) {
        for (const trait of unit.traits) {
            traitCounts[trait] = (traitCounts[trait] || 0) + 1;
        }
    }
    // Count emblems
    for (const trait of currentEmblems) {
        traitCounts[trait] = (traitCounts[trait] || 0) + 1;
    }

    const activeRegional = [];
    for (const trait of REGIONAL_NAMES) {
        if ((traitCounts[trait] || 0) >= REGIONAL_BREAKPOINTS[trait]) {
            activeRegional.push(trait);
        }
    }
    return { traitCounts, activeRegional };
}

// Helper to count set bits
function countSetBits(n) {
    let count = 0;
    while (n > 0) {
        n &= (n - 1);
        count++;
    }
    return count;
}

export function findAllSolutions(currentUnits, currentEmblems, excludedUnits = []) {
    const { activeRegional, traitCounts: initialCounts } = calculateActiveTraits(currentUnits, currentEmblems);

    // Early exit if already satisfied
    if (activeRegional.length >= 4) {
        return { isUnlocked: true, solutions: [], activeTraits: activeRegional };
    }

    const excludedSet = new Set(excludedUnits);
    const currentUnitNames = new Set(currentUnits.map(u => u.name));

    // Filter pools based on exclusions
    // We only filter Multi-Regional here because Wildcards are checked by count later
    const activeMultiRegional = MULTI_REGIONAL_UNITS.filter(u => !excludedSet.has(u.name));

    // Recalculate available wildcard counts if there are exclusions
    let activeWildcardCounts = WILDCARD_COUNTS;
    if (excludedUnits.length > 0) {
        activeWildcardCounts = {};
        REGIONAL_NAMES.forEach(trait => {
            activeWildcardCounts[trait] = WILDCARD_UNITS.filter(u =>
                u.traits.includes(trait) && !excludedSet.has(u.name)
            ).length;
        });
    }

    const allSolutions = [];
    const seenSignatures = new Set();

    // Iterate all pre-computed combinations
    for (const { traits: combo, mask: comboMask } of ALL_COMBOS) {
        // 1. Calculate Needs
        const needs = {};
        let needsMask = 0;
        let hasNeeds = false;

        for (const trait of combo) {
            const needed = Math.max(0, REGIONAL_BREAKPOINTS[trait] - (initialCounts[trait] || 0));
            if (needed > 0) {
                needs[trait] = needed;
                needsMask |= TRAIT_TO_BIT[trait];
                hasNeeds = true;
            }
        }

        if (!hasNeeds) {
            return { isUnlocked: true, solutions: [], activeTraits: combo };
        }

        // 2. Find Relevant Bridges (Bitwise optimization)
        // A unit is a bridge if it shares >= 2 traits with the TARGET COMBO
        // AND it helps with at least one NEED (optimization)
        const relevantBridges = activeMultiRegional.filter(u =>
            !currentUnitNames.has(u.name) &&
            countSetBits(u.mask & comboMask) >= 2 &&
            (u.mask & needsMask) !== 0
        );

        // 3. Iterate Bridge Subsets (Power Set)
        const n = relevantBridges.length;
        // Limit recursion depth/complexity if too many bridges (rare)
        if (n > 10) continue;

        const totalSubsets = 1 << n;
        for (let i = 0; i < totalSubsets; i++) {
            const currentSolution = [];
            // We can clone needs, or just track decrements. Cloning is safer/easier.
            const currentNeeds = { ...needs };
            const bridges = [];

            // Apply Bridges
            for (let j = 0; j < n; j++) {
                if ((i >> j) & 1) {
                    const unit = relevantBridges[j];
                    bridges.push(unit);
                    currentSolution.push({ type: 'unit', unit });

                    // Decrement needs
                    // We iterate the unit's traits. Since unit.traits is small, this is fast.
                    for (const t of unit.traits) {
                        if (currentNeeds[t]) {
                            currentNeeds[t]--;
                        }
                    }
                }
            }

            // 4. Fill with Wildcards
            let valid = true;
            for (const trait of combo) {
                const needed = currentNeeds[trait];
                if (!needed || needed <= 0) continue;

                const available = activeWildcardCounts[trait];
                // Count wildcards already in currentUnits (user selected)
                // Optimization: This filter could be slow inside the loop. 
                // But currentUnits is usually small (0-10).
                const used = currentUnits.reduce((acc, u) => {
                    // Check if u is a wildcard for this trait
                    // A unit is a wildcard for T if it has T and T is its ONLY regional trait
                    if (u.traits.includes(trait)) {
                        // We can check if it's in WILDCARD_UNITS list, or check trait count
                        // Checking regional count is safer
                        let regCount = 0;
                        for (const t of u.traits) if (REGIONAL_SET.has(t)) regCount++;
                        if (regCount === 1) return acc + 1;
                    }
                    return acc;
                }, 0);

                if ((available - used) < needed) {
                    valid = false;
                    break;
                }

                for (let k = 0; k < needed; k++) {
                    currentSolution.push({ type: 'wildcard', trait });
                }
            }

            if (valid) {
                // Deduplicate
                // Signature: Sorted Bridge Names + Sorted Wildcard Counts
                const bridgeSig = bridges.map(u => u.name).sort().join(',');

                // Count wildcards in solution
                const wcCounts = {};
                for (const item of currentSolution) {
                    if (item.type === 'wildcard') wcCounts[item.trait] = (wcCounts[item.trait] || 0) + 1;
                }
                const wcSig = Object.entries(wcCounts)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([t, c]) => `${t}:${c}`)
                    .join('|');

                const signature = bridgeSig + '__' + wcSig;

                if (!seenSignatures.has(signature)) {
                    seenSignatures.add(signature);
                    allSolutions.push({
                        units: currentSolution,
                        activeTraits: combo,
                        signature
                    });
                }
            }
        }
    }

    // Sort Solutions
    allSolutions.sort((a, b) => {
        const sizeA = currentUnits.length + a.units.length;
        const sizeB = currentUnits.length + b.units.length;

        // Tier 1: Size <= 9
        const tierA = sizeA <= 9 ? 0 : 1;
        const tierB = sizeB <= 9 ? 0 : 1;

        if (tierA !== tierB) return tierA - tierB;
        return sizeA - sizeB;
    });

    return {
        isUnlocked: false,
        solutions: allSolutions,
        activeTraits: activeRegional
    };
}
