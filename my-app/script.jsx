import React, { useState, useEffect } from 'react';

// Color palette
const colors = {
  light: {
    orange: 'rgb(252, 114, 19)',
    coal: 'rgb(51, 51, 51)',
    elephant: 'rgb(188, 185, 185)',
    white: 'rgb(255, 255, 255)',
    background: '#f5f5f5',
    cardBg: 'rgb(255, 255, 255)',
    textPrimary: 'rgb(51, 51, 51)',
    textSecondary: 'rgb(102, 102, 102)',
    border: 'rgb(188, 185, 185)',
    inputBg: 'rgb(255, 255, 255)',
    emptyInputBg: '#f5f5f5',
    shadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  dark: {
    orange: 'rgb(252, 114, 19)',
    coal: 'rgb(51, 51, 51)',
    elephant: 'rgb(188, 185, 185)',
    white: 'rgb(255, 255, 255)',
    background: '#1e1e1e',
    cardBg: '#2d2d2d',
    textPrimary: 'rgb(240, 240, 240)',
    textSecondary: 'rgb(200, 200, 200)',
    border: 'rgb(70, 70, 70)',
    inputBg: '#3a3a3a',
    emptyInputBg: '#333333',
    shadow: '0 2px 4px rgba(0,0,0,0.3)'
  }
};

const TradingCodeProcessor = () => {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize with system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Get theme colors based on current mode
  const theme = darkMode ? colors.dark : colors.light;
  
  // Check for saved preference and listen for system changes
  useEffect(() => {
    // Check for saved preference first
    const savedTheme = localStorage.getItem('darkMode');
    
    // If no saved preference, use system preference
    if (savedTheme === null) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      setDarkMode(prefersDark.matches);
      
      // Listen for changes in system preference
      const handler = (e) => setDarkMode(e.matches);
      prefersDark.addEventListener('change', handler);
      
      return () => {
        prefersDark.removeEventListener('change', handler);
      };
    } else {
      setDarkMode(savedTheme === 'true');
    }
  }, []);

  // Save preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const processCode = () => {
    if (!inputCode.trim()) {
      setMessage({ text: 'Please paste your code first', type: 'error' });
      return;
    }

    try {
      // Split code into lines for processing
      const lines = inputCode.split('\n');
      
      // Extract version number
      let version = extractVersion(lines);
      
      // Validate version
      if (version < 4) {
        setMessage({ text: 'Please upload a script with version 4 or higher', type: 'error' });
        return;
      }
      
      // Check if it's a strategy
      if (!isStrategy(lines)) {
        setMessage({ text: 'Please make sure the script is a strategy', type: 'error' });
        return;
      }
      
      // Process the code based on the version
      const processedCode = addCodeBlocks(lines, version);
      
      // Add alert statements
      const finalCode = addAlertStatements(processedCode, version);
      
      setOutputCode(finalCode.join('\n'));
      setMessage({ text: `Successfully processed (version ${version})`, type: 'success' });
    } catch (error) {
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    }
  };

  // Extract version from code
  const extractVersion = (lines) => {
    for (const line of lines) {
      const versionMatch = line.match(/\/\/@version=(\d+)/);
      if (versionMatch) {
        return parseInt(versionMatch[1]);
      }
    }
    return 6; // Default to version 6 if not specified
  };

  // Check if the code is a strategy
  const isStrategy = (lines) => {
    for (const line of lines) {
      if (!line.trim().startsWith('//') && line.includes('strategy(')) {
        return true;
      }
    }
    return false;
  };

  // Add version-specific code blocks
  const addCodeBlocks = (lines, version) => {
    let codeBlocks = [];
    
    // Add the appropriate code block based on version
    if (version === 5 || version === 6) {
      codeBlocks.push(
        '// --------------------------',
        '// AutoView alert syntax settings',
        '// --------------------------',
        'testMode = input.bool(true, "Test Mode", group = "Syntax Builder", tooltip = "Alerts will not place real trades (d=1)")',
        'exchange = input.string("Alpaca", "Exchange",',
        '     ["Alpaca","AlpacaPaper","AscendEX","AscendEXSandbox","AscendEXFutures",',
        '      "Binance","BinanceDelivery","BinanceDeliveryTestnet","BinanceFutures",',
        '      "BinanceFuturesTestnet","BinanceUS","Bitfinex","BitfinexV2","Bitget",',
        '      "BitgetMix","BitgetMixCopy","BitMEX","BitMEXTestnet","BittrexV3",',
        '      "ByBit","ByBitTestnet","ByBitCopyTestnet","ByBitSpot","ByBitSpotTestnet",',
        '      "Capital.com","Capital.com Demo","CoinbaseAdvanced","CoinbasePro",',
        '      "CoinbaseProSandbox","Delta","DeltaTestnet","Deribit","DeribitTestnet",',
        '      "Gate.io","Gate.io Futures","Gate.io FuturesTestnet","Gemini","GeminiSandbox",',
        '      "HTX","Huobi","HuobiFutures","HuobiLinear","HuobiSwap","HyperLiquid",',
        '      "Kraken","KrakenFutures","KrakenFuturesDemo","Kucoin","KucoinFutures",',
        '      "OANDA","OANDAPractice","OKCoin-USD","OKEX","OKEXDemo","OKX","OKXDemo",',
        '      "Poloniex","Tradovate","TradovateSim"],',
        '     "The receiving exchange for your command.", group = "Syntax Builder")',
        'accountName = input.string("", "Account", tooltip = "The alias for the API credentials you want to use for this command.", group = "Syntax Builder")',
        'symbol      = input.string("", "Symbol", tooltip = "The receiving exchange\'s market for your command. If left blank, this will default to the current symbol (ex: BTCUSD)", group = "Syntax Builder")',
        'quantity    = input.float(5, "Order Size", group = "Syntax Builder", minval = 0, tooltip = "Used only if no quantity is provided in strategy.entry/order parameters. Match this to the strategy order size.")',
        'unitType    = input.string("% of equity", "Unit Type", options = ["% of equity","Contracts","Currency"], group = "Syntax Builder", tooltip = "Match this to the strategy order type.")',
      );
    } else if (version === 4) {
      codeBlocks.push(
        '// --------------------------',
        '// AutoView alert syntax settings',
        '// --------------------------',
        'testMode = input(true, "Test Mode", group = "Syntax Builder", tooltip = "Alerts will not place real trades (d=1)")',
        'exchange = input("Alpaca", "Exchange", input.string, options =',
        '     ["Alpaca","AlpacaPaper","AscendEX","AscendEXSandbox","AscendEXFutures",',
        '      "Binance","BinanceDelivery","BinanceDeliveryTestnet","BinanceFutures",',
        '      "BinanceFuturesTestnet","BinanceUS","Bitfinex","BitfinexV2","Bitget",',
        '      "BitgetMix","BitgetMixCopy","BitMEX","BitMEXTestnet","BittrexV3",',
        '      "ByBit","ByBitTestnet","ByBitCopyTestnet","ByBitSpot","ByBitSpotTestnet",',
        '      "Capital.com","Capital.com Demo","CoinbaseAdvanced","CoinbasePro",',
        '      "CoinbaseProSandbox","Delta","DeltaTestnet","Deribit","DeribitTestnet",',
        '      "Gate.io","Gate.io Futures","Gate.io FuturesTestnet","Gemini","GeminiSandbox",',
        '      "HTX","Huobi","HuobiFutures","HuobiLinear","HuobiSwap","HyperLiquid",',
        '      "Kraken","KrakenFutures","KrakenFuturesDemo","Kucoin","KucoinFutures",',
        '      "OANDA","OANDAPractice","OKCoin-USD","OKEX","OKEXDemo","OKX","OKXDemo",',
        '      "Poloniex","Tradovate","TradovateSim"], tooltip =',
        '     "The receiving exchange for your command.", group = "Syntax Builder")',
        'accountName = input("", "Account", input.string, tooltip = "The alias for the API credentials you want to use for this command.", group = "Syntax Builder")',
        'symbol      = input("", "Symbol", input.string, tooltip = "The receiving exchange\'s market for your command. If left blank, this will default to the current symbol (ex: BTCUSD)", group = "Syntax Builder")',
        'quantity    = input(5, "Order Size", input.integer, group = "Syntax Builder", minval = 0, tooltip = "Used only if no quantity is provided in strategy.entry/order parameters. Match this to the strategy order size.")',
        'unitType    = input("% of equity", "Unit Type", input.string, options = ["% of equity","Contracts","Currency"], group = "Syntax Builder", tooltip = "Match this to the strategy order type.")',
      );
    }
    
    // Add common code for versions 4, 5, and 6
    if (version >= 4) {
      codeBlocks.push(
        'if(barstate.isfirst and (exchange == "Capital.com"))',
        '    exchange := "capital"',
        'else if(barstate.isfirst and (exchange == "Capital.com Demo"))',
        '    exchange := "capitaldemo"',
        'else if(barstate.isfirst and (exchange == "CoinbaseAdvanced"))',
        '    exchange := "coinbase"',
        'else if(barstate.isfirst and (exchange == "Gate.io"))',
        '    exchange := "gate"',
        'else if(barstate.isfirst and (exchange == "Gate.io Futures"))',
        '    exchange := "gatefutures"',
        'else if(barstate.isfirst and (exchange == "Gate.io Futures Testnet"))',
        '    exchange := "gatefuturestestnet"',
        '',
        '',
        'var string account = ""',
        'if (accountName != "" and account == "")',
        '    account := "a=" + accountName + " "',
        '',
        '',
        'var string unit = ""',
        'if (barstate.isfirst and unitType == "% of equity")',
        '    unit := "%"',
        'else if (barstate.isfirst and unitType == "Currency")',
        '    unit := " u=currency"',
        'else if (barstate.isfirst and unitType == "Contracts")',
        '    unit := " u=contracts"',
        '',
        '',
        'if (barstate.isfirst and symbol == "")',
        '    symbol := syminfo.basecurrency + syminfo.currency',
        '',
        '',
        'var string amp = ""',
        'if (barstate.isfirst and (exchange == "OANDA" or exchange == "OANDAPractice" or exchange == "Tradovate" or exchange == "TradovateSim"))',
        '    amp := " & "',
        '',
        '',
        'var string alertMode = "d=1 "',
        'if (barstate.isfirst and not testMode)',
        '    alertMode := "d=0 "',
        '',
        '',
        '',
        '',
        '// --------------------------',
        '// AutoView alert syntax settings',
        '// --------------------------'
      );
    }
    
    // Combine the code blocks with the original code
    return [...codeBlocks, ...lines];
  };

  // Add alert statements
  const addAlertStatements = (lines, version) => {
    // These arrays will hold parameter values for corresponding functions
    const idEntries = new Array(lines.length).fill(null);
    const idExits = new Array(lines.length).fill(null);
    const idCloses = new Array(lines.length).fill(null);
    const commentCloses = new Array(lines.length).fill(null);
    const qtyCloses = new Array(lines.length).fill(null);
    const qtyPercentCloses = new Array(lines.length).fill(null);
    const immediatelyCloses = new Array(lines.length).fill(null);
    const whenCloseAlls = new Array(lines.length).fill(null);
    const commentCloseAlls = new Array(lines.length).fill(null);
    const directions = new Array(lines.length).fill(null);
    const quantities = new Array(lines.length).fill(null);
    const limits = new Array(lines.length).fill(null);
    const stops = new Array(lines.length).fill(null);
    const ocaNames = new Array(lines.length).fill(null);
    const ocaTypes = new Array(lines.length).fill(null);
    const comments = new Array(lines.length).fill(null);
    const whenEntries = new Array(lines.length).fill(null); 
    const fromEntries = new Array(lines.length).fill(null);
    const exitQuantities = new Array(lines.length).fill(null);
    const qtyPercentages = new Array(lines.length).fill(null);
    const exitTPs = new Array(lines.length).fill(null);
    const exitLimits = new Array(lines.length).fill(null);
    const exitLosses = new Array(lines.length).fill(null);
    const exitStops = new Array(lines.length).fill(null);
    const exitTrails = new Array(lines.length).fill(null);
    const exitTrailPoints = new Array(lines.length).fill(null);
    const exitTrailOffsets = new Array(lines.length).fill(null);
    const exitOcaNames = new Array(lines.length).fill(null);
    const exitComments = new Array(lines.length).fill(null);
    const whenExits = new Array(lines.length).fill(null);
    const commentProfits = new Array(lines.length).fill(null);
    const commentLosses = new Array(lines.length).fill(null);
    const commentTrailings = new Array(lines.length).fill(null);
    const alertProfits = new Array(lines.length).fill(null);
    const alertLosses = new Array(lines.length).fill(null);
    const alertTrailings = new Array(lines.length).fill(null);
    const idCancels = new Array(lines.length).fill(null);
    const whenCancels = new Array(lines.length).fill(null);
    const whenCancelAlls = new Array(lines.length).fill(null);

    // First, analyze the code and extract parameters
    if (version === 4 || version === 5 || version === 6) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Analyze strategy.entry and strategy.order calls
        if (line.includes('strategy.entry(') || line.includes('strategy.order(')) {
          const params = extractParameters(line);
          // Extract id entries
          let idEntry = null;
          const idMatch = line.match(/id\s*=\s*([^,)]+)/);
          if (idMatch) {
            idEntry = trimAllSpaces(idMatch[1]);
          } else {
            // Extract first parameter as id if it doesn't contain '='
            if (params.length >= 1 && !params[0].includes('=')) {
              idEntry = trimAllSpaces(params[0]);
            }
          }
          idEntries[i] = idEntry;

          // Extract direction
          if(version === 4){
            let direction = null;
            const directionMatch = line.match(/long\s*=\s*([^,)]+)/);
            if (directionMatch) {
              direction = directionMatch[1].trim();
            } else {
              // Extract second parameter as direction
                if (params.length >= 2) {
                direction = params[1].trim();
              }
            }
            directions[i] = direction;
          }
          if(version === 5 || version === 6){
            let direction = null;
            const directionMatch = line.match(/direction\s*=\s*([^,)]+)/);
            if (directionMatch) {
              direction = directionMatch[1].trim();
            } else {
              // Extract second parameter as direction
              if (params.length >= 2) {
                direction = params[1].trim();
              }
            }
            directions[i] = direction;
          }
          
          // Extract quantity
          let quantity = null;
          const quantityMatch = line.match(/qty\s*=\s*([^,)]+)/);
          if (quantityMatch) {
            quantity = quantityMatch[1].trim();
          } else {
            // Extract third parameter as quantity if it doesn't contain '='
            if (params.length >= 3 && !params[2].includes('=')) {
              quantity = params[2].trim();
            }
          }
          quantities[i] = quantity;
          
          // Extract limit
          let limit = null;
          const limitMatch = line.match(/limit\s*=\s*([^,)]+)/);
          if (limitMatch) {
            limit = limitMatch[1].trim();
          } else {
            // Extract fourth parameter as limit if it doesn't contain '='
            if (params.length >= 4 && !params[3].includes('=')) {
              limit = params[3].trim();
            }
          }
          limits[i] = limit;
          
          // Extract stop
          let stop = null;
          const stopMatch = line.match(/stop\s*=\s*([^,)]+)/);
          if (stopMatch) {
            stop = stopMatch[1].trim();
          } else {
            // Extract fifth parameter as stop if it doesn't contain '='
            if (params.length >= 5 && !params[4].includes('=')) {
              stop = params[4].trim();
            }
          }
          stops[i] = stop;

          // Extract oca_name
          let ocaName = null;
          const ocaNameMatch = line.match(/oca_name\s*=\s*([^,)]+)/);
          if (ocaNameMatch) {
            ocaName =  ocaNameMatch[1].trim();
          } else {
            // Extract sixth parameter as oca_name if it doesn't contain '='
            if (params.length >= 6 && !params[5].includes('=')) {
              ocaName = params[5].trim();
            }
          }
          ocaNames[i] = ocaName;

          // Extract oca_type
          let ocaType = null;
          const ocaTypeMatch = line.match(/oca_type\s*=\s*([^,)]+)/);
          if (ocaTypeMatch) {
            ocaType = ocaTypeMatch[1].trim();
          } else {
            // Extract seventh parameter as oca_type if it doesn't contain '='
            if (params.length >= 7 && !params[6].includes('=')) {
              ocaType = params[6].trim();
            }
          }
          ocaTypes[i] = ocaType;

          // Extract comment
          let comment = null;
          const commentMatch = line.match(/comment\s*=\s*([^,)]+)/);
          if (commentMatch) {
            comment = commentMatch[1].trim();
          } else {
            // Extract eighth parameter as comment if it doesn't contain '='
            if (params.length >= 8 && !params[7].includes('=')) {
              comment = params[7].trim();
            }
          }
          comments[i] = comment;

          // Extract when entry
          if(version === 4){
            let whenEntry = null;
            const whenMatch = line.match(/when\s*=\s*([^,)]+)/);
            if(whenMatch){
              whenEntry = whenMatch[1].trim();
            }
            else{
              // Extract ninth parameter as when if it doesn't contain '='
              if (params.length >= 9 && !params[8].includes('=')){
                whenEntry = params[8].trim();
              }
            }
            whenEntries[i] = whenEntry;
          }
        }
        
        // Analyze strategy.exit calls
        if (line.includes('strategy.exit(')) {
          const params = extractParameters(line);
          // Extract id exits
          let idExit = null;
          const idMatch = line.match(/id\s*=\s*([^,)]+)/);
          if (idMatch) {
            idExit = trimAllSpaces(idMatch[1]);
          } else {
            // Extract third parameter as quantity if it doesn't contain '='
            if (params.length >= 1 && !params[0].includes('=')) {
              idExit = trimAllSpaces(params[0]);
            }
          }
          idExits[i] = idExit;

          // Extract from_entry
          let fromEntry = null;
          const fromEntryMatch = line.match(/from_entry\s*=\s*([^,)]+)/);
          if (fromEntryMatch) {
            fromEntry = fromEntryMatch[1].trim();
          } else {
            // Extract third parameter as quantity if it doesn't contain '='
            if (params.length >= 2 && !params[1].includes('=')) {
              fromEntry = params[1].trim();
            }
          }
          fromEntries[i] = fromEntry;

          // Extract qty
          let exitQty = null;
          const qtyMatch = line.match(/qty\s*=\s*([^,)]+)/);
          if (qtyMatch) {
            exitQty = qtyMatch[1].trim();
          } else {
            // Extract third parameter as quantity if it doesn't contain '='
            if (params.length >= 3 && !params[2].includes('=')) {
              exitQty = params[2].trim();
            }
          }
          exitQuantities[i] = exitQty;

          // Extract qty_percent
          let qtyPercent = null;
          const qtyPercentMatch = line.match(/qty_percent\s*=\s*([^,)]+)/);
          if (qtyPercentMatch) {
            qtyPercent = qtyPercentMatch[1].trim();
          } else {
            // Extract third parameter as quantity if it doesn't contain '='
            if (params.length >= 4 && !params[3].includes('=')) {
              qtyPercent = params[3].trim();
            }
          }
          qtyPercentages[i] = qtyPercent;

          // Extract profit
          let exitTP = null;
          const profitMatch = line.match(/profit\s*=\s*([^,)]+)/);
          if (profitMatch) {
            exitTP = profitMatch[1].trim();
          } else {
            // Extract fifth parameter as profit if it doesn't contain '='
            if (params.length >= 5 && !params[4].includes('=')) {
              exitTP = params[4].trim();
            }
          }
          exitTPs[i] = exitTP;
          
          // Extract limit
          let exitLimit = null;
          const limitMatch = line.match(/limit\s*=\s*([^,)]+)/);
          if (limitMatch) {
            exitLimit = limitMatch[1].trim();
          } else {
            // Extract sixth parameter as limit if it doesn't contain '='
            if (params.length >= 6 && !params[5].includes('=')) {
              exitLimit = params[5].trim();
            }
          }
          exitLimits[i] = exitLimit;
          
          // Extract loss
          let exitLoss = null;
          const lossMatch = line.match(/loss\s*=\s*([^,)]+)/);
          if (lossMatch) {
            exitLoss = lossMatch[1].trim();
          } else {
            // Extract seventh parameter as loss if it doesn't contain '='
            if (params.length >= 7 && !params[6].includes('=')) {
              exitLoss = params[6].trim();
            }
          }
          exitLosses[i] = exitLoss;
          
          // Extract stop
          let exitStop = null;
          const stopMatch = line.match(/stop\s*=\s*([^,)]+)/);
          if (stopMatch) {
            exitStop = stopMatch[1].trim();
          } else {
            // Extract eighth parameter as stop if it doesn't contain '='
            if (params.length >= 8 && !params[7].includes('=')) {
              exitStop = params[7].trim();
            }
          }
          exitStops[i] = exitStop;
          
          // Extract trail_price
          let exitTrail = null;
          const trailPriceMatch = line.match(/trail_price\s*=\s*([^,)]+)/);
          if (trailPriceMatch) {
            exitTrail = trailPriceMatch[1].trim();
          } else {
            // Extract ninth parameter as trail_price if it doesn't contain '='
            if (params.length >= 9 && !params[8].includes('=')) {
              exitTrail = params[8].trim();
            }
          }
          exitTrails[i] = exitTrail;
          
          // Extract trail_points
          let trailPoints = null;
          const trailPointsMatch = line.match(/trail_points\s*=\s*([^,)]+)/);
          if (trailPointsMatch) {
            trailPoints = trailPointsMatch[1].trim();
          } else {
            // Extract tenth parameter as trail_points if it doesn't contain '='
            if (params.length >= 10 && !params[9].includes('=')) {
              trailPoints = params[9].trim();
            }
          }
          exitTrailPoints[i] = trailPoints;
          
          // Extract trail_offset
          let trailOffset = null;
          const trailOffsetMatch = line.match(/trail_offset\s*=\s*([^,)]+)/);
          if (trailOffsetMatch) {
            trailOffset = trailOffsetMatch[1].trim();
          } else {
            // Extract eleventh parameter as trail_offset if it doesn't contain '='
            if (params.length >= 11 && !params[10].includes('=')) {
              trailOffset = params[10].trim();
            }
          }
          exitTrailOffsets[i] = trailOffset;

          // Extract oca_name
          let ocaName = null;
          const ocaNameMatch = line.match(/oca_name\s*=\s*([^,)]+)/);
          if (ocaNameMatch) {
            ocaName = ocaNameMatch[1].trim();
          } else {
            // Extract eleventh parameter as trail_offset if it doesn't contain '='
            if (params.length >= 12 && !params[11].includes('=')) {
              ocaName = params[11].trim();
            }
          }
          exitOcaNames[i] = ocaName;

          // Extract comment
          let comment = null;
          const commentMatch = line.match(/comment\s*=\s*([^,)]+)/);
          if (commentMatch) {
            comment = commentMatch[1].trim();
          } else {
            // Extract twelfth parameter as comment if it doesn't contain '='
            if (params.length >= 13 && !params[12].includes('=')) {
              comment = params[12].trim();
            }
          }
          exitComments[i] = comment;

          // Extract when exit
          if(version === 4){
            let whenExit = null;
            const whenMatch = line.match(/when\s*=\s*([^,)]+)/);
            if(whenMatch){
              whenExit = whenMatch[1].trim();
            }
            else{
              // Extract thirteenth parameter as when if it doesn't contain '='
              if (params.length >= 14 && !params[13].includes('=')){
                whenExit = params[13].trim();
              }
            }
            whenExits[i] = whenExit;
          }

          if(version === 5 || version === 6){

            // Extract comment_profit
            let commentProfit = null;
            const commentProfitMatch = line.match(/comment_profit\s*=\s*([^,)]+)/);
            if(commentProfitMatch){
              commentProfit = commentProfitMatch[1].trim();
            }
            else{
              // Extract fourteenth parameter as comment_profit if it doesn't contain '='
              if (params.length >= 15 && !params[14].includes('=')){
                commentProfit = params[14].trim();
              }
            }
            commentProfits[i] = commentProfit;

            // Extract comment_loss
            let commentLoss = null;
            const commentLossMatch = line.match(/comment_loss\s*=\s*([^,)]+)/);
            if(commentLossMatch){
              commentLoss = commentLossMatch[1].trim();
            }
            else{
              // Extract fifteenth parameter as comment_loss if it doesn't contain '='
              if (params.length >= 16 && !params[15].includes('=')){
                commentLoss = params[15].trim();
              }
            }
            commentLosses[i] = commentLoss;

            // Extract comment_trailing
            let commentTrailing = null;
            const commentTrailingMatch = line.match(/comment_trailing\s*=\s*([^,)]+)/);
            if(commentTrailingMatch){
              commentTrailing = commentTrailingMatch[1].trim();
            } 
            else{
              // Extract sixteenth parameter as comment_trailing if it doesn't contain '='
              if (params.length >= 17 && !params[16].includes('=')){
                commentTrailing = params[16].trim();
              }
            }
            commentTrailings[i] = commentTrailing;

            // Extract alert_profit
            let alertProfit = null;
            const alertProfitMatch = line.match(/alert_profit\s*=\s*([^,)]+)/);
            if(alertProfitMatch){
              alertProfit = alertProfitMatch[1].trim();
            } 
            else{
              // Extract seventeenth parameter as alert_profit if it doesn't contain '='
              if (params.length >= 18 && !params[17].includes('=')){
                alertProfit = params[17].trim();
              }
            }
            alertProfits[i] = alertProfit;

            // Extract alert_loss
            let alertLoss = null;
            const alertLossMatch = line.match(/alert_loss\s*=\s*([^,)]+)/);
            if(alertLossMatch){
              alertLoss = alertLossMatch[1].trim(); 
            }
            else{
              // Extract eighteenth parameter as alert_loss if it doesn't contain '='
              if (params.length >= 19 && !params[18].includes('=')){
                alertLoss = params[18].trim();
              }   
            }
            alertLosses[i] = alertLoss;

            // Extract alert_trailing
            let alertTrailing = null;
            const alertTrailingMatch = line.match(/alert_trailing\s*=\s*([^,)]+)/);
            if(alertTrailingMatch){
              alertTrailing = alertTrailingMatch[1].trim();
            }
            else{
              // Extract nineteenth parameter as alert_trailing if it doesn't contain '='
              if (params.length >= 20 && !params[19].includes('=')){
                alertTrailing = params[19].trim();
              }
            }
            alertTrailings[i] = alertTrailing;
          }
        }

        // Analyze strategy close calls
        if(line.includes('strategy.close(')){
          const params = extractParameters(line);
          const versionDifference = version === 4 ? 1 : 0;

          // Extract id closes
          let idClose = null;
          const idMatch = line.match(/id\s*=\s*([^,)]+)/);
          if (idMatch) {
            idClose = trimAllSpaces(idMatch[1]);
          } else {
            // Extract first parameter as id if it doesn't contain '='
            if (params.length >= 1 && !params[0].includes('=')) {
              idClose = trimAllSpaces(params[0]);
            }
          }
          idCloses[i] = idClose;

          if(version === 4){
            // Extract when closes
            let whenClose = null;
            const whenMatch = line.match(/when\s*=\s*([^,)]+)/);
            if (whenMatch) {
              whenClose = whenMatch[1].trim();
            }
            else{
              // Extract second parameter as when if it doesn't contain '='
              if (params.length >= 2 && !params[1].includes('=')) {
                whenClose = params[1].trim();
              }
            }
            whenCloses[i] = whenClose;
          }
          

          // Extract comment closes
            let commentClose = null;
            const commentMatch = line.match(/comment\s*=\s*([^,)]+)/);
            if (commentMatch) {
              commentClose = commentMatch[1].trim();
            } else {
              // Extract second parameter as comment if it doesn't contain '='
              if (params.length >= 2 + versionDifference && !params[1 + versionDifference].includes('=')) {
                commentClose = params[1 + versionDifference].trim();
              }
            }
            commentCloses[i] = commentClose;


          // Extract qty closes
          let qtyClose = null;
          const qtyMatch = line.match(/qty\s*=\s*([^,)]+)/);
          if (qtyMatch) {
            qtyClose = qtyMatch[1].trim();
          } else {
            // Extract third parameter as quantity if it doesn't contain '='
            if (params.length >= 3 + versionDifference && !params[2 + versionDifference].includes('=')) {
              qtyClose = params[2 + versionDifference].trim();
            }
          }
          qtyCloses[i] = qtyClose;

          // Extract qty_percent closes
          let qtyPercentClose = null;
          const qtyPercentMatch = line.match(/qty_percent\s*=\s*([^,)]+)/);
          if (qtyPercentMatch) {
            qtyPercentClose = qtyPercentMatch[1].trim();
          } else {
            // Extract fourth parameter as qty_percent if it doesn't contain '='
            if (params.length >= 4 + versionDifference && !params[3 + versionDifference].includes('=')) {
              qtyPercentClose = params[3 + versionDifference].trim();
            }
          }
          qtyPercentCloses[i] = qtyPercentClose;
          
          if(version === 5){
            // Extract immediately
            let immediately = null;
            const immediatelyMatch = line.match(/immediately\s*=\s*([^,)]+)/);
            if (immediatelyMatch) {
              immediately = immediatelyMatch[1].trim();
            } else {
              // Extract sixth parameter as immediately if it doesn't contain '='
              if (params.length >= 6 && !params[5].includes('=')) {
                immediately = params[5].trim();
              }
            }
            immediatelyCloses[i] = immediately;
          }
        }

        // Analyze strategy close_all calls
        if(line.includes('strategy.close_all(')){
          const params = extractParameters(line);
          const versionDifference = version === 4 ? 1 : 0;

          // Extract when close alls
          if(version === 4){
            let whenCloseAll = null;
            const whenMatch = line.match(/when\s*=\s*([^,)]+)/);
            if (whenMatch) {
              whenCloseAll = whenMatch[1].trim();
            } else {
              // Extract first parameter as when if it doesn't contain '='
              if (params.length >= 1 && !params[0].includes('=')) {
                whenCloseAll = params[0].trim();
              }
            }
            whenCloseAlls[i] = whenCloseAll;
          }
          
          // Extract comment close alls
          let commentCloseAll = null;
          const commentMatch = line.match(/comment\s*=\s*([^,)]+)/);
          if (commentMatch) {
            commentCloseAll = commentMatch[1].trim();
          } else {
            // Extract second parameter as comment if it doesn't contain '='
            if (params.length >= 1 + versionDifference && !params[0 + versionDifference].includes('=')) {
              commentCloseAll = params[0 + versionDifference].trim();
            }
          }
          commentCloseAlls[i] = commentCloseAll;
          
        }

        // Analyze strategy cancel calls
        if(line.includes('strategy.cancel(')){
          const params = extractParameters(line);
          
          // Extract id cancels
          let idCancel = null;
          const idMatch = line.match(/id\s*=\s*([^,)]+)/);
          if (idMatch) {
            idCancel = trimAllSpaces(idMatch[1]);
          }
          else{
            // Extract first parameter as id if it doesn't contain '='
            if (params.length >= 1 && !params[0].includes('=')) {
              idCancel = trimAllSpaces(params[0]);
            }
          }
          idCancels[i] = idCancel;

          // Extract when cancels
          if(version === 4){
            let whenCancel = null;
            const whenMatch = line.match(/when\s*=\s*([^,)]+)/);
            if (whenMatch) {
              whenCancel = whenMatch[1].trim();
            }
            else{
              // Extract second parameter as when if it doesn't contain '='
              if (params.length >= 2 && !params[1].includes('=')) {
                whenCancel = params[1].trim();
              }
            }
            whenCancels[i] = whenCancel;
          }

        }

        // Analyze strategy cancel_all calls
        if(line.includes('strategy.cancel_all(')){
          const params = extractParameters(line);
          
          // Extract when cancel alls
          if(version === 4){
            let whenCancelAll = null;
            const whenMatch = line.match(/when\s*=\s*([^,)]+)/);
            if (whenMatch) {
              whenCancelAll = whenMatch[1].trim();
            }
            else{
              // Extract first parameter as when if it doesn't contain '='
              if (params.length >= 1 && !params[0].includes('=')) {
                whenCancelAll = params[0].trim();
              }
            }
            whenCancelAlls[i] = whenCancelAll;
          }

        }
      }
    }
    
    // Now, change the strategy lines
    const result = [...lines];
    let insertedLines = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const currentIndex = i + insertedLines;
      const tostringPrefix = version === 4 ? "tostring" : "str.tostring";
      
      // Change strategy.entry and strategy.order lines
      if (line.includes('strategy.entry(') || line.includes('strategy.order(')) {
        const indentation = getIndentation(line);
        const id = idEntries[i];
        const direction = directions[i];
        const quantity = quantities[i];
        const limit = limits[i];
        const stop = stops[i];
        const ocaName = ocaNames[i];
        const ocaType = ocaTypes[i];
        const comment = comments[i];
        const when = whenEntries[i];
        
        if (direction) {
          // Determine book value based on direction
          let book = "";
          if (direction === "strategy.long") {
            book = "b=long";
          } else{
            book = "b=short";
          }

          const idStr = id ? `"id=" + ${tostringPrefix}(${id}) + " " + ` : "";
          const quantityStr = quantity ? ` + " q=" + ${tostringPrefix}(${quantity})` : ` + "q=" + ${tostringPrefix}(quantity)`;
          const orderType = limit ? "t=limit" : "t=market";
          const limitStr = limit ? ` + amp + " px=" + ${tostringPrefix}(${limit})` : "";
          const stopStr = stop ? ` + amp + " fsl=" + ${tostringPrefix}(${stop})` : "";

          const entryContents = version === 4 ? `${id?`id=${id},`:""}${direction?`long=${direction},`:""}${quantity?`qty=${quantity},`:""}${limit?`limit=${limit},`:""}${stop?`stop=${stop},`:""}${ocaName?`oca_name=${ocaName},`:""}${ocaType?`oca_type=${ocaType},`:""}${comment?`comment=${comment},`:""}${when?`when=${when},`:""}` : `${id?`id=${id},`:""}${direction?`direction=${direction},`:""}${quantity?`qty=${quantity},`:""}${limit?`limit=${limit},`:""}${stop?`stop=${stop},`:""}${ocaName?`oca_name=${ocaName},`:""}${ocaType?`oca_type=${ocaType},`:""}${comment?`comment=${comment},`:""}`;  
          const alertMessage = `alertMode + "e=" + exchange + " " + account + " " + ${idStr}"s=" + symbol + " " + "${book}" + " " + "${orderType}" + " "${quantityStr} + unit${limitStr}${stopStr}`;
          const entryLine = `${indentation}strategy.entry(${entryContents}alert_message=${alertMessage})`;
          const orderLine = `${indentation}strategy.order(${entryContents}alert_message=${alertMessage})`;
          if (line.includes('strategy.entry(')){
            result.splice(currentIndex, 1, entryLine);
            insertedLines++;
          }
          else{
            result.splice(currentIndex, 1, orderLine);
            insertedLines++;
          }
        }
      }
      
      // Change strategy.exit lines
      if (line.includes('strategy.exit(')) {
        const indentation = getIndentation(line);
        const id = idExits[i];
        const fromEntry = fromEntries[i];
        const qty = exitQuantities[i];
        const qtyPercent = qtyPercentages[i];
        const exitTP = exitTPs[i];
        const exitLimit = exitLimits[i];
        const exitLoss = exitLosses[i];
        const exitStop = exitStops[i];
        const trailPoints = exitTrailPoints[i];
        const trailPrice = exitTrails[i];
        const trailOffset = exitTrailOffsets[i];
        const ocaName = exitOcaNames[i];
        const comment = exitComments[i];
        const commentProfit = commentProfits[i];
        const commentLoss = commentLosses[i];
        const commentTrailing = commentTrailings[i];
        const alertProfit = alertProfits[i];
        const alertLoss = alertLosses[i];
        const alertTrailing = alertTrailings[i];
        const when = whenExits[i];
        
        if (exitTP || exitLimit || exitLoss || exitStop || trailPoints || trailPrice || trailOffset) {
          let takeProfit = "";
          let stopLoss = "";
          const idStr = id ? `"id=" + ${tostringPrefix}(${id}) + " " + ` : "";
          const qtyStr = qty ? ` + "q=" + ${tostringPrefix}(${qty})` : qtyPercent ? ` + "q=" + ${tostringPrefix}(${qtyPercent}) + "%"` : "";
          
          if (exitTP && !exitLimit) {
            takeProfit = ` + amp + " ftp=" + ${tostringPrefix}(${exitTP}*syminfo.mintick)`;
          } else if (exitLimit) {
            takeProfit = ` + amp + " ftp=" + ${tostringPrefix}(${exitLimit})`;
          }
          
          if (exitLoss && !exitStop) {
            stopLoss = ` + amp + " fsl=" + ${tostringPrefix}(${exitLoss}*syminfo.mintick)`;
          } else if (exitStop) {
            stopLoss = ` + amp + " fsl=" + ${tostringPrefix}(${exitStop})`;
          }

          // Handle trailing stop parameters
          let trailingStopPrice = "";
          if (trailPoints && !trailPrice) {
            trailingStopPrice = ` + amp + " fts=" + ${tostringPrefix}(${trailPoints}*syminfo.mintick)`;
          } else if (trailPrice) {
            trailingStopPrice = ` + amp + " fts=" + ${tostringPrefix}(${trailPrice})`;
          }
          
          let trailingStopActivation = "";
          if (trailOffset && (trailPrice || trailPoints)) {
            trailingStopActivation = ` + amp + " ftsx=" + ${tostringPrefix}(${trailOffset}*syminfo.mintick)`;
          }
          
          if (takeProfit || stopLoss || trailingStopPrice || trailingStopActivation) {
            const alertMessage = `alertMode + "e=" + exchange + " " + account + " " + ${idStr}"s=" + symbol${qtyStr}${takeProfit}${stopLoss}${trailingStopPrice}${trailingStopActivation}`;
            const exitContents = version === 4 ? `${id?`id=${id},`:""}${fromEntry?`from_entry=${fromEntry},`:""}${qty?`qty=${qty},`:""}${qtyPercent?`qty_percent=${qtyPercent},`:""}${exitTP?`profit=${exitTP},`:""}${exitLimit?`limit=${exitLimit},`:""}${exitLoss?`loss=${exitLoss},`:""}${exitStop?`stop=${exitStop},`:""}${trailPrice?`trail_price=${trailPrice},`:""}${trailPoints?`trail_points=${trailPoints},`:""}${trailOffset?`trail_offset=${trailOffset},`:""}${ocaName?`oca_name=${ocaName},`:""}${comment?`comment=${comment},`:""}${when?`when=${when},`:""}` : `${id?`id=${id},`:""}${fromEntry?`from_entry=${fromEntry},`:""}${qty?`qty=${qty},`:""}${qtyPercent?`qty_percent=${qtyPercent},`:""}${exitTP?`profit=${exitTP},`:""}${exitLimit?`limit=${exitLimit},`:""}${exitLoss?`loss=${exitLoss},`:""}${exitStop?`stop=${exitStop},`:""}${trailPrice?`trail_price=${trailPrice},`:""}${trailPoints?`trail_points=${trailPoints},`:""}${trailOffset?`trail_offset=${trailOffset},`:""}${ocaName?`oca_name=${ocaName},`:""}${comment?`comment=${comment},`:""}${commentProfit?`comment_profit=${commentProfit},`:""}${commentLoss?`comment_loss=${commentLoss},`:""}${commentTrailing?`comment_trailing=${commentTrailing},`:""}${alertProfit?`alert_profit=${alertProfit},`:""}${alertLoss?`alert_loss=${alertLoss},`:""}${alertTrailing?`alert_trailing=${alertTrailing},`:""}`;
            const exitLine = `${indentation}strategy.exit(${exitContents}alert_message=${alertMessage})`;
            result.splice(currentIndex, 1, exitLine);
            insertedLines++;
          }
        }
      }
      
      // Change strategy.close lines
      if (line.includes('strategy.close(')) {
        const id = idCloses[i];
        const when = whenCloses[i];
        const comment = commentCloses[i];
        const qty = qtyCloses[i];
        const qtyPercent = qtyPercentCloses[i];
        const immediately = immediatelyCloses[i];

        const idStr = id ? ` + "id=" + ${id} + " " + ` : "";
        const qtyStr = qty ? ` + "q=" + ${tostringPrefix}(${qty})` : qtyPercent ? ` + "q=" + ${tostringPrefix}(${qtyPercent}) + "%"` : "";
        const indentation = getIndentation(line);
        const alertMessage = `alertMode + "e=" + exchange + " " + account + " "${idStr}"s=" + symbol + " c=position"${qtyStr}`;
        const closeContents = version === 4 ? `${id?`id=${id},`:""}${when?`when=${when},`:""}${comment?`comment=${comment},`:""}${qty?`qty=${qty},`:""}${qtyPercent?`qty_percent=${qtyPercent},`:""}` : `${id?`id=${id},`:""}${comment?`comment=${comment},`:""}${qty?`qty=${qty},`:""}${qtyPercent?`qty_percent=${qtyPercent},`:""}${immediately?`immediately=${immediately},`:""}`;
        const closeLine = `${indentation}strategy.close(${closeContents}alert_message=${alertMessage})`;
        result.splice(currentIndex, 1, closeLine);
        insertedLines++;
      }

      // Change strategy.close_all lines
      if (line.includes('strategy.close_all(')) {
        const when = whenCloseAlls[i];
        const comment = commentCloseAlls[i];

        const alertMessage = `alertMode + "e=" + exchange + " " + account + " " +"s=" + symbol + " c=position"`;
        const closeAllContents = version === 4 ? `${when?`when=${when},`:""}${comment?`comment=${comment},`:""}` : `${comment?`comment=${comment},`:""}`;
        const closeAllLine = `${indentation}strategy.close_all(${closeAllContents}alert_message=${alertMessage})`;
        result.splice(currentIndex, 1, closeAllLine);
        insertedLines++;
      }

      // Change strategy.cancel lines
      if(line.includes('strategy.cancel(')){
        const indentation = getIndentation(line);
        const id = idCancels[i];
        const when = whenCancels[i];
        const whenCondition = `if(${when})`;

        const idStr = id ? ` + "id=" + ${id} + " " + ` : "";
        const alertMessage = `alertMode + "e=" + exchange + " " + account + " "${idStr}"s=" + symbol + " c=order"`;
        const cancelLine = `${when?`${indentation}${whenCondition}\n${indentation}    `:""}alert(${alertMessage})`;
        result.splice(currentIndex + 1, 0, cancelLine);
        insertedLines++;
      }

      // Change strategy.cancel_all lines
      if(line.includes('strategy.cancel_all(')){
        const indentation = getIndentation(line);
        const when = whenCancelAlls[i];
        const whenCondition = `if(${when})`;

        const alertMessage = `alertMode + "e=" + exchange + " " + account + " " + "s=" + symbol + " c=order"`;
        const cancelAllLine = `${when?`${indentation}${whenCondition}\n${indentation}    `:""}alert(${alertMessage})`;
        result.splice(currentIndex + 1, 0, cancelAllLine);
        insertedLines++;
      }
      
    }
    
    return result;
    
  };

  // Helper function to extract parameters from a function call
  const extractParameters = (line) => {
    // Extract content within the outermost parentheses
    const match = line.match(/\(([^]*)\)/);
    if (!match) return [];
    
    const paramsStr = match[1];
    const params = [];
    
    let currentParam = '';
    let parenLevel = 0;
    let inString = false;
    let stringChar = '';
    
    // Process the parameter string character by character
    for (let i = 0; i < paramsStr.length; i++) {
      const char = paramsStr[i];
      
      // Handle string literals (don't count parentheses or commas inside strings)
      if ((char === '"' || char === "'") && (i === 0 || paramsStr[i-1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      // Track parentheses nesting level outside of strings
      if (!inString) {
        if (char === '(') parenLevel++;
        else if (char === ')') parenLevel--;
      }
      
      // Split on commas only when at the top level (parenLevel === 0)
      if (char === ',' && parenLevel === 0 && !inString) {
        params.push(currentParam.trim());
        currentParam = '';
      } else {
        currentParam += char;
      }
    }
    
    // Add the last parameter
    if (currentParam.trim()) {
      params.push(currentParam.trim());
    }
    
    return params;
  };

  // Helper function to get the indentation of a line
  const getIndentation = (line) => {
    const match = line.match(/^(\s*)/);
    return match ? match[1] : '';
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputCode)
      .then(() => {
        setMessage({ text: 'Code copied to clipboard!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      })
      .catch(err => {
        setMessage({ text: 'Failed to copy: ' + err, type: 'error' });
      });
  };

  const trimAllSpaces = (str) => {
    return str.trim().replace(/\s+/g, '');
  };

  return (
    <div style={{ 
      backgroundColor: theme.background, 
      minHeight: '100vh', 
      padding: '20px',
      color: theme.textPrimary,
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h1 style={{ 
            color: theme.textPrimary, 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginBottom: '1rem',
            borderBottom: `2px solid ${theme.orange}`,
            paddingBottom: '10px',
            flexGrow: 1,
            textAlign: 'center'
          }}>
            Trading Strategy Code Processor
          </h1>
          
          <button 
            className="theme-toggle"
            style={{ color: theme.textPrimary }}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            border: `1px solid ${theme.border}`, 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: theme.cardBg,
            boxShadow: theme.shadow,
            transition: 'background-color 0.3s, border-color 0.3s, box-shadow 0.3s'
          }}>
            <h2 style={{ 
              color: theme.textPrimary, 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '1rem'
            }}>
              Input Code
            </h2>
            <textarea 
              style={{
                width: '100%', 
                height: '400px', 
                padding: '12px', 
                border: `1px solid ${theme.border}`, 
                borderRadius: '4px', 
                fontFamily: 'monospace', 
                fontSize: '0.9rem',
                resize: 'vertical',
                backgroundColor: theme.inputBg,
                color: theme.textPrimary,
                transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
              }}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste your trading strategy code here..."
            />
            <button 
              style={{
                marginTop: '15px', 
                backgroundColor: theme.orange, 
                color: theme.white, 
                padding: '10px 16px', 
                borderRadius: '4px', 
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgb(232, 94, 0)'}
              onMouseOut={(e) => e.target.style.backgroundColor = theme.orange}
              onClick={processCode}
            >
              Process Code
            </button>
          </div>
          
          <div style={{ 
            border: `1px solid ${theme.border}`, 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: theme.cardBg,
            boxShadow: theme.shadow,
            transition: 'background-color 0.3s, border-color 0.3s, box-shadow 0.3s'
          }}>
            <h2 style={{ 
              color: theme.textPrimary, 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '1rem'
            }}>
              Output Code
            </h2>
            <textarea 
              style={{
                width: '100%', 
                height: '400px', 
                padding: '12px', 
                border: `1px solid ${theme.border}`, 
                borderRadius: '4px', 
                fontFamily: 'monospace', 
                fontSize: '0.9rem',
                resize: 'vertical',
                backgroundColor: outputCode ? theme.inputBg : theme.emptyInputBg,
                color: theme.textPrimary,
                transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
              }}
              value={outputCode}
              readOnly
            />
            <button 
              style={{
                marginTop: '15px', 
                backgroundColor: outputCode ? theme.orange : theme.elephant, 
                color: theme.white, 
                padding: '10px 16px', 
                borderRadius: '4px', 
                border: 'none',
                fontWeight: '500',
                cursor: outputCode ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (outputCode) e.target.style.backgroundColor = 'rgb(232, 94, 0)';
              }}
              onMouseOut={(e) => {
                if (outputCode) e.target.style.backgroundColor = outputCode ? theme.orange : theme.elephant;
              }}
              onClick={copyToClipboard}
              disabled={!outputCode}
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
        
        {message.text && (
          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            borderRadius: '4px', 
            backgroundColor: message.type === 'error' 
              ? (darkMode ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2') 
              : (darkMode ? 'rgba(4, 120, 87, 0.2)' : '#ecfdf5'),
            color: message.type === 'error' 
              ? (darkMode ? '#f87171' : '#b91c1c') 
              : (darkMode ? '#6ee7b7' : '#047857'),
            border: message.type === 'error' 
              ? (darkMode ? '1px solid rgba(248, 113, 113, 0.4)' : '1px solid #fecaca') 
              : (darkMode ? '1px solid rgba(110, 231, 183, 0.4)' : '1px solid #a7f3d0'),
            transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
          }}>
            {message.text}
          </div>
        )}
        
        <div style={{
          marginTop: '30px',
          color: theme.textPrimary,
          padding: '15px',
          borderRadius: '8px',
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9',
          border: `1px solid ${theme.border}`,
          transition: 'background-color 0.3s, color 0.3s, border-color 0.3s'
        }}>
          <h3 style={{ fontWeight: '600', marginBottom: '10px' }}>Instructions:</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '6px' }}>Paste your TradingView Pine Script in the input area</li>
            <li style={{ marginBottom: '6px' }}>The script must be a strategy (containing a strategy() function)</li>
            <li style={{ marginBottom: '6px' }}>The script must be version 4 or higher</li>
            <li style={{ marginBottom: '6px' }}>Click "Process Code" to add AutoView alert syntax</li>
            <li style={{ marginBottom: '6px' }}>Copy the processed code from the output area</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TradingCodeProcessor;
