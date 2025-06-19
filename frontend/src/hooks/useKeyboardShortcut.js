import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for handling keyboard shortcuts
 * @param {string|string[]} keys - The key or array of keys to listen for (e.g., 'Escape', 'Ctrl+Shift+K')
 * @param {Function} callback - The function to call when the shortcut is pressed
 * @param {Object} options - Configuration options
 * @param {boolean} [options.ctrlKey=false] - Whether the Ctrl key must be pressed
 * @param {boolean} [options.shiftKey=false] - Whether the Shift key must be pressed
 * @param {boolean} [options.altKey=false] - Whether the Alt/Option key must be pressed
 * @param {boolean} [options.metaKey=false] - Whether the Meta/Command key must be pressed
 * @param {boolean} [options.preventDefault=true] - Whether to prevent default behavior for the key event
 * @param {boolean} [options.enabled=true] - Whether the shortcut is currently enabled
 * @param {HTMLElement|Window} [options.target=window] - The target element to listen on (defaults to window)
 */
const useKeyboardShortcut = (
  keys,
  callback,
  {
    ctrlKey = false,
    shiftKey = false,
    altKey = false,
    metaKey = false,
    preventDefault = true,
    enabled = true,
    target = typeof window !== 'undefined' ? window : null,
  } = {}
) => {
  const callbackRef = useRef(callback);
  const keysArray = Array.isArray(keys) ? keys : [keys];
  
  // Update the callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Handle the keydown event
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;
    
    const {
      key,
      code,
      ctrlKey: eventCtrlKey,
      shiftKey: eventShiftKey,
      altKey: eventAltKey,
      metaKey: eventMetaKey,
    } = event;

    // Check if the pressed key matches any of the specified keys
    const isKeyMatch = keysArray.some((shortcutKey) => {
      // Handle special keys like 'Escape', 'Enter', etc.
      const normalizedKey = key.length === 1 ? key.toLowerCase() : key;
      const normalizedShortcutKey = shortcutKey.length === 1 
        ? shortcutKey.toLowerCase() 
        : shortcutKey;
      
      return (
        normalizedKey === normalizedShortcutKey ||
        code === `Key${shortcutKey.toUpperCase()}` ||
        code === shortcutKey
      );
    });

    // Check if modifier keys match
    const modifiersMatch = 
      (ctrlKey === eventCtrlKey || ctrlKey === undefined) &&
      (shiftKey === eventShiftKey || shiftKey === undefined) &&
      (altKey === eventAltKey || altKey === undefined) &&
      (metaKey === eventMetaKey || metaKey === undefined);

    if (isKeyMatch && modifiersMatch) {
      if (preventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      callbackRef.current(event);
    }
  }, [keysArray, ctrlKey, shiftKey, altKey, metaKey, preventDefault, enabled]);

  // Set up the event listener
  useEffect(() => {
    if (!target || !enabled) return;
    
    target.addEventListener('keydown', handleKeyDown, { capture: true });
    
    return () => {
      target.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [target, handleKeyDown, enabled]);
};

export default useKeyboardShortcut;

// Helper function to create a keyboard shortcut handler
useKeyboardShortcut.createHandler = (shortcuts = []) => {
  const shortcutMap = new Map();
  
  // Register shortcuts
  const register = (keys, callback, options = {}) => {
    const id = Symbol('shortcut');
    shortcutMap.set(id, { keys, callback, options });
    return () => unregister(id);
  };
  
  // Unregister a shortcut
  const unregister = (id) => {
    return shortcutMap.delete(id);
  };
  
  // Unregister all shortcuts
  const unregisterAll = () => {
    shortcutMap.clear();
  };
  
  // Get all registered shortcuts
  const getShortcuts = () => {
    return Array.from(shortcutMap.entries()).map(([id, { keys, options }]) => ({
      id,
      keys,
      options,
    }));
  };
  
  // Initialize with default shortcuts if provided
  if (Array.isArray(shortcuts)) {
    shortcuts.forEach(({ keys, callback, options }) => {
      register(keys, callback, options);
    });
  }
  
  return {
    register,
    unregister,
    unregisterAll,
    getShortcuts,
  };
};

// Common keyboard shortcuts
export const KEY_CODES = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  HOME: 'Home',
  END: 'End',
  F1: 'F1',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  F5: 'F5',
  F6: 'F6',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
  F10: 'F10',
  F11: 'F11',
  F12: 'F12',
};

// Common modifier keys
export const MODIFIER_KEYS = {
  CTRL: 'Ctrl',
  SHIFT: 'Shift',
  ALT: 'Alt',
  META: 'Meta', // Command on Mac, Windows key on Windows
};

// Helper function to parse shortcut strings like "Ctrl+Shift+K"
export const parseShortcut = (shortcut) => {
  if (!shortcut) return { key: null, modifiers: {} };
  
  const parts = shortcut.split('+').map(part => part.trim());
  const modifiers = {};
  let key = null;
  
  parts.forEach(part => {
    const lowerPart = part.toLowerCase();
    
    switch (lowerPart) {
      case 'ctrl':
      case 'control':
        modifiers.ctrlKey = true;
        break;
      case 'shift':
        modifiers.shiftKey = true;
        break;
      case 'alt':
      case 'option':
        modifiers.altKey = true;
        break;
      case 'meta':
      case 'cmd':
      case 'command':
      case 'win':
      case 'windows':
        modifiers.metaKey = true;
        break;
      default:
        key = part;
    }
  });
  
  return { key, modifiers };
};
