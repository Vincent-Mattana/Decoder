import { useState, useRef, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './cipherDecoder.css';
import React from 'react';
import { CipherType } from './types';
import { ALL_MESSAGES } from './CipherMessages.ts';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Symbol sets for encoding
const SYMBOL_SETS = {
  standard: ALPHABET,
  runic: 'ᚠᚡᚢᚣᚤᚥᚦᚧᚨᚩᚪᚫᚬᚭᚮᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻ'
};

// Debug message for secret mode
const DEBUG_MESSAGE = {
  id: 999,
  text: 'I AM',
  shift: 1,
  cipherType: 'caesar' as CipherType
};

// Function to shuffle an array (for randomizing messages)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Title animation component
const AnimatedTitle = ({ onDoubleClick, stopAnimation }: { onDoubleClick: () => void, stopAnimation: boolean }) => {
  const [letters, setLetters] = useState<Array<{char: string, isRunic: boolean}>>(() => {
    const word = "Decoder";
    // Start with all characters as runes
    return word.split('').map(char => ({
      char,
      isRunic: true
    }));
  });
  
  // Track which letters have been "decoded"
  const [decodedIndices, setDecodedIndices] = useState<Set<number>>(new Set());
  // Track if the title is fully decoded
  const [isFullyDecoded, setIsFullyDecoded] = useState(false);
  
  useEffect(() => {
    // If stopAnimation is true, decode all the letters and stop the animation
    if (stopAnimation && decodedIndices.size < 7) {
      setLetters(prev => 
        prev.map(letter => ({
          ...letter,
          isRunic: false
        }))
      );
      setDecodedIndices(new Set([0, 1, 2, 3, 4, 5, 6]));
      setIsFullyDecoded(true);
      return;
    }
    
    // Don't start a new interval if we're supposed to stop the animation
    if (stopAnimation || isFullyDecoded) {
      return;
    }
    
    // Slower animation interval (1800ms instead of 800ms)
    const interval = setInterval(() => {
      if (decodedIndices.size >= 7) {
        // All letters decoded, don't reset anymore (stop the cycle)
        setIsFullyDecoded(true);
        return;
      }
      
      // Find indices that haven't been decoded yet
      const availableIndices = Array.from({ length: 7 }, (_, i) => i)
        .filter(idx => !decodedIndices.has(idx));
      
      if (availableIndices.length > 0) {
        // Pick a random index from available indices
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        const selectedChar = letters[randomIndex].char.toLowerCase();
        
        // Create a set to hold indices to update
        const indicesToUpdate = new Set<number>([randomIndex]);
        
        // Find all instances of the selected character and reveal them together
        letters.forEach((letter, idx) => {
          if (letter.char.toLowerCase() === selectedChar && !decodedIndices.has(idx)) {
            indicesToUpdate.add(idx);
          }
        });
        
        // Update the letters
        setLetters(prev => {
          const updated = [...prev];
          Array.from(indicesToUpdate).forEach(idx => {
            updated[idx] = {
              ...updated[idx],
              isRunic: false
            };
          });
          return updated;
        });
        
        // Add all updated indices to the decoded set
        setDecodedIndices(prev => {
          const newSet = new Set(prev);
          Array.from(indicesToUpdate).forEach(idx => newSet.add(idx));
          return newSet;
        });
      }
    }, 1800);
    
    return () => clearInterval(interval);
  }, [decodedIndices, letters, stopAnimation, isFullyDecoded]);
  
  return (
    <h1 className="animated-title" onDoubleClick={onDoubleClick}>
      {letters.map((letter, index) => (
        <span key={index} className={`title-letter ${letter.isRunic ? 'runic' : 'standard'}`}>
          {letter.isRunic 
            ? SYMBOL_SETS.runic[ALPHABET.indexOf(letter.char.toUpperCase())] || letter.char 
            : letter.char}
        </span>
      ))}
    </h1>
  );
};

export function CipherDecoder() {
  const [messages] = useState<typeof ALL_MESSAGES>(() => shuffleArray(ALL_MESSAGES));
  const [currentMessage, setCurrentMessage] = useState<typeof ALL_MESSAGES[0]>(() => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  });
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isDecoded, setIsDecoded] = useState(false);
  const [firstInteraction, setFirstInteraction] = useState(true);
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeInputValue, setCodeInputValue] = useState('');
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [showSecretUncovered, setShowSecretUncovered] = useState(false);

  // Apply dark mode to body and html
  useEffect(() => {
    document.body.classList.add('dark-mode');
    document.documentElement.classList.add('dark-mode');
    
    return () => {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
    };
  }, []);

  // Calculate used letters for the alphabet selection
  const usedLetters = useMemo(() => Object.values(mapping), [mapping]);

  // Encode message based on cipher type
  const encodeMessage = (text: string, shift: number, type: CipherType = 'caesar'): string => {
    // Always use runic symbols for encoding
    const symbolAlphabet = SYMBOL_SETS.runic;
    
    if (type === 'atbash') {
      return text
        .split('')
        .map(char => {
          if (char === ' ') return ' ';
          const index = ALPHABET.indexOf(char);
          if (index === -1) return char;
          return symbolAlphabet[25 - index] || SYMBOL_SETS.standard[25 - index];
        })
        .join('');
    }
    
    return text
      .split('')
      .map(char => {
        if (char === ' ') return ' ';
        const index = ALPHABET.indexOf(char);
        if (index === -1) return char;
        return symbolAlphabet[(index + shift) % 26] || SYMBOL_SETS.standard[(index + shift) % 26];
      })
      .join('');
  };

  const handleLetterSelect = (letter: string) => {
    if (letter === ' ') return;
    
    // If the same letter is clicked again, deselect it
    if (selectedLetter === letter) {
      setSelectedLetter(null);
      return;
    }
    
    // If this letter is already mapped, clear the mapping when clicked
    if (mapping[letter]) {
      // Create new mapping object without this letter
      const newMapping = { ...mapping };
      delete newMapping[letter];
      setMapping(newMapping);
      
      // Check if decoding state has changed
      if (isDecoded) {
        setIsDecoded(false);
      }
      return;
    }
    
    // Otherwise select the new letter
    setSelectedLetter(letter);
    if (firstInteraction) {
      setFirstInteraction(false);
    }
  };

  const handleLetterHover = (letter: string | null) => {
    setHoveredLetter(letter);
  };

  const handleReplacementSelect = (letter: string) => {
    // Safety check - ensure a rune is selected before allowing replacement
    if (!selectedLetter) return;
    
    const newMapping = { ...mapping, [selectedLetter]: letter };
    setMapping(newMapping);
    setSelectedLetter(null);
    
    setTimeout(() => checkIfDecoded(newMapping), 100);
  };

  const handleNewMessage = () => {
    if (isDebugMode) {
      // Exit debug mode when clicking Next Message
      setIsDebugMode(false);
    }
    
    // Clear any selected letter to prevent issues when switching messages
    setSelectedLetter(null);
    
    const nextIndex = (messages.findIndex(m => m.id === currentMessage.id) + 1) % messages.length;
    setCurrentMessage(messages[nextIndex]);
    setMapping({});
    setIsDecoded(false);
    setShowCodeInput(false);
    setCodeInputValue('');
  };

  const handleLoadMessageByCode = () => {
    const foundMessage = messages.find(m => m.code?.toUpperCase() === codeInputValue.toUpperCase());
    if (foundMessage) {
      setCurrentMessage(foundMessage);
      setMapping({});
      setIsDecoded(false);
      setSelectedLetter(null);
      setShowCodeInput(false);
      setCodeInputValue('');
    } else {
      alert('Invalid code. Please try again.');
    }
  };

  const toggleCodeInput = () => {
    setShowCodeInput(!showCodeInput);
    if (!showCodeInput) {
      setCodeInputValue('');
    }
  };

  const handleResetMapping = () => {
    // Clear any selected letter when resetting
    setSelectedLetter(null);
    setMapping({});
    setIsDecoded(false);
  };
  
  // Handle debug mode activation
  const handleTitleDoubleClick = () => {
    // Toggle debug mode and set debug message
    setIsDebugMode(prev => {
      if (!prev) {
        // When enabling, set the debug message and clear any selection
        setSelectedLetter(null);
        setCurrentMessage(DEBUG_MESSAGE);
        setMapping({});
        setIsDecoded(false);
      }
      return !prev;
    });
  };
  
  const encodedMessage = encodeMessage(
    currentMessage.text, 
    currentMessage.shift, 
    currentMessage.cipherType || 'caesar'
  );
  
  const checkIfDecoded = (newMapping: Record<string, string>) => {
    const uniqueCharsInMessage = Array.from(new Set(encodedMessage.replace(/ /g, '').split('')));
    const allCharsMapped = uniqueCharsInMessage.every(char => newMapping[char]);
    
    const originalWithoutSpaces = currentMessage.text.replace(/ /g, '');
    const decodedWithNewMapping = encodedMessage
      .split('')
      .map(char => char === ' ' ? ' ' : newMapping[char] || char)
      .join('')
      .replace(/ /g, '');
    
    const correctlyDecoded = allCharsMapped && decodedWithNewMapping === originalWithoutSpaces;
    
    if (correctlyDecoded && !isDecoded) {
      setIsDecoded(true);
      triggerConfetti();
      // Use the new notification instead of the green pop-up
      triggerSecretUncoveredNotification();
    }
  };

  // Calculate the progress of decoding to determine color tint
  const getDecodeProgress = () => {
    const uniqueCharsInMessage = Array.from(new Set(encodedMessage.replace(/ /g, '').split('')));
    const mappedChars = uniqueCharsInMessage.filter(char => mapping[char]);
    return mappedChars.length / uniqueCharsInMessage.length;
  };

  // Calculate the color based on decode progress (blue to reddish-purple)
  const getSelectionColor = () => {
    const progress = getDecodeProgress();
    
    // Blue RGB: 66, 153, 225 (start)
    // Reddish-Purple RGB: 187, 85, 219 (end) - more red than the previous purple
    
    const r = Math.round(66 + progress * (187 - 66));
    const g = Math.round(153 + progress * (85 - 153));
    const b = Math.round(225 + progress * (219 - 225));
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Generate CSS variables for dynamic colors
  const colorStyle = {
    '--selection-color': getSelectionColor(), // Purple-tinted selection color
    '--selection-glow': `0 0 8px ${getSelectionColor()}80`, // Purple-tinted glow with 50% opacity
    '--mapped-color': '#63b3ed', // Fixed sky blue for mapped letters
    '--mapped-glow': '0 0 8px rgba(99, 179, 237, 0.6)' // Fixed sky blue glow for mapped letters
  } as React.CSSProperties;

  const triggerConfetti = () => {
    if (confettiCanvasRef.current) {
      const myConfetti = confetti.create(confettiCanvasRef.current, {
        resize: true,
        useWorker: true
      });
      
      const end = Date.now() + 2000;
      const colors = ['#1a365d', '#2c5282', '#2b6cb0', '#90cdf4', '#48bb78', '#9ae6b4'];
      
      (function frame() {
        myConfetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        
        myConfetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
      
      setTimeout(() => {
        myConfetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: colors
        });
      }, 1500);
    }
  };

  const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and store
    setCodeInputValue(e.target.value.toUpperCase());
  };

  const handleCodeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If Enter key is pressed and the code input is valid, load the message
    if (e.key === 'Enter' && codeInputValue.length === 4) {
      handleLoadMessageByCode();
    }
  };

  const toggleCodeVisibility = () => {
    setIsCodeVisible(!isCodeVisible);
    
    // If code is being shown, set a timer to hide it after 3 seconds
    if (!isCodeVisible) {
      setTimeout(() => {
        setIsCodeVisible(false);
      }, 3000);
    }
  };

  // Function to trigger the "SECRET UNCOVERED" notification
  const triggerSecretUncoveredNotification = () => {
    setShowSecretUncovered(true);
    
    // Hide notification after 4 seconds
    setTimeout(() => {
      setShowSecretUncovered(false);
    }, 4000);
  };

  return (
    <>
      {isDebugMode && (
        <div className="debug-mode-indicator">DEBUG MODE</div>
      )}
      
      {/* Show the SECRET UNCOVERED notification with overlay */}
      {showSecretUncovered && (
        <div className={`secret-uncovered-notification ${showSecretUncovered ? 'show' : ''}`}>
          {!isDebugMode && (
            <>
              <div className="secret-uncovered-title">Secret Mode Activated!</div>
              <div className="secret-uncovered-overlay"></div>
            </>
          )}
        </div>
      )}
    
      <div className="app-container">
        <div className="cipher-decoder dark-mode" style={colorStyle}>
          {/* Confetti canvas reference for celebrations */}
          <canvas ref={confettiCanvasRef} className="confetti-canvas"></canvas>
          
          {/* Hidden success message for screen readers */}
          <div className="success-message" aria-live="polite">
            {isDecoded ? "You've successfully decoded the message!" : ""}
          </div>
          
          {/* Title Section - Now in a fixed container with action buttons */}
          <div className="title-container">
            <div className="action-buttons top-buttons left-side">
              <button className="action-button next" onClick={handleNewMessage}>
                Next Message
              </button>
            </div>
            
            <AnimatedTitle 
              onDoubleClick={handleTitleDoubleClick}
              stopAnimation={isDebugMode || isDecoded}
            />
            
            <div className="action-buttons top-buttons right-side">
              <button className="action-button reset" onClick={handleResetMapping}>
                Reset
              </button>
              <button className="action-button code" onClick={toggleCodeInput}>
                Enter Code
              </button>
              
              {/* Code input container positioned beneath the buttons */}
              {showCodeInput && (
                <div className="code-input-container">
                  <input 
                    type="text" 
                    placeholder="Enter code" 
                    className="code-input"
                    value={codeInputValue}
                    onChange={handleCodeInputChange}
                    onKeyDown={handleCodeInputKeyDown}
                    maxLength={4}
                    autoFocus
                  />
                  <button 
                    className="action-button load" 
                    onClick={handleLoadMessageByCode}
                    disabled={codeInputValue.length < 4}
                  >
                    Load
                  </button>
                  <button className="action-button cancel" onClick={toggleCodeInput}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="main-content">
            <div className="message-container">
              <h2>Secret Message:</h2>
              <div className={`message encoded ${isDecoded ? 'message-solved' : ''}`} data-symbol-set="runic">
                {/* Show SOLVED stamp when message is decoded */}
                {isDecoded && !showSecretUncovered && (
                  <div className="solved-stamp">SOLVED</div>
                )}
                {encodedMessage.split(' ').map((word, wordIndex) => (
                  <React.Fragment key={`word-${wordIndex}`}>
                    <div className="message-word">
                      {word.split('').map((char, charIndex) => (
                        <span
                          key={`${wordIndex}-${charIndex}`}
                          className={`letter 
                            ${selectedLetter === char ? 'selected' : ''} 
                            ${mapping[char] ? 'mapped' : ''} 
                            ${(hoveredLetter === char || selectedLetter === char) ? 'highlight' : ''}
                            ${firstInteraction && char !== ' ' ? 'pulse-hint' : ''}`}
                          onClick={() => handleLetterSelect(char)}
                          onMouseEnter={() => handleLetterHover(char)}
                          onMouseLeave={() => handleLetterHover(null)}
                        >
                          {mapping[char] ? mapping[char] : char}
                        </span>
                      ))}
                    </div>
                    {wordIndex < encodedMessage.split(' ').length - 1 && (
                      <span className="space-character">&nbsp;</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              {currentMessage.code && (
                <div className="message-code">
                  Message Code: 
                  <div className="code-container">
                    <div className="code-reveal-icon" onClick={toggleCodeVisibility}>
                      {isCodeVisible ? "✓" : "👁️"}
                    </div>
                    <span className={`code-display ${isCodeVisible ? 'visible' : ''}`}>
                      {currentMessage.code}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Controls Section - Now only for the alphabet */}
          <div className="controls">
            <div className="alphabet">
              {ALPHABET.split('').map(letter => {
                const isUsed = usedLetters.includes(letter);
                return (
                  <button
                    key={letter}
                    className={`letter-button 
                      ${selectedLetter && mapping[selectedLetter] === letter ? 'selected' : ''} 
                      ${selectedLetter ? 'choose-me' : ''} 
                      ${isUsed ? 'used' : ''}`}
                    onClick={() => {
                      // Only process click if a rune is selected and the letter isn't already used
                      if (selectedLetter && !isUsed) {
                        handleReplacementSelect(letter);
                      }
                    }}
                    // Visual disabled state, but keep onClick handler for safety
                    disabled={!selectedLetter || isUsed}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
} 