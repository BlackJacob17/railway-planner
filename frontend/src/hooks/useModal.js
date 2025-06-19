import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for managing modal/dialog state and behavior
 * @param {Object} options - Configuration options
 * @param {boolean} [options.initialOpen=false] - Whether the modal is initially open
 * @param {boolean} [options.closeOnOverlayClick=true] - Whether to close when clicking outside the modal
 * @param {boolean} [options.closeOnEsc=true] - Whether to close when pressing the Escape key
 * @param {boolean} [options.preventScroll=false] - Whether to prevent body scrolling when modal is open
 * @param {Function} [options.onOpen] - Callback when modal opens
 * @param {Function} [options.onClose] - Callback when modal closes
 * @param {React.RefObject} [options.triggerRef] - Ref to the element that triggers the modal
 * @returns {Object} Modal state and methods
 */
const useModal = ({
  initialOpen = false,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  preventScroll = false,
  onOpen,
  onClose,
  triggerRef,
} = {}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isVisible, setIsVisible] = useState(initialOpen);
  const [isMounted, setIsMounted] = useState(initialOpen);
  const modalRef = useRef(null);
  const previousFocus = useRef(null);
  const animationTimeout = useRef(null);

  // Handle opening the modal
  const open = useCallback(() => {
    if (isOpen) return;
    
    // Store the currently focused element before opening the modal
    previousFocus.current = document.activeElement;
    
    setIsOpen(true);
    setIsMounted(true);
    
    // Small delay to allow the modal to mount before showing it (for animations)
    animationTimeout.current = setTimeout(() => {
      setIsVisible(true);
      
      // Focus the modal when it opens
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      if (onOpen) {
        onOpen();
      }
    }, 10);
    
    // Prevent body scrolling when modal is open
    if (preventScroll) {
      document.body.style.overflow = 'hidden';
    }
  }, [isOpen, onOpen, preventScroll]);

  // Handle closing the modal
  const close = useCallback((event) => {
    if (!isOpen) return;
    
    // Don't close if the click was inside the modal content
    if (event && modalRef.current && modalRef.current.contains(event.target)) {
      return;
    }
    
    // Start closing animation
    setIsVisible(false);
    
    // Wait for animation to complete before unmounting
    animationTimeout.current = setTimeout(() => {
      setIsOpen(false);
      setIsMounted(false);
      
      // Restore focus to the previously focused element
      if (previousFocus.current && typeof previousFocus.current.focus === 'function') {
        previousFocus.current.focus();
      }
      
      if (onClose) {
        onClose();
      }
    }, 300); // Match this with your CSS transition duration
    
    // Re-enable body scrolling
    if (preventScroll) {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose, preventScroll]);

  // Toggle the modal open/close state
  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Handle click outside the modal
  const handleOverlayClick = useCallback((event) => {
    if (!closeOnOverlayClick) return;
    
    // Don't close if clicking on the trigger element
    if (triggerRef?.current && triggerRef.current.contains(event.target)) {
      return;
    }
    
    close(event);
  }, [close, closeOnOverlayClick, triggerRef]);

  // Handle Escape key press
  const handleKeyDown = useCallback((event) => {
    if (!closeOnEsc || event.key !== 'Escape') return;
    
    event.stopPropagation();
    close();
  }, [close, closeOnEsc]);

  // Set up event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      // Focus trap inside the modal
      const handleFocusTrap = (event) => {
        if (!modalRef.current || !isOpen) return;
        
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // If tabbing forward from last element, go to first
        if (event.key === 'Tab' && !event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        } 
        // If shift+tabbing from first element, go to last
        else if (event.key === 'Tab' && event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      };
      
      document.addEventListener('keydown', handleFocusTrap);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keydown', handleFocusTrap);
      };
    }
  }, [handleKeyDown, isOpen]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
      
      // Make sure to re-enable body scrolling when component unmounts
      if (preventScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [preventScroll]);

  // Get props for the modal overlay
  const getOverlayProps = useCallback((props = {}) => ({
    ...props,
    onClick: (e) => {
      handleOverlayClick(e);
      if (props.onClick) props.onClick(e);
    },
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1300, // Higher than most other elements
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 300ms ease-in-out',
      ...props.style,
    },
  }), [handleOverlayClick, isVisible]);

  // Get props for the modal content
  const getContentProps = useCallback((props = {}) => ({
    ...props,
    ref: (node) => {
      modalRef.current = node;
      if (props.ref) {
        if (typeof props.ref === 'function') {
          props.ref(node);
        } else {
          props.ref.current = node;
        }
      }
    },
    role: 'dialog',
    'aria-modal': true,
    tabIndex: -1,
    onClick: (e) => e.stopPropagation(),
    style: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      maxWidth: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
      transform: isVisible ? 'scale(1)' : 'scale(0.95)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 300ms ease-in-out',
      ...props.style,
    },
  }), [isVisible]);

  // Get props for the close button
  const getCloseButtonProps = useCallback((props = {}) => ({
    ...props,
    onClick: (e) => {
      close(e);
      if (props.onClick) props.onClick(e);
    },
    'aria-label': props['aria-label'] || 'Close',
  }), [close]);

  return {
    // State
    isOpen,
    isVisible,
    isMounted,
    
    // Methods
    open,
    close,
    toggle,
    
    // Props getters
    getOverlayProps,
    getContentProps,
    getCloseButtonProps,
    
    // Refs
    modalRef,
  };
};

export default useModal;
