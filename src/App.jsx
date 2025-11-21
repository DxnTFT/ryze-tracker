import React, { useState, useEffect } from 'react';
import UnitSelector from './components/UnitSelector';
import EmblemSelector from './components/EmblemSelector';
import CompositionResults from './components/CompositionResults';
import UnitIcon from './components/UnitIcon';
import { findAllSolutions, calculateActiveTraits } from './utils/optimizer';

function App() {
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedEmblems, setSelectedEmblems] = useState([]);
  const [level, setLevel] = useState(8);
  const [results, setResults] = useState({ solutions: [], isUnlocked: false, activeTraits: [] });

  const handleUnitToggle = (unit) => {
    setSelectedUnits(prev => {
      const exists = prev.find(u => u.name === unit.name);
      if (exists) {
        return prev.filter(u => u.name !== unit.name);
      }
      return [...prev, unit];
    });
  };

  const handleEmblemAdd = (trait) => {
    setSelectedEmblems(prev => {
      const count = prev.filter(t => t === trait).length;
      if (count >= 2) {
        return prev; // Max 2 emblems per trait
      }
      return [...prev, trait];
    });
  };

  const handleEmblemRemove = (trait) => {
    setSelectedEmblems(prev => {
      const index = prev.indexOf(trait);
      if (index === -1) return prev;
      return prev.filter((t, i) => i !== index);
    });
  };

  useEffect(() => {
    const optimizationResult = findAllSolutions(selectedUnits, selectedEmblems);
    setResults(optimizationResult);
  }, [selectedUnits, selectedEmblems]);

  const { activeRegional } = calculateActiveTraits(selectedUnits, selectedEmblems);

  return (
    <div className="app-container">
      <header style={{ textAlign: 'center', marginBottom: '2rem', gridColumn: '1 / -1' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '800',
          background: 'linear-gradient(to right, #8b5cf6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          Ryze Trait Tracker
        </h1>
      </header>

      {/* Left Pane: Unit Selector */}
      <div className="selector-pane">
        <UnitSelector
          selectedUnits={selectedUnits}
          onUnitToggle={handleUnitToggle}
        />

        {/* Emblems Section */}
        <div className="glass-panel" style={{ marginTop: '1.5rem' }}>
          <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Selected Emblems</h3>
          <EmblemSelector
            selectedEmblems={selectedEmblems}
            onEmblemAdd={handleEmblemAdd}
            onEmblemRemove={handleEmblemRemove}
            horizontal={true}
          />
        </div>
      </div>

      {/* Right Pane: Results & Selected Context */}
      <div className="results-pane">
        {/* Selected Units Row */}
        <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Selected Units</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', minHeight: '48px' }}>
            {selectedUnits.length > 0 ? (
              selectedUnits.map(unit => (
                <UnitIcon
                  key={unit.name}
                  unit={unit}
                  onClick={() => handleUnitToggle(unit)}
                  size="48px"
                />
              ))
            ) : (
              <span style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>No units selected</span>
            )}
          </div>
        </div>

        {/* Level Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Your Level</h3>
          <select
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value))}
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: '#e2e8f0',
              fontSize: '1rem',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <option value={8}>Level 8 (max 8 units)</option>
            <option value={9}>Level 9 (max 9 units)</option>
            <option value={10}>Level 10 (max 10 units)</option>
          </select>
        </div>

        {/* Results */}
        <div className="results-container">
          <CompositionResults
            results={results}
            currentActive={activeRegional}
            selectedUnits={selectedUnits}
            level={level}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
