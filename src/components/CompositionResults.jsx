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

// -------------------------------------------------------------------------------

export default function CompositionResults({ results, currentActive, selectedUnits = [], onUnitToggle }) {
    const { isUnlocked, solutions: allSolutions, activeTraits } = results;

    // New State for Trait Filters
    const [selectedTraitFilters, setSelectedTraitFilters] = useState([]);

    const selectedUnitNames = new Set(selectedUnits.map(u => u.name));
    const selectedUnitCount = selectedUnits.length;

    // Helper to toggle a trait filter
    const toggleTraitFilter = (trait) => {
        if (selectedTraitFilters.includes(trait)) {
            setSelectedTraitFilters(selectedTraitFilters.filter(t => t !== trait));
        } else {
            setSelectedTraitFilters([...selectedTraitFilters, trait]);
        }
    };

    // Filter solutions based on selected trait filters
    const solutions = allSolutions.filter(sol => {
        // Check if solution has ALL selected filter traits
        if (selectedTraitFilters.length > 0) {
            const hasAllFilters = selectedTraitFilters.every(filter =>
                // Check if trait is in the solution OR already active for the user
                sol.activeTraits.includes(filter) || currentActive.includes(filter)
            );
            if (!hasAllFilters) return false;
        }
        return true;
    });


    const missing = 4 - currentActive.length;
    const regionalTraitNames = regionalTraits.map(rt => rt[0]).sort();

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Compositions</h2>

                {/* Trait Filter Dropdown */}
                <div style={{ position: 'relative', marginBottom: '2px' }}>
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                toggleTraitFilter(e.target.value);
                                e.target.value = ""; // Reset select
                            }
                        }}
                        style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            border: '1px solid var(--glass-border)',
                            color: '#94a3b8',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            outline: 'none'
                        }}
                    >
                        <option value="">+ Add Filter</option>
                        {regionalTraitNames.map(trait => (
                            <option
                                key={trait}
                                value={trait}
                                disabled={selectedTraitFilters.includes(trait)}
                                style={{ background: '#1e293b', color: 'white' }}
                            >
                                {trait}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Active Filters Display */}
            {selectedTraitFilters.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {selectedTraitFilters.map(trait => (
                        <span
                            key={trait}
                            onClick={() => toggleTraitFilter(trait)}
                            style={{
                                background: 'rgba(139, 92, 246, 0.2)',
                                color: '#c4b5fd',
                                border: '1px solid rgba(139, 92, 246, 0.4)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '999px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {trait}
                            <span style={{ fontSize: '1rem', lineHeight: 0 }}>&times;</span>
                        </span>
                    ))}
                    <span
                        onClick={() => setSelectedTraitFilters([])}
                        style={{
                            fontSize: '0.8rem',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            alignSelf: 'center',
                            marginLeft: '0.5rem'
                        }}
                    >
                        Clear All
                    </span>
                </div>
            )}

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
                        {solutions.slice(0, 10).map((sol, idx) => {

                            // *** Wildcard Logic (Remains the same) ***
                            const usedWildcardUnits = {};
                            const unitIndexTracker = {};

                            // Separate and process wildcards and units
                            const bridges = sol.units
                                .filter(item => item.type === 'unit')
                                .map(item => item.unit);
                            // REMOVED: .filter(unit => !selectedUnitNames.has(unit.name)); 
                            // We want to show ALL units in the solution, but style them differently.

                            const wildcards = sol.units.filter(item => item.type === 'wildcard').map(wildcardItem => {
                                const trait = wildcardItem.trait;

                                if (!usedWildcardUnits[trait]) {
                                    // Get all valid units for this trait
                                    const allTraitUnits = getAllSingleRegionalUnits(trait);

                                    // Filter out units that are already selected by the user
                                    const availableUnits = allTraitUnits.filter(u => !selectedUnitNames.has(u.name));

                                    // If all units are selected (edge case), fall back to all units to avoid empty/crash
                                    usedWildcardUnits[trait] = availableUnits.length > 0 ? availableUnits : allTraitUnits;

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
                                                color: '#94a3b8',
                                                fontWeight: 'normal'
                                            }}>
                                                {totalUnits} Units
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
                                                    onClick={() => onUnitToggle && onUnitToggle(unit)}
                                                />
                                            </div>
                                        ))}

                                        {/* Show ALL units in the solution (bridges) */}
                                        {bridges.map((unit, uIdx) => {
                                            // Bridges are units suggested by the optimizer, so they are NOT in selectedUnits
                                            return (
                                                <div key={`bridge-${uIdx}`}>
                                                    <UnitIcon
                                                        unit={unit}
                                                        size="48px"
                                                        isLocked={LOCKED_UNITS.includes(unit.name)}
                                                        onClick={() => onUnitToggle && onUnitToggle(unit)}
                                                    />
                                                </div>
                                            );
                                        })}

                                        {/* Show wildcard slots as emblem icons */}
                                        {wildcards.map((wildcard, wIdx) => (
                                            <div key={`wildcard-${wIdx}`}>
                                                <WildcardIcon
                                                    trait={wildcard.trait}
                                                    unit={wildcard.unit} // <-- PASSING THE UNIQUE UNIT
                                                    size="48px"
                                                    onClick={() => onUnitToggle && wildcard.unit && onUnitToggle(wildcard.unit)}
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
                                                    color: '#94a3b8',
                                                    border: selectedTraitFilters.includes(trait) ? '1px solid #8b5cf6' : 'none'
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

            {/* ... Currently Active Div ... */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>
                    Currently Active ({currentActive.length}/4)
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