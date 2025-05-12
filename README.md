# 🚀 Live Price Chart - Real-time Cryptocurrency Price Visualization

<div align="center">
  <img src="public/logo.png" alt="Live Price Chart Logo" width="200"/>
  
  [![Next.js](https://img.shields.io/badge/Next.js-13.4.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![D3.js](https://img.shields.io/badge/D3.js-7.8.0-orange?style=for-the-badge&logo=d3.js)](https://d3js.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://live-price-chart.vercel.app)
</div>

## 🎮 Live Demo

Experience the live chart in action: [Live Price Chart Demo](https://live-price-chart.vercel.app)

Key features you can try:
- Real-time price updates
- Interactive chart with smooth animations
- Hover over the chart to see detailed price information
- Watch the dynamic color changes as prices move
- Test the responsive design by resizing your browser

## ✨ Features

### 🎯 Core Features
- **Real-time Price Updates**: Live streaming of cryptocurrency prices with WebSocket integration
- **Interactive Chart**: Smooth animations and transitions for price changes
- **Responsive Design**: Adapts to any screen size while maintaining performance
- **Customizable Timeframes**: Multiple time intervals for price analysis
- **Advanced Tooltips**: Detailed price information on hover

### 🎨 Visual Enhancements
- **Dynamic Color Schemes**: Color-coded price movements (up/down)
- **Smooth Animations**: Fluid transitions between price updates
- **Gradient Effects**: Beautiful area fills with dynamic gradients
- **Glow Effects**: Enhanced visual feedback for price changes
- **Responsive Layout**: Optimized for all device sizes

## 🛠 Technical Implementation

### 🔧 Architecture
```
src/
├── components/
│   ├── common/
│   │   └── chart/
│   │       ├── components/
│   │       │   ├── ChartAxes.tsx
│   │       │   └── ChartFilters.tsx
│   │       ├── hooks/
│   │       │   ├── useChartAnimation.ts
│   │       │   ├── useChartColors.ts
│   │       │   ├── useChartGenerators.ts
│   │       │   └── useChartScales.ts
│   │       └── LivePriceChart.tsx
│   └── market/
│       ├── MarketOverview.tsx
│       └── MarketStats.tsx
├── hooks/
│   └── useWebSocket.ts
└── types/
    └── chart.ts
```

### 💡 Key Technical Challenges

#### 1. Real-time Data Management
- **WebSocket Integration**: Efficient handling of real-time price updates
- **Data Buffering**: Smart management of historical price data
- **Performance Optimization**: Smooth rendering with large datasets

#### 2. Chart Animation System
- **Transition Management**: Complex animation logic for price changes
- **Performance Optimization**: Efficient DOM updates for smooth animations
- **State Management**: Coordinated updates across multiple components

#### 3. Visual Effects
- **Gradient System**: Dynamic color transitions based on price movement
- **Glow Effects**: Advanced SVG filters for enhanced visual feedback
- **Responsive Design**: Adaptive layouts for different screen sizes

## 🎯 User Benefits

### 📈 Trading Benefits
- **Real-time Analysis**: Immediate price movement visualization
- **Pattern Recognition**: Clear visualization of price trends
- **Quick Decision Making**: Instant access to price changes

### 🎨 Visual Experience
- **Engaging Interface**: Beautiful and intuitive design
- **Smooth Animations**: Pleasing visual feedback for price changes
- **Clear Information**: Easy-to-read price data and statistics

### 📱 Accessibility
- **Mobile Friendly**: Optimized for all device sizes
- **Responsive Design**: Adapts to any screen resolution
- **Touch Support**: Full touch interaction support

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/mohammadrezasadati/live-price-chart.git

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_WEBSOCKET_URL=your_websocket_url
```

## 🛠 Development

### Key Commands
```bash
# Development
pnpm dev

# Build
pnpm build

# Production
pnpm start

# Lint
pnpm lint
```

### Code Style
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [D3.js](https://d3js.org/) for powerful data visualization
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [TypeScript](https://www.typescriptlang.org/) for type safety

---

<div align="center">
  Made with ❤️ by Mohammad Reza Sadati
  
  [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/MmdRezaSadati)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/mohammad-reza-sadati)
</div>
