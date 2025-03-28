# Secret Cipher Decoder Game

An interactive game where players decode various cipher-encoded messages by mapping letters to their original values.

## Features

- Multiple cipher types (Caesar, Atbash, etc.)
- Interactive UI with visual feedback
- Confetti celebration when a message is decoded
- Responsive design for all screen sizes
- Dark mode interface

## Live Demo

Visit the live demo at: https://YOUR_USERNAME.github.io/Decoder/

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/Decoder.git
cd Decoder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

## Deployment

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Automatic Deployment with GitHub Actions

1. Push your changes to the develop branch:
```bash
git add .
git commit -m "Your commit message"
git push origin develop
```

2. The GitHub Action will automatically build and deploy your site.

3. Your site will be available at: https://YOUR_USERNAME.github.io/Decoder/

### Manual Deployment (Alternative)

You can also deploy manually using the gh-pages package:

```bash
npm run deploy
```

## GitHub Pages Setup

1. Go to your repository on GitHub
2. Navigate to Settings > Pages
3. Under "Build and deployment", set the Source to "GitHub Actions"

## Adding New Ciphers or Messages

To add new messages or cipher types, edit the `SAMPLE_MESSAGES` array in `src/components/CaesarCipher.tsx`.

## License

MIT
