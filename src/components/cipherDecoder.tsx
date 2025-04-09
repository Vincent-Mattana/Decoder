import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import './cipherDecoder.css';
import React from 'react';
import { CipherType } from './types';
import { ALL_MESSAGES } from './CipherMessages.ts';

// --- Constants and Utility Functions ---

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Symbol sets for encoding
const SYMBOL_SETS = {
  standard: ALPHABET,
  runic: 'ᚠᚡᚢᚣᚤᚥᚦᚧᚨᚩᚪᚫᚬᚭᚮᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻ'
};

// Encode message function (Defined outside component for stability)
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
    
    // Default to Caesar cipher
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

// Function to determine the correct mapping for a message
const getCorrectMapping = (message: typeof ALL_MESSAGES[0]): Record<string, string> => {
  const correctMap: Record<string, string> = {};
  const text = message.text;
  const shift = message.shift;
  const type = message.cipherType || 'caesar';
  const symbolAlphabet = SYMBOL_SETS.runic;

  for (let i = 0; i < text.length; i++) {
    const plainChar = text[i];
    if (plainChar === ' ') continue; // Skip spaces

    const index = ALPHABET.indexOf(plainChar);
    if (index === -1) continue; // Skip non-alphabetic characters

    let encodedChar: string;
    if (type === 'atbash') {
      encodedChar = symbolAlphabet[25 - index] || SYMBOL_SETS.standard[25 - index];
    } else { // Caesar
      encodedChar = symbolAlphabet[(index + shift) % 26] || SYMBOL_SETS.standard[(index + shift) % 26];
    }

    // Add mapping if not already present (ensures unique symbols)
    if (!(encodedChar in correctMap)) {
      correctMap[encodedChar] = plainChar;
    }
  }
  return correctMap;
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
  // --- State Declarations ---
  const [messages] = useState<typeof ALL_MESSAGES>(() => shuffleArray(ALL_MESSAGES));
  const [currentMessage, setCurrentMessage] = useState<typeof ALL_MESSAGES[0]>(() => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  });
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [hintedSymbols, setHintedSymbols] = useState<Record<string, string>>({});
  const [isDecoded, setIsDecoded] = useState(false);
  const [firstInteraction, setFirstInteraction] = useState(true);
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const [codeInputValue, setCodeInputValue] = useState('');
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [showSecretUncovered, setShowSecretUncovered] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // --- Memoized Values & Callbacks (Define BEFORE effects that use them) ---

  // Calculate used letters for the alphabet selection
  const usedLetters = useMemo(() => Object.values(mapping), [mapping]);

  // Memoize encoded message
  const encodedMessage = useMemo(() => encodeMessage(
    currentMessage.text,
    currentMessage.shift,
    currentMessage.cipherType || 'caesar'
  ), [currentMessage]); // encodeMessage is stable (defined outside)

  // Memoize confetti trigger
  const triggerConfetti = useCallback(() => {
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
  }, []); // confettiCanvasRef is stable

  // Memoize notification trigger
  const triggerSecretUncoveredNotification = useCallback(() => {
    setShowSecretUncovered(true);
    setTimeout(() => {
      setShowSecretUncovered(false);
      triggerConfetti(); // Trigger confetti after notification hides
    }, 4000);
  }, [triggerConfetti]); // Added triggerConfetti dependency

  // Memoize decoding check function
  const checkIfDecoded = useCallback((newMapping: Record<string, string>) => {
    const uniqueCharsInMessage = Array.from(new Set(encodedMessage.replace(/ /g, '').split('')));
    // Avoid division by zero if message is empty or only spaces
    if (uniqueCharsInMessage.length === 0) return; 
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
      // triggerConfetti(); // Removed: Confetti now triggered after notification
      triggerSecretUncoveredNotification();
    }
    // Removed triggerConfetti from dependencies
  }, [encodedMessage, currentMessage.text, isDecoded, triggerSecretUncoveredNotification, setIsDecoded]); 

  // Memoize replacement handler
  const handleReplacementSelect = useCallback((letter: string) => {
    // Check if letter is already used before proceeding
    if (!selectedLetter || usedLetters.includes(letter)) return;

    const newMapping = { ...mapping, [selectedLetter]: letter };
    setMapping(newMapping);
    setSelectedLetter(null);

    // Use timeout to ensure state update before check
    setTimeout(() => checkIfDecoded(newMapping), 100);
  }, [selectedLetter, mapping, checkIfDecoded, usedLetters, setMapping, setSelectedLetter]); // Added stable dependencies


  // --- Effects ---

  // Apply dark mode to body and html
  useEffect(() => {
    document.body.classList.add('dark-mode');
    document.documentElement.classList.add('dark-mode');
    
    return () => {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
    };
  }, []);

  // Handle keyboard input for letter replacement (Refactored: No longer depends on handleReplacementSelect directly)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only proceed if a rune is selected and the event target isn't an input field
      if (selectedLetter && document.activeElement?.tagName !== 'INPUT') {
        const key = event.key.toUpperCase();
        // Check if the pressed key is a letter in the alphabet AND not already used
        if (ALPHABET.includes(key) && !usedLetters.includes(key)) {
           // Perform the replacement logic directly
           const newMapping = { ...mapping, [selectedLetter]: key };
           setMapping(newMapping);
           setSelectedLetter(null); // Deselect rune
           // Use timeout to ensure state update before check
           setTimeout(() => checkIfDecoded(newMapping), 100);
        }
      }
    };

    // Add event listener only when a letter is selected
    if (selectedLetter) {
      window.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // Dependencies now include state/setters/callbacks used directly inside handleKeyDown
  }, [selectedLetter, mapping, usedLetters, setMapping, setSelectedLetter, checkIfDecoded]);
  

  // --- Other Handlers ---
  
  // (Keep encodeMessage outside if it's pure, or define it here if needed)
  // const encodeMessage = ...

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

      // Also remove from hinted symbols if it was a hint
      if (hintedSymbols[letter]) {
        setHintedSymbols(prev => {
          const newHints = { ...prev };
          delete newHints[letter];
          return newHints;
        });
      }
      
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

  // (No changes needed for handleReplacementSelect as it's defined above)

  const handleNewMessage = () => {
    if (isDebugMode) {
      // Exit debug mode when clicking Next Message
      setIsDebugMode(false);
    }
    
    // Clear any selected letter to prevent issues when switching messages
    setSelectedLetter(null);
    
    const newMessageIndex = (messages.findIndex(msg => msg.id === currentMessage.id) + 1) % messages.length;
    setCurrentMessage(messages[newMessageIndex]);
    setMapping({});
    setHintedSymbols({}); // Clear hinted symbols record
    setIsDecoded(false);
    setCodeInputValue('');
  };

  const handleLoadMessageByCode = () => {
    const code = codeInputValue.trim().toUpperCase();
    setCodeInputValue(''); // Clear input immediately

    if (code === 'HELP') {
      const correctMapping = getCorrectMapping(currentMessage);
      const uniqueEncodedChars = Array.from(new Set(encodedMessage.replace(/ /g, '').split('')));

      // Find symbols that are in the correct mapping but not yet correctly mapped by the user
      const unmappedSymbols = uniqueEncodedChars.filter(symbol => 
        correctMapping[symbol] !== undefined &&
        mapping[symbol] !== correctMapping[symbol]
      );

      // If only one symbol remains unmapped, shake the input instead of revealing
      if (unmappedSymbols.length === 1) {
        if (codeInputRef.current) {
          codeInputRef.current.classList.add('shake');
          setTimeout(() => {
            codeInputRef.current?.classList.remove('shake');
          }, 500); // Match animation duration
        }
        console.log("Only one letter left! Try to solve it yourself.");
        setIsCodeVisible(false); // Still close the modal
        return; // Stop execution, don't reveal the last letter
      }
      
      if (unmappedSymbols.length > 0) {
        // Pick a random unmapped symbol
        const randomIndex = Math.floor(Math.random() * unmappedSymbols.length);
        const hintSymbol = unmappedSymbols[randomIndex];
        const hintLetter = correctMapping[hintSymbol];

        // Update the mapping state with the hint
        setMapping(prev => ({ ...prev, [hintSymbol]: hintLetter }));
        // Add the symbol-letter pair to the hinted record
        setHintedSymbols(prev => ({ ...prev, [hintSymbol]: hintLetter }));

        // Optional: Provide feedback (e.g., console log or UI element)
        console.log(`Hint revealed: ${hintSymbol} -> ${hintLetter}`);
        
        // Close the code input modal after revealing the hint
        setIsCodeVisible(false); 
        
      } else {
        // Optional: Handle case where all letters are already mapped (correctly or incorrectly)
        console.log("No more hints available or message already solved/mapped.");
        // Shake if no hints available?
        if (codeInputRef.current) {
          codeInputRef.current.classList.add('shake');
          setTimeout(() => {
            codeInputRef.current?.classList.remove('shake');
          }, 500);
        }
        setIsCodeVisible(false); // Still close the modal
      }
      return; // Stop execution for HELP code
    }

    const foundMessage = messages.find(m => m.code === code);
    if (foundMessage) {
      setCurrentMessage(foundMessage);
      setMapping({});
      setHintedSymbols({}); // Clear hinted symbols record
      setIsDecoded(false);
      setSelectedLetter(null);
      setCodeInputValue('');
    } else {
      // Shake the input if the code is invalid
      if (codeInputRef.current) {
        codeInputRef.current.classList.add('shake');
        setTimeout(() => {
          codeInputRef.current?.classList.remove('shake');
        }, 500); // Match animation duration
      }
      console.log("Invalid message code entered."); // Optional feedback
    }
  };

  const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and store
    setCodeInputValue(e.target.value.toUpperCase());
  };

  const handleCodeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If Enter key is pressed, load the message (validation happens in handleLoadMessageByCode)
    if (e.key === 'Enter') {
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

  const handleResetMapping = () => {
    // Clear any selected letter when resetting
    setSelectedLetter(null);
    setMapping({});
    setHintedSymbols({}); // Clear hinted symbols record
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
  
  // (checkIfDecoded is defined above)

  // Calculate the progress of decoding to determine color tint
  const getDecodeProgress = () => {
    const uniqueCharsInMessage = Array.from(new Set(encodedMessage.replace(/ /g, '').split('')));
    // Ensure uniqueCharsInMessage is not empty to avoid division by zero
    if (uniqueCharsInMessage.length === 0) return 0;
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

  // --- Render ---
  return (
    <>
      {isDebugMode && (
        <div className="debug-mode-indicator">DEBUG MODE</div>
      )}
      
      {/* Show the SECRET UNCOVERED notification with overlay */}
      {showSecretUncovered && (
        <div className={`secret-uncovered-notification ${showSecretUncovered ? 'show' : ''}`}>
          <div className="secret-uncovered-overlay"></div>
          <div className="secret-uncovered-text">SECRET UNCOVERED</div>
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
          
          {/* Title Section - Now in a fixed container without duplicate buttons */}
          <div className="title-container">
            <AnimatedTitle 
              onDoubleClick={handleTitleDoubleClick}
              stopAnimation={isDebugMode || isDecoded}
            />
          </div>
          
          <div className="main-content">
            <div className="message-container">
              <h2>
                Secret Message:
                {currentMessage.code && (
                  <span className="message-code">
                    <div className="code-container">
                      <div className="code-reveal-icon" onClick={toggleCodeVisibility}>
                        {isCodeVisible ? "✓" : "👁️"}
                      </div>
                      <span className={`code-display ${isCodeVisible ? 'visible' : ''}`}>
                        {currentMessage.code}
                      </span>
                    </div>
                  </span>
                )}
              </h2>
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
                            ${mapping[char] && hintedSymbols[char] === mapping[char] ? 'hinted' : ''}
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
            </div>
          </div>
          
          {/* Keyboard Section - With integrated control buttons */}
          <div className="keyboard">
            <div className="keyboard-content">
              <div className="keyboard-buttons left-side">
                <input 
                  ref={codeInputRef}
                  type="text" 
                  placeholder="Enter code..." 
                  className="code-input permanent"
                  value={codeInputValue}
                  onChange={handleCodeInputChange}
                  onKeyDown={handleCodeInputKeyDown}
                  maxLength={4}
                />
                <button className="action-button reset" onClick={handleResetMapping}>
                  Reset
                </button>
              </div>
              
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
                        // Check moved to handleReplacementSelect, just call it if rune selected
                        if (selectedLetter) {
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

              <div className="keyboard-buttons right-side">
                <button className="action-button" onClick={handleNewMessage}>
                  Next Message
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
} 