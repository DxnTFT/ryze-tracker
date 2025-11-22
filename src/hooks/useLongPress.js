import { useRef, useCallback } from 'react';

export default function useLongPress(onLongPress, onClick, { shouldPreventDefault = true, delay = 500 } = {}) {
    const timeout = useRef();
    const target = useRef();
    const longPressTriggered = useRef(false);

    const start = useCallback(
        event => {
            if (shouldPreventDefault && event.target) {
                event.target.addEventListener('touchend', preventDefault, { passive: false });
                target.current = event.target;
            }
            longPressTriggered.current = false;
            timeout.current = setTimeout(() => {
                longPressTriggered.current = true;
                onLongPress(event);
            }, delay);
        },
        [onLongPress, delay, shouldPreventDefault]
    );

    const clear = useCallback(
        (event, shouldTriggerClick = true) => {
            timeout.current && clearTimeout(timeout.current);
            if (shouldTriggerClick && !longPressTriggered.current && onClick) {
                onClick(event);
            }
            longPressTriggered.current = false;
            if (shouldPreventDefault && target.current) {
                target.current.removeEventListener('touchend', preventDefault);
            }
        },
        [shouldPreventDefault, onClick]
    );

    return {
        onMouseDown: e => start(e),
        onTouchStart: e => start(e),
        onMouseUp: e => clear(e),
        onMouseLeave: e => clear(e, false),
        onTouchEnd: e => clear(e)
    };
}

const preventDefault = e => {
    if (!isTouchEvent(e)) return;
    if (e.touches.length < 2 && e.preventDefault) {
        e.preventDefault();
    }
};

const isTouchEvent = e => {
    return e && 'touches' in e;
};
