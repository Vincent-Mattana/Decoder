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
  id: 'debug',
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
const AnimatedTitle = ({ onDoubleClick }: { onDoubleClick: () => void }) => {
  const [letters, setLetters] = useState<Array<{char: string, isRunic: boolean}>>(() => {
    const word = "Decoder";
    return word.split('').map(char => ({
      char,
      isRunic: Math.random() > 0.5
    }));
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLetters(prev => {
        const updated = [...prev];
        const randomIndex = Math.floor(Math.random() * updated.length);
        updated[randomIndex] = {
          ...updated[randomIndex],
          isRunic: !updated[randomIndex].isRunic
        };
        return updated;
      });
    }, 800);
    
    return () => clearInterval(interval);
  }, []);
  
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
    setSelectedLetter(letter);
    if (firstInteraction) {
      setFirstInteraction(false);
    }
  };

  const handleLetterHover = (letter: string | null) => {
    setHoveredLetter(letter);
  };

  const handleReplacementSelect = (letter: string) => {
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
    
    const nextIndex = (messages.findIndex(m => m.id === currentMessage.id) + 1) % messages.length;
    setCurrentMessage(messages[nextIndex]);
    setMapping({});
    setIsDecoded(false);
  };

  const handleResetMapping = () => {
    setMapping({});
    setIsDecoded(false);
  };
  
  // Handle debug mode activation
  const handleTitleDoubleClick = () => {
    // Toggle debug mode and set debug message
    setIsDebugMode(prev => {
      if (!prev) {
        // When enabling, set the debug message
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
    }
  };

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

  return (
    <>
      <canvas ref={confettiCanvasRef} className="confetti-canvas"></canvas>
      <div className="cipher-decoder dark-mode">
        <AnimatedTitle onDoubleClick={handleTitleDoubleClick} />
        
        {isDebugMode && (
          <div className="debug-mode-indicator">
            DEBUG MODE
          </div>
        )}
        
        {isDecoded && (
          <div className="success-message">
            🎉 Congratulations! You've decoded the message! 🎉
          </div>
        )}
        
        <div className="message-container">
          <h2>Secret Message:</h2>
          <div className="message encoded" data-symbol-set="runic">
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
        </div>

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
                    if (!selectedLetter || isUsed) return;
                    handleReplacementSelect(letter);
                  }}
                  disabled={!selectedLetter || isUsed}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          <div className="action-buttons">
            <button className="action-button reset" onClick={handleResetMapping}>
              Reset
            </button>
            <button className="action-button next" onClick={handleNewMessage}>
              Next Message
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 