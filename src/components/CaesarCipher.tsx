import { useState, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import './CaesarCipher.css';
import React from 'react';

type CipherType = 'caesar' | 'atbash';

interface Message {
  id: number;
  text: string;
  shift: number;
  cipherType?: CipherType;
}

const SAMPLE_MESSAGES: Message[] = [
  { id: 1, text: "SAY HELLO TO INTERESTING CRYPTOGRAPHY", shift: 3, cipherType: 'caesar' },
  { id: 2, text: "THIS IS A SECRET MESSAGE", shift: 5, cipherType: 'caesar' },
  { id: 3, text: "THE OLD MAN AND THE REMARKABLE SEA", shift: 7, cipherType: 'caesar' },
  { id: 4, text: "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG", shift: 4, cipherType: 'caesar' },
  { id: 5, text: "TO BE OR NOT TO BE THAT IS THE QUESTION", shift: 6, cipherType: 'caesar' },
  { id: 6, text: "AN APPLE A DAY KEEPS DOCTORS AWAY FOREVER", shift: 8, cipherType: 'caesar' },
  { id: 7, text: "LOOK AT THE STARS AND MAGNIFICENT GALAXIES", shift: 2, cipherType: 'caesar' },
  { id: 8, text: "DO OR DO NOT THERE IS NO TRY", shift: 9, cipherType: 'caesar' },
  { id: 9, text: "A JOURNEY OF THOUSAND MILES BEGINS WITH ONE STEP", shift: 3, cipherType: 'caesar' },
  { id: 10, text: "ALL THAT GLITTERS IS NOT GOLDEN TREASURE", shift: 5, cipherType: 'caesar' },
  { id: 11, text: "THE EARLY BIRD CATCHES DELICIOUS WORMS", shift: 7, cipherType: 'caesar' },
  { id: 12, text: "EVERY CLOUD HAS A SILVER LINING", shift: 4, cipherType: 'caesar' },
  { id: 13, text: "IF AT FIRST YOU FAIL TRY AGAIN DIFFERENTLY", shift: 6, cipherType: 'caesar' },
  { id: 14, text: "MIRROR ON THE WALL WHO IS THE FAIREST ONE", shift: 0, cipherType: 'atbash' },
  { id: 15, text: "REVERSE ALPHABET AND UNLOCK HIDDEN SECRETS", shift: 0, cipherType: 'atbash' },
  { id: 16, text: "THE OLD PROFESSOR HAS THE KEY FOR CIPHERS", shift: 0, cipherType: 'atbash' },
  { id: 17, text: "FROM BEGINNING TO END DISCOVER MEANINGS", shift: 0, cipherType: 'atbash' },
  { id: 18, text: "LIFE HAPPENS WHEN YOU MAKE DIFFERENT PLANS", shift: 5, cipherType: 'caesar' },
  { id: 19, text: "THE WAY TO GREATNESS IS LOVING YOUR WORK", shift: 7, cipherType: 'caesar' },
  { id: 20, text: "IN THE END WE REGRET CHANCES NOT TAKEN", shift: 3, cipherType: 'caesar' },
  { id: 21, text: "BE THE CHANGE YOU WISH TO SEE WORLDWIDE", shift: 8, cipherType: 'caesar' },
  { id: 22, text: "YOU MISS SHOTS YOU NEVER ATTEMPT TO TAKE", shift: 4, cipherType: 'caesar' },
  { id: 23, text: "THE KEY UNLOCKS NEW MYSTERIOUS WORLDS", shift: 10, cipherType: 'caesar' },
  { id: 24, text: "USE MAPS TO DISCOVER HIDDEN TREASURES", shift: 12, cipherType: 'caesar' },
  { id: 25, text: "TWO MINDS THINK BETTER THAN ONE ALONE", shift: 6, cipherType: 'caesar' },
  { id: 26, text: "ACTIONS SPEAK LOUDER THAN LENGTHY SPEECHES", shift: 9, cipherType: 'caesar' },
  { id: 27, text: "NEVER POSTPONE WHAT CAN BE ACCOMPLISHED TODAY", shift: 5, cipherType: 'caesar' },
  { id: 28, text: "ANCIENT KNOWLEDGE AND MODERN TECHNOLOGY", shift: 0, cipherType: 'atbash' },
  { id: 29, text: "FLIP SCRIPTS AND DECODE COMPLEX PATTERNS", shift: 0, cipherType: 'atbash' },
  { id: 30, text: "MAGNIFICENT JOURNEYS BEGIN WITH SMALL STEPS", shift: 0, cipherType: 'atbash' },
  { id: 31, text: "THE BEST WAY TO PREDICT THE FUTURE IS TO CREATE IT WITH YOUR OWN HANDS", shift: 7, cipherType: 'caesar' },
  { id: 32, text: "WE MAY ENCOUNTER MANY DEFEATS BUT WE MUST NOT BE DEFEATED BY OUR CIRCUMSTANCES", shift: 4, cipherType: 'caesar' },
  { id: 33, text: "IT IS DURING OUR DARKEST MOMENTS THAT WE MUST FOCUS TO SEE THE LIGHT AHEAD", shift: 9, cipherType: 'caesar' },
  { id: 34, text: "THE ONLY LIMIT TO OUR REALIZATION OF TOMORROW WILL BE OUR DOUBTS OF TODAY", shift: 3, cipherType: 'caesar' },
  { id: 35, text: "TELL ME AND I FORGET TEACH ME AND I REMEMBER INVOLVE ME AND I LEARN", shift: 5, cipherType: 'caesar' },
  { id: 36, text: "EDUCATION IS THE MOST POWERFUL WEAPON WHICH YOU CAN USE TO CHANGE THE WORLD", shift: 8, cipherType: 'caesar' },
  { id: 37, text: "IF OPPORTUNITY DOES NOT KNOCK BUILD A DOOR AND CREATE YOUR OWN PATH FORWARD", shift: 6, cipherType: 'caesar' },
  { id: 38, text: "HUMANS FACE CHALLENGES IN THE DIGITAL AGE BUT WE ADAPT AND GROW STRONGER TOGETHER", shift: 0, cipherType: 'atbash' },
  { id: 39, text: "THE SECRET OF GETTING AHEAD IS GETTING STARTED WITH SMALL CONSISTENT DAILY ACTIONS", shift: 0, cipherType: 'atbash' },
  { id: 40, text: "DO WHAT YOU CAN WITH ALL YOU HAVE WHEREVER YOU ARE AND AMAZING THINGS HAPPEN", shift: 0, cipherType: 'atbash' },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

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
  const [messages] = useState<Message[]>(() => shuffleArray(SAMPLE_MESSAGES));
  // Start with a random message
  const [currentMessage, setCurrentMessage] = useState<Message>(() => {
    // Pick a random index from the shuffled messages
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  });
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isDecoded, setIsDecoded] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [firstInteraction, setFirstInteraction] = useState(true);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  // Compute which letters are already used in the mapping
  const usedLetters = useMemo(() => {
    return Object.values(mapping);
  }, [mapping]);

  const getAtbashChar = (char: string): string => {
    if (char === ' ') return ' ';
    const index = ALPHABET.indexOf(char);
    if (index === -1) return char;
    return ALPHABET[25 - index];
  };

  const encodeWithCaesar = (text: string, shift: number): string => {
    return text
      .split('')
      .map(char => {
        if (char === ' ') return ' ';
        const index = ALPHABET.indexOf(char);
        if (index === -1) return char;
        return ALPHABET[(index + shift) % 26];
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
  };

  const handleResetMapping = () => {
    setMapping({});
    setIsDecoded(false);
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
        <div className="message encoded">
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