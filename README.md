# Live Price Chart

A modern, responsive, and highly performant real-time Bitcoin price chart built with Next.js, React, D3, and WebSocket.

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Running Tests](#running-tests)
  - [Building for Production](#building-for-production)
  - [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Demo

A live demo is available at: [https://live-price-chart.vercel.app](https://live-price-chart.vercel.app)

## Features

- Real-time Bitcoin price updates via Binance WebSocket API
- Smooth line and price animations
- Time range selection (1m, 5m, 15m, 1h, 4h, etc.)
- Dynamic scales with D3 for time and price axes
- Dark mode styling with Tailwind CSS
- Comprehensive unit and integration tests (44+ tests)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Languages**: TypeScript, JavaScript
- **Styling**: Tailwind CSS
- **Charting**: D3.js, Tangram VizX (visx)
- **Animations**: React hooks with `requestAnimationFrame` and D3
- **Testing**: Jest, React Testing Library
- **Bundler**: Webpack (via Next.js)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js v18 or later
- npm v9 or later (or Yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/MmdRezaSadati/live-price-chart.git
cd live-price-chart

# Install dependencies
npm install
``` 

### Development

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### Running Tests

```bash
# Run all tests once
npm test

# Watch mode
npm test -- --watch
``` 

All unit and integration tests must pass before merging.

### Building for Production

```bash
npm run build
npm start
```

### Deployment

This project is optimized for Vercel. Simply link the GitHub repository to your Vercel account and deploy.

## Project Structure

```text
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # Reusable UI components
│   ├── hooks/                # Custom React hooks (useWebSocket, useChartScales, animations)
│   ├── constants/            # Application constants (colors, symbols)
│   ├── types/                # TypeScript type definitions
│   ├── styles/               # Global and component-level styles
│   └── __tests__/            # All test files
├── babel.config.js           # Babel configuration (automatic JSX runtime)
├── jest.config.cjs           # Jest configuration
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── README.md                 # This file
```

## Configuration

- **Babel**: Uses `@babel/preset-react` with `runtime: 'automatic'` to avoid manual React imports.
- **Tailwind**: Configured in `tailwind.config.js`.
- **Jest**: Setup in `jest.config.cjs`, with mocks and global setup in `jest.setup.js`.

### Environment Variables

No environment variables are required for local development. The WebSocket URL is hard-coded for the Binance BTC/USDT stream.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with clear descriptions and passing tests.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "feat: add awesome feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Ensure all tests pass and adhere to the repository coding style.