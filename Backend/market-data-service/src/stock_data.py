from vnstock import Vnstock, Listing
import json
import sys
import datetime
import traceback

def get_ohlcv(symbol, start_date, end_date, interval='1D', market_type='stock'):
    try:
        print(f"Fetching OHLCV data for {symbol} from {start_date} to {end_date}", file=sys.stderr)
        
        if market_type == 'stock':
            # Initialize vnstock for Vietnamese stocks
            stock = Vnstock().stock(symbol=symbol, source='VCI')
            print(f"Stock object created successfully", file=sys.stderr)
            
            # Get historical data
            df = stock.quote.history(start=start_date, end=end_date, interval=interval)
        elif market_type == 'crypto':
            # Initialize vnstock for cryptocurrency
            crypto = Vnstock().crypto(symbol=symbol, source='MSN')
            print(f"Crypto object created successfully", file=sys.stderr)
            
            # Get historical data
            df = crypto.quote.history(start=start_date, end=end_date, interval=interval)
        elif market_type == 'forex':
            # Initialize vnstock for forex
            fx = Vnstock().fx(symbol=symbol, source='MSN')
            print(f"Forex object created successfully", file=sys.stderr)
            
            # Get historical data
            df = fx.quote.history(start=start_date, end=end_date, interval=interval)
        else:
            raise ValueError(f"Invalid market type: {market_type}")
        
        print(f"Historical data retrieved successfully", file=sys.stderr)
        
        # Convert DataFrame to list of dictionaries
        data = df.to_dict('records')
        print(f"Data converted to records", file=sys.stderr)
        
        # Format the data
        formatted_data = []
        for row in data:
            formatted_data.append({
                'timestamp': row['time'].strftime('%Y-%m-%d %H:%M:%S'),
                'open': float(row['open']),
                'high': float(row['high']),
                'low': float(row['low']),
                'close': float(row['close']),
                'volume': float(row['volume'])
            })
        
        print(json.dumps(formatted_data))
        return 0
    except Exception as e:
        error_msg = f"Error in get_ohlcv: {str(e)}\n{traceback.format_exc()}"
        print(error_msg, file=sys.stderr)
        print(json.dumps({'error': str(e)}))
        return 1


if __name__ == "__main__":
    try:
        print(f"Total arguments: {len(sys.argv)}", file=sys.stderr)
        print(f"Arguments: {sys.argv}", file=sys.stderr)
        
        if len(sys.argv) < 5:
            print(json.dumps({'error': 'Invalid arguments'}))
            sys.exit(1)
        
        command = sys.argv[1]
        print(f"Executing command: {command}", file=sys.stderr)
        
        if command == 'ohlcv':
            symbol = sys.argv[2]
            start_date = sys.argv[3]
            end_date = sys.argv[4]
            interval = sys.argv[5] if len(sys.argv) > 5 else '1D'
            market_type = sys.argv[6] if len(sys.argv) > 6 else 'stock'
            print(f"Arguments: symbol={symbol}, start_date={start_date}, end_date={end_date}, interval={interval}, market_type={market_type}", file=sys.stderr)
            sys.exit(get_ohlcv(symbol, start_date, end_date, interval, market_type))
        
        elif command == 'company':
            if len(sys.argv) != 3:
                print(json.dumps({'error': 'Invalid arguments for company info'}))
                sys.exit(1)
            symbol = sys.argv[2]
            sys.exit(get_company_info(symbol))
        
        elif command == 'financial':
            if len(sys.argv) != 5:
                print(json.dumps({'error': 'Invalid arguments for financial data'}))
                sys.exit(1)
            symbol = sys.argv[2]
            period_type = sys.argv[3]
            statement_type = sys.argv[4]
            sys.exit(get_financial_data(symbol, period_type, statement_type))
        
        elif command == 'indices':
            sys.exit(get_market_indices())
        
        elif command == 'symbols':
            sys.exit(get_all_symbols())
        
        else:
            print(json.dumps({'error': 'Invalid command'}))
            sys.exit(1)
    except Exception as e:
        error_msg = f"Error in main: {str(e)}\n{traceback.format_exc()}"
        print(error_msg, file=sys.stderr)
        print(json.dumps({'error': str(e)}))
        sys.exit(1) 