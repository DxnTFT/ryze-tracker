import React from 'react';
import { emblemData } from '../data/emblems';

export default function EmblemIcon({ trait, size = '48px', tooltip = true }) {
    const data = emblemData[trait];

    if (!data) {
        return null;
    }

    const containerStyle = {
        width: size,
        height: size,
        borderRadius: '8px',
        background: data.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `calc(${size} * 0.5)`,
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative'
    };

    const hoverStyle = {
        transform: 'scale(1.05)',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.4)'
    };

    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div
            style={{
                ...containerStyle,
                ...(isHovered ? hoverStyle : {})
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title={tooltip ? `Any ${trait} unit` : ''}
        >
            <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))' }}>
                {data.symbol}
            </span>
        </div>
    );
}
