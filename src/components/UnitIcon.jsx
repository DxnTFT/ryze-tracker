import React, { useState } from 'react';
import { regionalTraits } from '../data/traits';

// Cost based colors and borders used for the cost indicator
const COST_COLORS = {
    1: '#808080', // Grey
    2: '#11b288', // Green
    3: '#207ac7', // Blue
    4: '#c38bce', // Purple
    5: '#ffb93b', // Gold
    7: '#ffb93b' // Gold (7 cost)
};

const COST_BORDERS = {
    1: '2px solid #808080',
    2: '2px solid #11b288',
    3: '2px solid #207ac7',
    4: '2px solid #c38bce',
    5: '2px solid #ffb93b',
    7: '2px solid #ffb93b'
};

// Helper set of regional trait names for tooltip generation
const regionalSet = new Set(regionalTraits.map(t => t[0]));

// Mapping for special unit names / custom assets
const NAME_MAPPINGS = {
    "Cho'Gath": "Chogath",
    "Kog'Maw": "KogMaw",
    "Rek'Sai": "RekSai",
    "Vel'Koz": "Velkoz",
    "Bel'Veth": "Belveth",
    "Kai'Sa": "Kaisa",
    "Kha'Zix": "Khazix",
    "Dr.Mundo": "DrMundo",
    "Jarvan IV": "JarvanIV",
    "TwistedFate": "TwistedFate",
    "XinZhao": "XinZhao",
    "MissFortune": "MissFortune",
    "AurelionSol": "AurelionSol",
    "Wukong": "MonkeyKing",
    "Nunu & Willump": "Nunu",
    "TahmKench": "TahmKench",
    // TFT Exclusive / Set 16 Units (Community Dragon URLs)
    "Kobuko": "https://raw.communitydragon.org/pbe/game/assets/characters/tft15_kobuko/skins/base/images/tft15_kobuko.tft_set15.png",
    "Kobuko& Yuumi": "https://raw.communitydragon.org/pbe/game/assets/characters/tft15_kobuko/skins/base/images/tft15_kobuko.tft_set15.png",
    "Rift Herald": "https://raw.communitydragon.org/pbe/game/assets/ux/tft/championsplashes/tft_riftherald.png",
    "RiftHerald": "https://raw.communitydragon.org/pbe/game/assets/ux/tft/championsplashes/tft_riftherald.png",
    "Renata Glasc": "https://raw.communitydragon.org/pbe/game/assets/characters/tft13_renataglasc/skins/base/images/tft13_renataglasc.tft_set13.png",
    "Smeech": "https://raw.communitydragon.org/pbe/game/assets/characters/tft13_gremlin/skins/base/images/tft13_gremlin.tft_set13.png",
    "Sevika": "https://raw.communitydragon.org/pbe/game/assets/characters/tft13_lieutenant/skins/base/images/tft13_lieutenant.tft_set13.png",
    "Loris": "https://raw.communitydragon.org/pbe/game/assets/characters/tft16_loris/skins/base/images/tft16_loris_splash_centered_0.tft_set16.png",
    "Powder": "https://raw.communitydragon.org/pbe/game/assets/characters/tft13_blue/skins/base/images/tft13_blue.tft_set13.png",
    "Vander": "https://raw.communitydragon.org/pbe/game/assets/characters/tft13_prime/skins/base/images/tft13_prime.tft_set13.png",
    "Violet": "https://raw.communitydragon.org/pbe/game/assets/characters/tft13_red/skins/base/images/tft13_red.tft_set13.png",
    "Ambessa": "https://raw.communitydragon.org/pbe/game/assets/characters/tft16_ambessa/skins/base/images/tft16_ambessa_splash_centered_0.tft_set16.png",
    "Brock": "https://raw.communitydragon.org/pbe/game/assets/characters/tft16_brock/skins/base/images/tft16_brock_splash_centered_0.tft_set16.png",
    "T-Hex": "https://raw.communitydragon.org/pbe/game/assets/characters/tft16_thex/hud/tft16_thex.tft_set16.png",
    "Baron Nashor": "https://raw.communitydragon.org/pbe/game/assets/characters/tft16_baronnashor/skins/base/images/tft16_baronnashor_splash_centered_0.tft_set16.png",
    "Baron": "https://raw.communitydragon.org/pbe/game/assets/characters/tft16_baronnashor/skins/base/images/tft16_baronnashor_splash_centered_0.tft_set16.png",
    "Yunara": "https://raw.communitydragon.org/pbe/game/assets/characters/tft16_yunara/skins/base/images/tft16_yunara_splash_centered_0.tft_set16.png",
    "Zaahen": "https://raw.communitydragon.org/pbe/game/assets/characters/tft16_zaahen/skins/base/images/tft16_zaahen_splash_centered_0.tft_set16.png",
    "Mel": "https://raw.communitydragon.org/pbe/game/assets/characters/tft13_missmage/skins/base/images/tft13_missmage.tft_set13_evolved.png",
    "LeBlanc": "Leblanc",
};

export default function UnitIcon({
    unit,
    onClick,
    onContextMenu,
    isSelected,
    isDimmed = false,
    isLocked = false,
    size = '64px',
    isWildcard = false, // true for single‑regional units acting as wildcards
    isExcluded = false,
    ...props
}) {
    const [imgError, setImgError] = useState(false);

    // Resolve the image URL for the unit
    let mappedValue = NAME_MAPPINGS[unit.name];
    if (!mappedValue && unit.name.includes('&')) {
        const baseName = unit.name.split('&')[0].trim();
        mappedValue = NAME_MAPPINGS[baseName] || baseName.replace(/[\'\s.]/g, '');
    }
    if (!mappedValue) {
        mappedValue = unit.name.replace(/[\'\s.]/g, '');
    }
    const imgUrl = mappedValue.startsWith('http')
        ? mappedValue
        : `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${mappedValue}.png`;

    // Determine the regional trait for tooltip when this is a wildcard
    const wildcardTrait = unit.traits.find(t => regionalSet.has(t));
    const tooltip = isWildcard && wildcardTrait ? `Any ${wildcardTrait} Trait` : unit.name;

    return (
        <div
            className={`unit-icon ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''} ${isExcluded ? 'excluded' : ''}`}
            onClick={() => onClick && onClick(unit)}
            onContextMenu={(e) => {
                e.preventDefault();
                if (onContextMenu) onContextMenu(e);
            }}
            style={{
                width: size,
                height: size,
                cursor: onClick ? 'pointer' : 'default',
            }}
            title={isExcluded ? `Excluded: ${unit.name}` : tooltip}
            {...props}
        >
            <div className="unit-icon-inner" style={{
                border: isSelected ? '2px solid white' : COST_BORDERS[unit.cost] || '2px solid white'
            }}>
                {!imgError ? (
                    <img
                        src={imgUrl}
                        alt={unit.name}
                        onError={() => setImgError(true)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        {unit.name.substring(0, 4)}
                    </div>
                )}
                {isWildcard && (
                    <div className="unit-wildcard-badge">Any</div>
                )}
            </div>
            {/* Cost Indicator */}
            <div className="unit-cost" style={{
                border: `1px solid ${COST_COLORS[unit.cost]}`,
                color: COST_COLORS[unit.cost]
            }}>
                {unit.cost}
            </div>
            {/* Selected Checkmark */}
            {isSelected && (
                <div className="unit-selected-indicator">✓</div>
            )}
            {/* Lock Icon */}
            {isLocked && !isSelected && (
                <div className="unit-locked-indicator">🔒</div>
            )}
        </div>
    );
}
