# Trading Strategy Code Processor

A web application that processes TradingView Pine Script strategy code and adds AutoView alert syntax. This tool makes it easy to configure your Pine Script strategies to work with AutoView for automated trading.

## Features

- Process Pine Script versions 4, 5, and 6
- Automatically detect script version
- Add appropriate alert syntax for strategy entry, exit, and close
- Support for multiple exchange formats
- Dark/light mode toggle
- Responsive design

## Getting Started

### Prerequisites

- Node.js 14.0 or higher

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/trading-strategy-processor.git
   cd trading-strategy-processor
   ```

2. Install dependencies
   ```bash
   cd my-app
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Paste your TradingView Pine Script in the input area
2. The script must be a strategy (containing a strategy() function)
3. The script must be version 4 or higher
4. Click "Process Code" to add AutoView alert syntax
5. Copy the processed code from the output area

## Color Palette

- Orange: rgb(252, 114, 19)
- Coal: rgb(51, 51, 51)
- Elephant: rgb(188, 185, 185)
- White: rgb(255, 255, 255)

## License

MIT 