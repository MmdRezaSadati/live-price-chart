# Live Price Chart 📈

A real-time cryptocurrency price tracking application with interactive charts, built with Next.js and TypeScript.

![Live Price Chart Demo](public/screenshots/home.png)

## 🌟 Features

- **Real-time Price Updates**: Live cryptocurrency price tracking with WebSocket integration
- **Interactive Charts**: Smooth, animated price charts with customizable timeframes
- **Multiple Cryptocurrencies**: Support for major cryptocurrencies including Bitcoin, Ethereum, and more
- **Responsive Design**: Beautiful UI that works on all devices
- **Dark/Light Mode**: Toggle between dark and light themes
- **Advanced Animations**: Smooth path animations and transitions
- **Performance Optimized**: Built with performance in mind using Next.js and React Spring
- **SEO Friendly**: Optimized for search engines with proper metadata
- **PWA Support**: Install as a Progressive Web App for offline access

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [React Spring](https://react-spring.dev/)
- **Charts**: [D3.js](https://d3js.org/) with [Visx](https://airbnb.io/visx/)
- **State Management**: React Hooks
- **WebSocket**: Native WebSocket API
- **Testing**: Jest and React Testing Library
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **CI/CD**: GitHub Actions

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mohammadrezasadati/live-price-chart.git
   cd live-price-chart
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=your_api_url
   NEXT_PUBLIC_GA_ID=your_ga_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Development

### Project Structure

```
live-price-chart/
├── public/              # Static files
├── src/
│   ├── app/            # Next.js app router pages
│   ├── components/     # React components
│   ├── constants/      # Constants and configurations
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API and WebSocket services
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── tests/              # Test files
└── package.json        # Project dependencies
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## 🧪 Testing

The project uses Jest and React Testing Library for testing. Run tests with:

```bash
npm run test
```

For test coverage:

```bash
npm run test:coverage
```

## 📱 Progressive Web App

The application is a Progressive Web App (PWA) that can be installed on devices. Features include:

- Offline support
- Install to home screen
- Push notifications (coming soon)
- Automatic updates

## 🔒 Security

- HTTPS enforced
- Content Security Policy (CSP)
- XSS protection
- CSRF protection
- Rate limiting
- Input validation
- Secure headers

## 📈 Performance

- Server-side rendering (SSR)
- Static site generation (SSG)
- Image optimization
- Code splitting
- Lazy loading
- Bundle size optimization
- Caching strategies

## 🌐 SEO

- Meta tags optimization
- Open Graph tags
- Sitemap generation
- Robots.txt
- Structured data
- Canonical URLs

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mohammad Reza Sadati**

- GitHub: [@mohammadrezasadati](https://github.com/mohammadrezasadati)
- LinkedIn: [Mohammad Reza Sadati](https://linkedin.com/in/mohammadrezasadati)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [D3.js](https://d3js.org/) for the powerful visualization library
- [React Spring](https://react-spring.dev/) for the smooth animations
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

## 📞 Support

For support, email support@live-price-chart.com or open an issue in the GitHub repository.

---

Made with ❤️ by Mohammad Reza Sadati
