import React, { useState } from 'react';
import { units, LOCKED_UNITS } from '../data/units';
import { regionalTraits } from '../data/traits';
import UnitIcon from './UnitIcon';

export default function UnitSelector({ selectedUnits, onUnitToggle }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [costFilter, setCostFilter] = useState('all');
    const [showLocked, setShowLocked] = useState(true); // Default: Show locked units

    // 1. Filter out 5-cost units that don't have a regional trait
    const regionalTraitNames = new Set(regionalTraits.map(t => t[0]));

    const validUnits = units.filter(unit => {
        // Exclude all 5-cost and 7-cost units
        if (unit.cost === 5 || unit.cost === 7) return false;

        // 5-cost regional filter (keeping for reference, but already excluded above)
        if (unit.cost === 5) {
            const hasRegional = unit.traits.some(t => regionalTraitNames.has(t));
            if (!hasRegional) return false;
        }

        // Locked unit filter: If showLocked is false, hide them.
        if (!showLocked && LOCKED_UNITS.includes(unit.name)) {
            return false;
        }

        return true;
    });

    // 2. Filter by Cost (Hard Filter - removes from list)
    const costFilteredUnits = validUnits.filter(unit => {
        return costFilter === 'all' || unit.cost === parseInt(costFilter);
    });

    return (
        <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="section-title" style={{ marginBottom: 0, borderBottom: 'none' }}>Select Units</h2>

                {/* Toggle for Locked Units */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'white', fontSize: '0.9rem' }}>
                    <input
                        type="checkbox"
                        checked={!showLocked}
                        onChange={(e) => setShowLocked(!e.target.checked)}
                        style={{ accentColor: '#8b5cf6' }}
                    />
                    Hide Unlockables
                </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    placeholder="Search units or traits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--glass-border)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        flex: 1
                    }}
                />
                <select
                    value={costFilter}
                    onChange={(e) => setCostFilter(e.target.value)}
                    style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--glass-border)',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '8px'
                    }}
                >
                    <option value="all">All Costs</option>
                    <option value="1">1 Cost</option>
                    <option value="2">2 Cost</option>
                    <option value="3">3 Cost</option>
                    <option value="4">4 Cost</option>
                    <option value="5">5 Cost</option>
                </select>
            </div>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingTop: '0.5rem'
            }}>
                {costFilteredUnits.map(unit => {
                    const isSelected = selectedUnits.some(u => u.name === unit.name);
                    const isLocked = LOCKED_UNITS.includes(unit.name);

                    // 3. Calculate Dimming based on Search
                    let isDimmed = false;
                    if (searchTerm) {
                        const lowerSearch = searchTerm.toLowerCase();
                        const nameMatch = unit.name.toLowerCase().includes(lowerSearch);
                        const traitMatch = unit.traits.some(t => t.toLowerCase().includes(lowerSearch));
                        if (!nameMatch && !traitMatch) {
                            isDimmed = true;
                        }
                    }

                    return (
                        <UnitIcon
                            key={unit.name}
                            unit={unit}
                            isSelected={isSelected}
                            isDimmed={isDimmed}
                            isLocked={isLocked}
                            onClick={onUnitToggle}
                            size="56px"
                        />
                    );
                })}
            </div>
        </div>
    );
}
