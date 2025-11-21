import React from 'react';
import UnitIcon from './UnitIcon';
import { regionalTraits } from '../data/traits';
import { units } from '../data/units';

// Helper to get a representative single‑regional unit for a trait
function getRepresentativeUnit(trait) {
    // Find first unit that has this trait and only this regional trait
    return units.find(u => {
        const regional = u.traits.filter(t => regionalTraits.map(rt => rt[0]).includes(t));
        return regional.includes(trait) && regional.length === 1;
    });
}

export default function WildcardIcon({ trait, size = '48px' }) {
    const repUnit = getRepresentativeUnit(trait);
    if (!repUnit) {
        // Fallback: simple box with label
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: '8px',
                    background: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fbbf24',
                    fontSize: '0.7rem',
                    border: '2px solid rgba(255,255,255,0.2)'
                }}
                title={`Any ${trait} Trait`}
            >
                Any
            </div>
        );
    }
    return (
        <UnitIcon
            unit={repUnit}
            size={size}
            isWildcard={true}
            title={`Any ${trait} Trait`}
        />
    );
}
