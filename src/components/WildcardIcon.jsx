import React from 'react';
import UnitIcon from './UnitIcon';

// Simple fallback unit structure if the assigned unit is missing
const FALLBACK_UNIT = { name: "Wildcard", cost: 1, traits: [] };

export default function WildcardIcon({ unit, trait, size = '48px' }) {

    // Use the unit passed by CompositionResults, or fall back
    const repUnit = unit || FALLBACK_UNIT;

    // Generic fallback for a truly empty/unassigned slot
    if (!unit && !trait) {
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
                title={`Any Trait`}
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
            // Use the trait prop for the tooltip if available
            title={`Any ${trait || repUnit.name} Trait`}
        />
    );
}