import React, { useState } from 'react';
import UnitIcon from './UnitIcon';
import WildcardIcon from './WildcardIcon';
import { LOCKED_UNITS } from '../data/units';

// --- Placeholder/Fix Definitions (Keep these until you properly import them) ---
const SHURIMA_UNITS = [
    "Azir", "Nasus", "Renekton", "Xerath"
];
const AZIR_NAME = "Azir";
// -------------------------------------------------------------------------------

export default function CompositionResults({ results, currentActive, selectedUnits = [], level = 8 }) {
    const { isUnlocked, solutions: allSolutions, activeTraits } = results;
    const [hideUnselectedLocked, setHideUnselectedLocked] = useState(false);
    const selectedUnitNames = new Set(selectedUnits.map(u => u.name));

    // Check for Azir's presence
    const isAzirSelected = selectedUnitNames.has(AZIR_NAME);

    // Filter solutions based on hideUnselectedLocked flag AND Shurima rule
    const solutions = allSolutions.filter(sol => {

        // 1. Check for locked units (Existing Logic)
        if (hideUnselectedLocked) {
            const hasLocked = sol.units.some(item => {
                if (item.type !== 'unit') return false;
                const unitName = item.unit.name;
                return LOCKED_UNITS.includes(unitName) && !selectedUnitNames.has(unitName);
            });
            if (hasLocked) return false;
        }

        // 2. **REVISED Shurima Rule Check**
        if (!isAzirSelected) {
            const hasShurima = sol.units.some(item => {
                const isShurimaUnit = item.type === 'unit' && SHURIMA_UNITS.includes(item.unit.name);
                const isShurimaWildcard = item.type === 'wildcard' && item.trait === 'Shurima'; // <-- NEW CHECK

                return isShurimaUnit || isShurimaWildcard;
            });

            // If Azir is NOT selected, and the solution HAS a Shurima unit or wildcard, filter it out.
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
                            // Separate wildcards and units
                            const bridges = sol.units.filter(item => item.type === 'unit').map(item => item.unit);
                            const wildcards = sol.units.filter(item => item.type === 'wildcard');

                            const totalUnits = selectedUnits.length + sol.units.length;
                            const isOverLevel8 = totalUnits > 8;

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
                                                color: isOverLevel8 ? '#f87171' : '#94a3b8',
                                                fontWeight: isOverLevel8 ? 'bold' : 'normal'
                                            }}>
                                                Level {totalUnits}
                                            </span>
                                        </div>
                                    </div>

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
                                                    size="48px"
                                                />
                                            </div>
                                        ))}
                                    </div>

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
