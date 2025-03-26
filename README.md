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

2. Open the file folder

3. Install dependencies
   ```bash
   cd my-app
   npm install
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Navigate to the local server

## Usage Instructions

1. Paste your TradingView Pine Script in the input area
   - The script must be a strategy (containing a strategy() function)
   - The script must be version 4 or higher
2. Click "Process Code" to add AutoView alert syntax
3. Copy the processed code from the output area
4. Paste the processed code into a new TradingView script
5. Create an alert for the strategy and paste the following into the alert message box:
   ```bash
   {{strategy.order.alert_message}}
   ```
6. Connect your AutoView webhook URL
7. Profit
