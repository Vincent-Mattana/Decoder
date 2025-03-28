import { useState, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import './CaesarCipher.css';
import React from 'react';
import { CipherType } from './types';
import { ALL_MESSAGES } from './CipherMessages.ts';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Symbol sets for encoding
const SYMBOL_SETS = {
  standard: ALPHABET,
  hieroglyphs: '𓀀𓀁𓀂𓀃𓀄𓀅𓀆𓀇𓀈𓀉𓀊𓀋𓀌𓀍𓀎𓀏𓀐𓀑𓀒𓀓𓀔𓀕𓀖𓀗𓀘𓀙𓀚',
  geometric: '◉◎●⊙○◌◍◐◑◒◓◔◕◖◗◘◙◚◛◜◝◞◟◠◡◢◣◤◥',
  runic: 'ᚠᚡᚢᚣᚤᚥᚦᚧᚨᚩᚪᚫᚬᚭᚮᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻ',
  alchemical: '🜀🜁🜂🜃🜄🜅🜆🜇🜈🜉🜊🜋🜌🜍🜎🜏🜐🜑🜒🜓🜔🜕🜖🜗🜘🜙'
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

export function CaesarCipher() {
  // Shuffle messages and store in state
  const [messages] = useState<typeof ALL_MESSAGES>(() => shuffleArray(ALL_MESSAGES));
  // Start with a random message
  const [currentMessage, setCurrentMessage] = useState<typeof ALL_MESSAGES[0]>(() => {
    // Pick a random index from the shuffled messages
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  });
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isDecoded, setIsDecoded] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [firstInteraction, setFirstInteraction] = useState(true);
  const [symbolSet, setSymbolSet] = useState<keyof typeof SYMBOL_SETS>('hieroglyphs');
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  // Compute which letters are already used in the mapping
  const usedLetters = useMemo(() => {
    return Object.values(mapping);
  }, [mapping]);

  const getAtbashChar = (char: string): string => {
    if (char === ' ') return ' ';
    const index = ALPHABET.indexOf(char);
    if (index === -1) return char;
    
    // Get the corresponding symbol from the selected set
    const symbolAlphabet = SYMBOL_SETS[symbolSet];
    return symbolAlphabet[25 - index] || SYMBOL_SETS.standard[25 - index];
  };

  const encodeWithCaesar = (text: string, shift: number): string => {
    const symbolAlphabet = SYMBOL_SETS[symbolSet];
    
    return text
      .split('')
      .map(char => {
        if (char === ' ') return ' ';
        const index = ALPHABET.indexOf(char);
        if (index === -1) return char;
        
        // Use the symbol alphabet for encoding
        return symbolAlphabet[(index + shift) % 26] || SYMBOL_SETS.standard[(index + shift) % 26];
      })
      .join('');
  };

  const encodeWithAtbash = (text: string): string => {
    return text
      .split('')
      .map(char => getAtbashChar(char))
      .join('');
  };

  const encodeMessage = (text: string, shift: number, type: CipherType = 'caesar'): string => {
    if (type === 'atbash') {
      return encodeWithAtbash(text);
    }
    return encodeWithCaesar(text, shift);
  };

  const handleLetterSelect = (letter: string) => {
    if (letter === ' ') return;
    setSelectedLetter(letter);
    if (firstInteraction) {
      setFirstInteraction(false);
    }
  };

  const handleReplacementSelect = (letter: string) => {
    if (!selectedLetter) return;
    
    const newMapping = { ...mapping, [selectedLetter]: letter };
    setMapping(newMapping);
    setSelectedLetter(null);
    
    // Check if message is fully decoded
    setTimeout(() => {
      checkIfDecoded(newMapping);
    }, 100);
  };

  const handleNewMessage = () => {
    const nextIndex = (messages.findIndex(m => m.id === currentMessage.id) + 1) % messages.length;
    setCurrentMessage(messages[nextIndex]);
    setMapping({});
    setIsDecoded(false);
    
    // Randomly change the symbol set for variety
    const symbolSets = Object.keys(SYMBOL_SETS) as Array<keyof typeof SYMBOL_SETS>;
    const randomSet = symbolSets[Math.floor(Math.random() * symbolSets.length)];
    setSymbolSet(randomSet);
  };

  const handleResetMapping = () => {
    setMapping({});
    setIsDecoded(false);
  };
  
  const handleChangeSymbolSet = (set: keyof typeof SYMBOL_SETS) => {
    setSymbolSet(set);
    setMapping({});
  };

  const encodedMessage = encodeMessage(
    currentMessage.text, 
    currentMessage.shift, 
    currentMessage.cipherType || 'caesar'
  );
  
  // Function to check if message is fully decoded
  const checkIfDecoded = (newMapping: Record<string, string>) => {
    const uniqueCharsInMessage = Array.from(new Set(encodedMessage.replace(/ /g, '').split('')));
    const allCharsMapped = uniqueCharsInMessage.every(char => newMapping[char]);
    
    // Calculate if the decoded message matches the original
    const originalWithoutSpaces = currentMessage.text.replace(/ /g, '');
    const decodedWithNewMapping = encodedMessage
      .split('')
      .map(char => char === ' ' ? ' ' : newMapping[char] || char)
      .join('')
      .replace(/ /g, '');
    
    // Check if all characters are mapped and the decoded message is correct
    const correctlyDecoded = allCharsMapped && 
                           decodedWithNewMapping === originalWithoutSpaces;
    
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
      
      // Celebration with multiple confetti bursts
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
      
      // Big finale
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

  const handleDismissInstructions = () => {
    setShowInstructions(false);
  };

  return (
    <div className="caesar-cipher">
      <canvas ref={confettiCanvasRef} className="confetti-canvas"></canvas>
      <h1>Secret Cipher Game</h1>
      
      {isDecoded && (
        <div className="success-message">
          🎉 Congratulations! You've decoded the message! 🎉
        </div>
      )}
      
      {showInstructions && (
        <div className="instructions">
          <button 
            className="dismiss-button" 
            onClick={handleDismissInstructions}
            aria-label="Dismiss instructions"
          >
            ✕
          </button>
          <p>Decode the secret message by mapping each symbol to its original letter.</p>
          <p className="highlight-instruction">👉 First click a letter in the encoded message, then select the letter you think it represents</p>
        </div>
      )}
      
      <div className="message-container">
        <h2>Secret Message:</h2>
        <div className="symbol-selector">
          <span>Symbol Style:</span>
          <select 
            value={symbolSet} 
            onChange={(e) => handleChangeSymbolSet(e.target.value as keyof typeof SYMBOL_SETS)}
          >
            <option value="hieroglyphs">Hieroglyphs</option>
            <option value="geometric">Geometric</option>
            <option value="runic">Runic</option>
            <option value="alchemical">Alchemical</option>
            <option value="standard">Standard (A-Z)</option>
          </select>
        </div>
        <div className="message encoded" data-symbol-set={symbolSet}>
          {encodedMessage.split(' ').map((word, wordIndex) => (
            <React.Fragment key={`word-${wordIndex}`}>
              <div className="message-word">
                {word.split('').map((char, charIndex) => (
                  <span
                    key={`${wordIndex}-${charIndex}`}
                    className={`letter ${selectedLetter === char ? 'selected' : ''} ${mapping[char] ? 'mapped' : ''} ${firstInteraction && char !== ' ' ? 'pulse-hint' : ''}`}
                    onClick={() => handleLetterSelect(char)}
                  >
                    {char}
                    {mapping[char] && (
                      <span className="decoded-overlay">{mapping[char]}</span>
                    )}
                  </span>
                ))}
              </div>
              {/* Add a space after each word except the last one */}
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
                onClick={() => handleReplacementSelect(letter)}
                disabled={!selectedLetter || isUsed}
              >
                {letter}
                {isUsed && <span className="letter-used-indicator">✕</span>}
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
  );
} 