# Trading Strategy Code Processor

A web application that processes TradingView Pine Script strategy code and adds AutoView alert syntax. This tool makes it easy to configure your Pine Script strategies to work with AutoView for automated trading.

## Features

- Process Pine Script versions 4, 5, and 6
- Add appropriate alert syntax for strategy entry, exit, and close
- Support for multiple exchange formats

## Getting Started

### Prerequisites

- Node.js 14.0 or higher

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/blakestarling/trading-strategy-processor.git
   cd trading-strategy-processor
   ```

2. Install dependencies
   ```bash
   cd "my-app"
   npm install
   ```

3. Start the development server
   ```bash
   cd "my-app"
   npm run dev
   ```

4. Navigate to the local server

## Usage

1. Paste your TradingView Pine Script in the input area
2. The script must be a strategy (containing a strategy() function)
3. The script must be version 4 or higher
4. Click "Process Code" to add AutoView alert syntax
5. Copy the processed code from the output area
6. Paste the processed code into a new TradingView strategy
7. Create an alert for the strategy with alert() function calls only
8. Connect your AutoView webhook URL
9. Profit
