import React from 'react';
import UnitIcon from './UnitIcon';
import { LOCKED_UNITS } from '../data/units';

export default function CompositionResults({ results, currentActive, selectedUnits = [] }) {
    const { isUnlocked, solutions, activeTraits } = results;
    const missing = 5 - currentActive.length;

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 className="section-title">Optimization Results</h2>

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
                            const fullComp = [
                                ...selectedUnits.map(u => ({ ...u, isOwned: true })),
                                ...sol.units.map(u => ({ ...u, isOwned: false }))
                            ].sort((a, b) => a.cost - b.cost);

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
                                            <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>+{sol.cost}g</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {fullComp.map((unit, uIdx) => (
                                            <div key={uIdx} style={{ opacity: unit.isOwned ? 0.5 : 1, filter: unit.isOwned ? 'grayscale(100%)' : 'none' }}>
                                                <UnitIcon
                                                    unit={unit}
                                                    size="48px"
                                                    isLocked={LOCKED_UNITS.includes(unit.name)}
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
