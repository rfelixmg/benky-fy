# Frontend Migration Documentation

## Project Setup

### Environment Setup
```bash
# Install dependencies
cd frontend
npm install

# Create environment file
cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOL

# Start development servers
# Terminal 1 - Flask Backend
cd benky-fy
export BENKY_FY_TEST_HASH=$(echo -n 'benky-fy-test-mode-2024' | shasum -a 256 | cut -d' ' -f1)
python run.py

# Terminal 2 - Next.js Frontend
cd frontend
npm run dev
```

### Required Packages
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.0",
    "swr": "^2.2.0",
    "web-vitals": "^3.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-plugin-react": "^7.0.0",
    "eslint-plugin-react-hooks": "^4.0.0",
    "prettier": "^3.0.0"
  }
}
```

## Architecture

### Project Structure
```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx     # Home page
│   │   ├── modules/     # Modules listing
│   │   └── flashcards/  # Flashcard interface
│   ├── components/      # React components
│   │   ├── layout/     # Layout components
│   │   ├── modules/    # Module-related components
│   │   ├── flashcard/  # Flashcard components
│   │   └── ui/         # Common UI components
│   ├── lib/            # Utilities and services
│   │   ├── api.ts     # API client
│   │   ├── analytics.ts # Analytics tracking
│   │   └── env.ts     # Environment configuration
│   └── types/         # TypeScript definitions
```

### Japanese Text Utilities

1. **Types**
```typescript
// src/types/japanese.ts
export type Script = 'hiragana' | 'katakana' | 'kanji' | 'romaji';
export type JapaneseChar = string;
export type RomajiChar = string;

export interface ConversionOptions {
  script: Script;
  allowPartial?: boolean;
}
```

2. **Character Conversion**
```typescript
// src/utils/japanese.ts
export class JapaneseText {
  static readonly HIRAGANA_RANGE = /[\u3040-\u309F]/;
  static readonly KATAKANA_RANGE = /[\u30A0-\u30FF]/;
  static readonly KANJI_RANGE = /[\u4E00-\u9FAF]/;

  static isHiragana(char: string): boolean;
  static isKatakana(char: string): boolean;
  static isKanji(char: string): boolean;
  static convert(text: string, options: ConversionOptions): string;
}
```

3. **React Hooks**
```typescript
// src/hooks/useJapaneseInput.ts
export function useJapaneseInput(options: ConversionOptions) {
  const [input, setInput] = useState('');
  const converted = useMemo(() => 
    JapaneseText.convert(input, options),
    [input, options]
  );
  return { input, setInput, converted };
}
```

### Key Features

1. **Authentication**
   - Session-based auth with Flask backend
   - Test mode support for development
   - Protected route middleware

2. **Module System**
   - Server-side rendered module list
   - SWR for data fetching and caching
   - Fallback data for offline support

3. **Flashcard Interface**
   - Mobile-first design
   - Touch gestures with Framer Motion
   - Keyboard shortcuts
   - Progress tracking

4. **Performance**
   - Core Web Vitals monitoring
   - Image optimization
   - Route prefetching
   - Response caching

5. **Error Handling**
   - Error boundaries
   - Loading states
   - Retry mechanisms
   - Fallback content

### API Integration

1. **Endpoints**
   ```typescript
   /modules              # Get available modules
   /begginer/{module}    # Get module flashcards
   /begginer/{module}/answer  # Submit answers
   ```

2. **Error Handling**
   - Automatic retries
   - Fallback data
   - Error boundaries

### Development Guidelines

1. **Component Rules**
   - Use 'use client' for interactive components
   - Implement loading states
   - Add error boundaries
   - Include analytics tracking

2. **Data Fetching**
   - Use SWR for client-side data
   - Implement proper caching
   - Add retry logic
   - Include fallback data

3. **Mobile Support**
   - Test touch interactions
   - Verify responsive layouts
   - Check loading states
   - Validate offline behavior

4. **Testing**
   - Use test mode for development
   - Verify error states
   - Check loading indicators
   - Test offline functionality

## Deployment

1. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080  # Flask API URL
   NEXT_PUBLIC_BASE_URL=http://localhost:3000 # Next.js URL
   ```

2. **Build Process**
   ```bash
   npm run build  # Create production build
   npm start     # Start production server
   ```

3. **Analytics**
   - Web Vitals tracking in production
   - User interaction events
   - Error tracking
   - Performance monitoring