# Secret Cipher Decoder - Project Context

## Project Overview

Secret Cipher Decoder is an interactive web application that allows users to decode messages encrypted with various cipher methods. The application presents encrypted messages using runic symbols, and users must decipher them by mapping letters to their original values.

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS
- **Animation**: canvas-confetti for celebration effects
- **Deployment**: GitHub Pages

## Project Structure

```
Secret Cipher Decoder/
├── .github/               # GitHub configuration
├── node_modules/          # Dependencies
├── public/                # Static assets
├── src/                   # Source code
│   ├── assets/            # Images and other assets
│   ├── components/        # React components
│   │   ├── cipherDecoder.tsx     # Main decoder component
│   │   ├── cipherDecoder.css     # Styling for the decoder
│   │   ├── CipherMessages.ts     # Collection of encoded messages
│   │   ├── types.ts              # TypeScript type definitions
│   │   └── ConfettiUtils.ts      # Confetti animation utilities
│   ├── App.tsx            # Root application component
│   ├── App.css            # App styling
│   ├── main.tsx           # Application entry point
│   ├── index.css          # Global styling
│   └── vite-env.d.ts      # Vite type definitions
├── .gitignore             # Git ignore file
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML entry point
├── package.json           # Dependencies and scripts
├── package-lock.json      # Locked dependencies
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json      # TypeScript app configuration
├── tsconfig.node.json     # TypeScript node configuration
└── vite.config.ts         # Vite configuration
```

## Core Features

1. **Message Decoding**: Users can decode encrypted messages by mapping letters from the ciphertext to plaintext.
2. **Multiple Cipher Types**:
   - Caesar cipher (shift cipher)
   - Atbash cipher (reverse alphabet)
3. **Interactive UI**:
   - Runic symbols represent encoded text
   - Interactive letter mapping with visual feedback (mouse clicks and keyboard input)
   - Progress tracking for decoding
4. **Celebration Effects**: Confetti animation when a message is successfully decoded, triggered after the 'SECRET UNCOVERED' notification.
5. **Message Selection**: Users can select from various pre-defined messages or enter a specific message code
6. **Hint System**: Entering "HELP" code reveals one correct letter (styled distinctly in green). Does not reveal the last letter.
7. **Secret Debug Mode**: Hidden feature activated by double-clicking the title
8. **Dark Mode UI**: Modern dark-themed interface

## Data Models

### Message Type

```typescript
export type CipherType = 'caesar' | 'atbash';

export interface Message {
  id: number;
  text: string;
  shift: number;
  cipherType: CipherType;
  code?: string; // Optional unique code for message selection
}
```

## Key Components

### CipherDecoder

The main component that handles the entire cipher decoding experience. It maintains state for:
- Current message
- Letter mapping selections
- Hinted letter tracking
- Decoding progress
- UI interactions

### AnimatedTitle

A sub-component that displays the animated "Decoder" title with runic symbols that transform into Latin letters.

## Cipher Implementation

### Caesar Cipher
Letters are shifted a certain number of positions in the alphabet. For example, with a shift of 3:
- A → D
- B → E
- C → F
- etc.

### Atbash Cipher
Letters are mapped to their reverse in the alphabet:
- A → Z
- B → Y
- C → X
- etc.

## UI Layout

The user interface has been optimized for an intuitive and focused experience:

1. **Top Section**:
   - Title "Decoder" is centered at the top
   - Control buttons are positioned in the corners
   - "Reset" button moved to the bottom section
   - "Enter Code" input field moved to the bottom section
   - "Next Message" button in the top-right corner

2. **Middle Section**:
   - "Secret Message:" title is centered horizontally at the top of the message container
   - Message code display mechanism moved to the bottom section
   - Secret message container is precisely positioned at 45% from the top of the viewport, creating perfect vertical alignment between the title and keyboard
   - Message uses large runic symbols (2.25rem font size) for better visibility
   - Gray background fits tightly around the message content
   - Message container adapts to content size
   - Spaces between words have double-width gaps (1rem) for improved readability

3. **Bottom Section**:
   - Alphabet keyboard is fixed to the bottom of the screen
   - Used for selecting letters to decode the message
   - Contains control elements integrated into the layout:
     - Left side: "Enter code..." input field with an adjacent label icon (🏷️) to reveal/hide the message code (tooltip: "The unique code for this secret message."), and the "Reset" button.
     - Right side: (No button currently, was previously "Next Message")
   - Consistent position across all screen sizes with responsive padding adjustments

4. **Responsive Design**:
   - Layout adapts to different screen sizes with carefully tuned breakpoints
   - CSS variables for dynamic spacing
   - Mobile-specific optimizations
   - Element positions adjust proportionally on smaller screens
   - Runic symbol font size is reduced on smaller screens to prevent overlap with other elements.

## User Flow

1. User is presented with an encrypted message using runic symbols
2. User selects a symbol from the message they want to decode
3. User selects a letter from the alphabet they think corresponds to the selected symbol
4. The application updates the mapping and shows the partially decoded message
5. User continues until the entire message is decoded
6. Confetti celebration appears when the message is fully decoded
7. User can choose to decode a new random message or enter a specific message code

## Special Features

### Hint System ("HELP" Code)
- Entering "HELP" reveals one random, correctly mapped but currently unsolved letter.
- Revealed hints are styled in green for clear differentiation.
- If only one letter remains unsolved, entering "HELP" shakes the input box instead of revealing the hint.

### Shake Feedback
- The code input box shakes if an invalid message code is entered (regardless of input length).
- The input box also shakes if "HELP" is entered when only one letter remains or if no hints are available.

### Secret Debug Mode
A hidden feature activated by double-clicking the title which provides:
- Direct decoding capabilities
- Message code visibility
- Testing tools

### Message Codes
Each message has a unique 4-character code (format: 2 letters + 2 numbers) that allows users to share specific messages with others.

### Secret Uncovered Notification
A dramatic full-screen notification that appears when a secret message is successfully decoded:
- Large "SECRET UNCOVERED" text displayed center screen.
- Styled with a gold color, drop shadow, and 'Cinzel Decorative' font reminiscent of Elden Ring victory text.
- Fades in and out over 4 seconds against a semi-transparent dark overlay.
- The confetti celebration starts *after* this notification finishes.

### Visual Feedback
The UI provides visual cues:
- Highlighted/hovered letters (runes) with an intensified pulsing glow.
- Selected letters (runes) with a gentler pulsing glow.
- Color-coded feedback on letter mapping (Blue for user-mapped, Green for hinted).
- Progress indicator for decoding (subtle color shift in selection glow).

## Styling Details

The application uses a dark-themed UI with:
- Dark background (#1a1a1a).
- Glowing text effects using text-shadow.
- Runic symbols for encrypted text (2.25rem size).
- Distinct styling for mapped (blue) and hinted (green) letters for clarity.
- Elden Ring-inspired font and styling for the "SECRET UNCOVERED" notification.
- Fixed positioning for control elements and keyboard.
- CSS variables for dynamic spacing and responsive adjustments.
- Interactive elements with hover and focus effects.

## Deployment

The project is configured for deployment to GitHub Pages using:
- Automatic deployment through GitHub Actions
- Manual deployment option using gh-pages package

## Future Enhancement Possibilities

1. Additional cipher types (Vigenère, Substitution, etc.)
2. User-created messages
3. Timed challenges or difficulty levels
4. Hint system for challenging decryptions (e.g., revealing most frequent letter)
5. Multiplayer or collaborative decoding
6. Mobile-specific optimizations (further refinements)
7. Sound effects and additional animations 