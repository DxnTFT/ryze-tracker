import React, { useState } from 'react';
import UnitIcon from './UnitIcon';
import WildcardIcon from './WildcardIcon';
// 1. Import unit data from the units file
import { LOCKED_UNITS, units } from '../data/units';
// 2. Import regionalTraits from the correct traits file
import { regionalTraits } from '../data/traits';

// --- Helper Functions (Defined here or imported from a utility file) ---

// Gets all units that have this trait and NO OTHER regional trait
function getAllSingleRegionalUnits(trait) {
    const regionalTraitNames = regionalTraits.map(rt => rt[0]);
    return units.filter(u => {
        // Ensure u.traits exists before calling filter
        const unitTraits = u.traits || [];
        const regional = unitTraits.filter(t => regionalTraitNames.includes(t));
        return regional.includes(trait) && regional.length === 1;
    });
}

// --- Placeholder/Fix Definitions (Adjust these for your actual Set/Data) ---
const SHURIMA_UNITS = [
    "Azir", "Nasus", "Renekton", "Xerath", "K'Sante", "Taliyah", "Akshan", "Cassiopeia", "Kha'Zix"
];
const AZIR_NAME = "Azir";
// -------------------------------------------------------------------------------

export default function CompositionResults({ results, currentActive, selectedUnits = [], level = 8 }) {
    const { isUnlocked, solutions: allSolutions, activeTraits } = results;
    const [hideUnselectedLocked, setHideUnselectedLocked] = useState(false);
    const selectedUnitNames = new Set(selectedUnits.map(u => u.name));

    // Total units already selected by the user
    const selectedUnitCount = selectedUnits.length;

    // Check for Azir's presence
    const isAzirSelected = selectedUnitNames.has(AZIR_NAME);

    // Filter solutions based on hideUnselectedLocked flag, Shurima rule, AND LEVEL
    const solutions = allSolutions.filter(sol => {

        // Calculate the total number of units this composition requires:
        // User's selected units + units in the solution
        const solUnitCount = sol.units.length;
        const totalUnitRequirement = selectedUnitCount + solUnitCount;

        // 1. **NEW LEVEL CHECK**
        // If the required unit count exceeds the current player level, filter it out.
        if (totalUnitRequirement > level) {
            return false;
        }

        // 2. Check for locked units (Existing Logic)
        if (hideUnselectedLocked) {
            const hasLocked = sol.units.some(item => {
                if (item.type !== 'unit') return false;
                const unitName = item.unit.name;
                return LOCKED_UNITS.includes(unitName) && !selectedUnitNames.has(unitName);
            });
            if (hasLocked) return false;
        }

        // 3. REVISED Shurima Rule Check
        if (!isAzirSelected) {
            const hasShurima = sol.units.some(item => {
                const isShurimaUnit = item.type === 'unit' && SHURIMA_UNITS.includes(item.unit.name);
                const isShurimaWildcard = item.type === 'wildcard' && item.trait === 'Shurima';

                return isShurimaUnit || isShurimaWildcard;
            });
            if (hasShurima) return false;
        }

        return true;
    });


    const missing = 5 - currentActive.length;

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Optimization Results</h2>
                <button
                    onClick={() => setHideUnselectedLocked(!hideUnselectedLocked)}
                    style={{
                        background: hideUnselectedLocked ? 'rgba(6, 182, 212, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                        border: hideUnselectedLocked ? '1px solid var(--secondary-color)' : '1px solid var(--glass-border)',
                        color: hideUnselectedLocked ? '#22d3ee' : '#94a3b8',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {hideUnselectedLocked ? '🔒 Hiding Unlockables' : 'Show All Units'}
                </button>
            </div>

            {/* ... Status Div remains the same ... */}

            <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                    Status:
                    <span style={{
                        color: isUnlocked ? '#4ade80' : '#f87171',
                        fontWeight: 'bold',
                        marginLeft: '0.5rem'
                    }}>
                        {isUnlocked ? 'Ryze Unlocked!' : 'Locked'}
                    </span>
                </div>

                {!isUnlocked && (
                    <div style={{ color: '#94a3b8' }}>
                        Need {missing} more regional trait{missing !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {solutions && solutions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {solutions.map((sol, idx) => {

                            // *** Wildcard Logic (Remains the same) ***
                            const usedWildcardUnits = {};
                            const unitIndexTracker = {};

                            // Separate and process wildcards and units
                            const bridges = sol.units.filter(item => item.type === 'unit').map(item => item.unit);
                            const wildcards = sol.units.filter(item => item.type === 'wildcard').map(wildcardItem => {
                                const trait = wildcardItem.trait;

                                if (!usedWildcardUnits[trait]) {
                                    usedWildcardUnits[trait] = getAllSingleRegionalUnits(trait);
                                    unitIndexTracker[trait] = 0;
                                }

                                const allUnits = usedWildcardUnits[trait];
                                let unitIndex = unitIndexTracker[trait];

                                // Cycle units using modulo (%)
                                const assignedUnit = allUnits.length > 0 ? allUnits[unitIndex % allUnits.length] : null;

                                unitIndexTracker[trait]++;

                                // Return the wildcard object with the assigned unit attached
                                return {
                                    ...wildcardItem,
                                    unit: assignedUnit // ATTACH THE UNIQUE UNIT HERE
                                };
                            });
                            // *** End Wildcard Logic ***

                            // Re-calculate the total units for display purposes
                            const totalUnits = selectedUnitCount + sol.units.length;

                            // Check against the passed-in level prop for the warning display
                            const isOverLevel = totalUnits > level;

                            // Note: If you want to check against Level 8 specifically, use: const isOverLevel8 = totalUnits > 8;
                            // but checking against 'level' (the prop) is more general and correct.

                            return (
                                <div
                                    key={idx}
                                    className="card"
                                    style={{
                                        background: 'rgba(30, 41, 59, 0.5)',
                                        border: '1px solid var(--glass-border)',
                                        padding: '1rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Option {idx + 1}</span>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <span style={{
                                                fontSize: '0.8rem',
                                                color: isOverLevel ? '#f87171' : '#94a3b8',
                                                fontWeight: isOverLevel ? 'bold' : 'normal'
                                            }}>
                                                Level {totalUnits}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ... Unit/Wildcard display block remains the same ... */}
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {/* Show selected units (grayed out) */}
                                        {selectedUnits.map((unit, uIdx) => (
                                            <div key={`owned-${uIdx}`} style={{ opacity: 0.5, filter: 'grayscale(100%)' }}>
                                                <UnitIcon
                                                    unit={unit}
                                                    size="48px"
                                                    isLocked={LOCKED_UNITS.includes(unit.name)}
                                                />
                                            </div>
                                        ))}

                                        {/* Show multi-regional units (bridges) */}
                                        {bridges.map((unit, uIdx) => (
                                            <div key={`bridge-${uIdx}`}>
                                                <UnitIcon
                                                    unit={unit}
                                                    size="48px"
                                                    isLocked={LOCKED_UNITS.includes(unit.name)}
                                                />
                                            </div>
                                        ))}

                                        {/* Show wildcard slots as emblem icons */}
                                        {wildcards.map((wildcard, wIdx) => (
                                            <div key={`wildcard-${wIdx}`}>
                                                <WildcardIcon
                                                    trait={wildcard.trait}
                                                    unit={wildcard.unit} // <-- PASSING THE UNIQUE UNIT
                                                    size="48px"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {/* ... Trait list display remains the same ... */}

                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                        {sol.activeTraits.map(trait => (
                                            <span
                                                key={trait}
                                                style={{
                                                    fontSize: '0.7rem',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    color: '#94a3b8'
                                                }}
                                            >
                                                {trait}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    !isUnlocked && (
                        <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                            Add units or emblems to see suggestions.
                        </div>
                    )
                )}
            </div>

            {/* ... Currently Active Div remains the same ... */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                    Currently Active ({currentActive.length}/5)
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {currentActive.map(trait => (
                        <span
                            key={trait}
                            style={{
                                background: 'rgba(6, 182, 212, 0.2)',
                                color: '#22d3ee',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '999px',
                                fontSize: '0.8rem',
                                border: '1px solid rgba(6, 182, 212, 0.3)'
                            }}
                        >
                            {trait}
                        </span>
                    ))}
                    {currentActive.length === 0 && (
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>None active</span>
                    )}
                </div>
            </div>
        </div>
    );
}