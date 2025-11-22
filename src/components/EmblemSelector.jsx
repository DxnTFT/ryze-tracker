import React from 'react';
import { regionalTraits, traitsWithoutEmblems } from '../data/traits';

function EmblemItem({ trait, count, onAdd, onRemove }) {
    return (
        <div
            onClick={() => onAdd(trait)}
            onContextMenu={(e) => {
                e.preventDefault();
                onRemove(trait);
            }}
            style={{
                cursor: 'pointer',
                background: count > 0 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                border: count > 0 ? '1px solid var(--secondary-color)' : '1px solid var(--glass-border)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                userSelect: 'none',
                WebkitUserSelect: 'none'
            }}
        >
            <span style={{ color: count > 0 ? '#22d3ee' : '#94a3b8' }}>{trait}</span>
            {count > 0 && (
                <span style={{
                    background: 'var(--secondary-color)',
                    color: 'white',
                    borderRadius: '999px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                }}>
                    {count}
                </span>
            )}
        </div>
    );
}

export default function EmblemSelector({ selectedEmblems, onEmblemAdd, onEmblemRemove, horizontal = false }) {
    // Filter out traits that don't have emblems
    const availableEmblems = regionalTraits.filter(([trait]) => !traitsWithoutEmblems.includes(trait));

    return (
        <div className={horizontal ? "" : "glass-panel"}>
            {!horizontal && <h2 className="section-title">Select Emblems</h2>}
            {!horizontal && (
                <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Left-click to add, Right-click to remove
                </p>
            )}

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                flexDirection: 'row'
            }}>
                {availableEmblems.map(([trait, breakpoint]) => {
                    const count = selectedEmblems.filter(t => t === trait).length;
                    return (
                        <EmblemItem
                            key={trait}
                            trait={trait}
                            count={count}
                            onAdd={onEmblemAdd}
                            onRemove={onEmblemRemove}
                        />
                    );
                })}
            </div>
        </div>
    );
}
