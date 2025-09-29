# Development Guide

## Environment Setup

1. Create `.env.local`:
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Environment
NODE_ENV=development # or 'test' for test data
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Test Environment

To use test data instead of real API calls:

1. Set `NODE_ENV=test` in `.env.local`
2. Restart the Next.js server
3. The app will now use predefined test data

Test data includes:
- Common katakana words with hints
- Basic hiragana and katakana characters
- Progress tracking simulation
- Practice questions

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Available Test Data

### Modules
- test-hiragana: Basic hiragana characters
- test-katakana: Basic katakana characters
- katakana_words: Common katakana words

### Features
- Progress tracking
- Answer submission
- Practice questions
- Error handling
- Offline fallbacks

## Development Tools

1. Error Monitoring:
```bash
# Enable detailed error logging
DEBUG=true npm run dev
```

2. API Debugging:
```bash
# Show API calls in console
DEBUG_API=true npm run dev
```

3. Test Coverage:
```bash
# Generate coverage report
npm test -- --coverage
open coverage/lcov-report/index.html
```
