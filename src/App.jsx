import React, { useState, useEffect } from 'react';
import UnitSelector from './components/UnitSelector';
import EmblemSelector from './components/EmblemSelector';
import CompositionResults from './components/CompositionResults';
import UnitIcon from './components/UnitIcon';
import { findAllSolutions, calculateActiveTraits } from './utils/optimizer';

function App() {
  // Force rebuild
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedEmblems, setSelectedEmblems] = useState([]);
  const [excludedUnits, setExcludedUnits] = useState([]);
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

  const handleUnitExclude = (unit) => {
    setExcludedUnits(prev => {
      const exists = prev.includes(unit.name);
      if (exists) {
        return prev.filter(name => name !== unit.name);
      }
      return [...prev, unit.name];
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

  const handleReset = () => {
    setSelectedUnits([]);
    setSelectedEmblems([]);
    setExcludedUnits([]);
  };

  useEffect(() => {
    const optimizationResult = findAllSolutions(selectedUnits, selectedEmblems, excludedUnits);
    setResults(optimizationResult);
  }, [selectedUnits, selectedEmblems, excludedUnits]);

  const { activeRegional } = calculateActiveTraits(selectedUnits, selectedEmblems);

  return (
    <div className="app-container">
      <header style={{ textAlign: 'center', marginBottom: '0.5rem', gridColumn: '1 / -1' }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '800',
          background: 'linear-gradient(to right, #8b5cf6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0'
        }}>
          Ryze Trait Tracker
        </h1>
      </header>

      {/* Left Pane: Unit Selector */}
      <div className="selector-pane">
        <UnitSelector
          selectedUnits={selectedUnits}
          onUnitToggle={handleUnitToggle}
          excludedUnits={excludedUnits}
          onUnitExclude={handleUnitExclude}
          onReset={handleReset}
        />

        {/* Emblems Section */}
        <div className="glass-panel" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: 0, borderBottom: 'none' }}>Selected Emblems</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontStyle: 'italic' }}>
              Left-click to add, Right-click to remove
            </p>
          </div>
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



        {/* Results */}
        <div className="results-container">
          <CompositionResults
            results={results}
            currentActive={activeRegional}
            selectedUnits={selectedUnits}
            onUnitToggle={handleUnitToggle}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
