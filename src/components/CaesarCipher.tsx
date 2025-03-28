import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import './CaesarCipher.css';

type CipherType = 'caesar' | 'atbash';

interface Message {
  id: number;
  text: string;
  shift: number;
  cipherType?: CipherType;
}

const SAMPLE_MESSAGES: Message[] = [
  { id: 1, text: "HELLO WORLD", shift: 3, cipherType: 'caesar' },
  { id: 2, text: "THIS IS A SECRET MESSAGE", shift: 5, cipherType: 'caesar' },
  { id: 3, text: "CAESAR CIPHER GAME", shift: 7, cipherType: 'caesar' },
  { id: 4, text: "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG", shift: 4, cipherType: 'caesar' },
  { id: 5, text: "TO BE OR NOT TO BE THAT IS THE QUESTION", shift: 6, cipherType: 'caesar' },
  { id: 6, text: "AN APPLE A DAY KEEPS THE DOCTOR AWAY", shift: 8, cipherType: 'caesar' },
  { id: 7, text: "LOOK AT THE STARS AND DREAM OF TOMORROW", shift: 2, cipherType: 'caesar' },
  { id: 8, text: "DO OR DO NOT THERE IS NO TRY", shift: 9, cipherType: 'caesar' },
  { id: 9, text: "A JOURNEY OF A THOUSAND MILES BEGINS WITH A SINGLE STEP", shift: 3, cipherType: 'caesar' },
  { id: 10, text: "ALL THAT GLITTERS IS NOT GOLD", shift: 5, cipherType: 'caesar' },
  { id: 11, text: "THE EARLY BIRD CATCHES THE WORM", shift: 7, cipherType: 'caesar' },
  { id: 12, text: "EVERY CLOUD HAS A SILVER LINING", shift: 4, cipherType: 'caesar' },
  { id: 13, text: "IF AT FIRST YOU DO NOT SUCCEED TRY TRY AGAIN", shift: 6, cipherType: 'caesar' },
  // Adding messages with Atbash cipher
  { id: 14, text: "MIRROR MIRROR ON THE WALL", shift: 0, cipherType: 'atbash' },
  { id: 15, text: "REVERSE THE ALPHABET GAME", shift: 0, cipherType: 'atbash' },
  { id: 16, text: "ATBASH IS AN ANCIENT CIPHER", shift: 0, cipherType: 'atbash' },
  { id: 17, text: "FROM A TO Z AND Z TO A", shift: 0, cipherType: 'atbash' },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function CaesarCipher() {
  const [messages] = useState<Message[]>(SAMPLE_MESSAGES);
  const [currentMessage, setCurrentMessage] = useState<Message>(messages[0]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isDecoded, setIsDecoded] = useState(false);
  const [firstInteraction, setFirstInteraction] = useState(true);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

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

  const encodedMessage = encodeMessage(
    currentMessage.text, 
    currentMessage.shift, 
    currentMessage.cipherType || 'caesar'
  );
  
  const decodedMessage = encodedMessage
    .split('')
    .map(char => mapping[char] || char)
    .join('');

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

  return (
    <div className="caesar-cipher">
      <canvas ref={confettiCanvasRef} className="confetti-canvas"></canvas>
      <h1>Secret Cipher Game</h1>
      
      {isDecoded && (
        <div className="success-message">
          🎉 Congratulations! You've decoded the message! 🎉
        </div>
      )}
      
      <div className="instructions">
        <p>Decode the secret message by mapping each symbol to its original letter.</p>
        <p className="highlight-instruction">👉 First click a letter in the encoded message, then select the letter you think it represents</p>
      </div>
      
      <div className="message-container">
        <h2>Encoded Message:</h2>
        <div className="message encoded">
          {encodedMessage.split('').map((char, index) => (
            <span
              key={index}
              className={`letter ${selectedLetter === char ? 'selected' : ''} ${mapping[char] ? 'mapped' : ''} ${firstInteraction && char !== ' ' ? 'pulse-hint' : ''}`}
              onClick={() => handleLetterSelect(char)}
            >
              {char}
            </span>
          ))}
        </div>

        <h2>Your Decoding:</h2>
        <div className="message decoded">
          {decodedMessage.split('').map((char, index) => (
            <span
              key={index}
              className={`letter ${mapping[encodedMessage[index]] ? 'mapped' : ''}`}
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      <div className="controls">
        <div className="alphabet">
          {ALPHABET.split('').map(letter => (
            <button
              key={letter}
              className={`letter-button ${selectedLetter && mapping[selectedLetter] === letter ? 'selected' : ''} ${selectedLetter ? 'choose-me' : ''}`}
              onClick={() => handleReplacementSelect(letter)}
              disabled={!selectedLetter}
            >
              {letter}
            </button>
          ))}
        </div>

        <button className="new-message" onClick={handleNewMessage}>
          Next Message
        </button>
      </div>
    </div>
  );
} 