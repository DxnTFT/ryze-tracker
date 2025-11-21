import React, { useState } from 'react';

const COST_COLORS = {
    1: '#808080', // Grey
    2: '#11b288', // Green
    3: '#207ac7', // Blue
    4: '#c38bce', // Purple
    5: '#ffb93b', // Gold
    7: '#ffb93b'  // Gold (7 cost)
};

const COST_BORDERS = {
    1: '2px solid #808080',
    2: '2px solid #11b288',
    3: '2px solid #207ac7',
    4: '2px solid #c38bce',
    5: '2px solid #ffb93b',
    7: '2px solid #ffb93b'
};

export default function UnitIcon({ unit, onClick, isSelected, isDimmed = false, isLocked = false, size = '64px' }) {
    const [imgError, setImgError] = useState(false);

    // Special mappings for Set 16 / Custom units
    const NAME_MAPPINGS = {
        // Standard Data Dragon Fixes
        "Cho'Gath": "Chogath",
        "Kog'Maw": "KogMaw",
        "Rek'Sai": "RekSai",
        "Vel'Koz": "Velkoz",
        "Bel'Veth": "Belveth",
        "Kai'Sa": "Kaisa",
        "Kha'Zix": "Khazix",
        "LeBlanc": "Leblanc",
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
        "Kobuko& Yuumi": "https://raw.communitydragon.org/pbe/game/assets/characters/tft15_kobuko/skins/base/images/tft15_kobuko.tft_set15.png", // Fallback to Kobuko
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
        "Lucian& Senna": "Lucian", // Just show Lucian for now
    };

    let mappedValue = NAME_MAPPINGS[unit.name];

    // Handle special case for names with '&' if not explicitly mapped
    if (!mappedValue && unit.name.includes('&')) {
        const baseName = unit.name.split('&')[0].trim();
        mappedValue = NAME_MAPPINGS[baseName] || baseName.replace(/['\s.]/g, '');
    }

    // If no mapping, default to removing spaces/dots/apostrophes
    if (!mappedValue) {
        mappedValue = unit.name.replace(/['\s.]/g, '');
    }

    // Determine final URL
    const imgUrl = mappedValue.startsWith('http')
        ? mappedValue
        : `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${mappedValue}.png`;

    return (
        <div
            onClick={() => onClick && onClick(unit)}
            style={{
                width: size,
                height: size,
                position: 'relative',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s, opacity 0.2s, filter 0.2s',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                opacity: isDimmed ? 0.3 : (isSelected ? 1 : (onClick ? 0.7 : 1)),
                filter: isDimmed ? 'grayscale(100%)' : 'none',
                pointerEvents: isDimmed ? 'none' : 'auto'
            }}
            title={unit.name}
        >
            <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '4px',
                overflow: 'hidden',
                border: isSelected ? '2px solid white' : COST_BORDERS[unit.cost] || '2px solid white',
                boxSizing: 'border-box',
                position: 'relative'
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
            </div>

            {/* Cost Indicator */}
            <div style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                background: '#0f172a',
                border: `1px solid ${COST_COLORS[unit.cost]}`,
                color: COST_COLORS[unit.cost],
                fontSize: '10px',
                fontWeight: 'bold',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
            }}>
                {unit.cost}
            </div>

            {/* Selected Checkmark */}
            {isSelected && (
                <div style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '-4px',
                    background: '#22c55e',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    zIndex: 2
                }}>
                    ✓
                </div>
            )}

            {/* Lock Icon */}
            {isLocked && !isSelected && (
                <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    background: 'rgba(0, 0, 0, 0.6)',
                    color: '#fbbf24', // Amber-400
                    borderRadius: '4px',
                    width: '14px',
                    height: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    zIndex: 2,
                    backdropFilter: 'blur(2px)'
                }}>
                    🔒
                </div>
            )}
        </div>
    );
}
