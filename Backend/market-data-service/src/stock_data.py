from vnstock import Vnstock
import json
import sys
import datetime

def get_ohlcv(symbol, start_date, end_date, interval='1D'):
    try:
        # Initialize vnstock
        stock = Vnstock().stock(symbol=symbol, source='VCI')
        
        # Get historical data
        df = stock.quote.history(start=start_date, end=end_date, interval=interval)
        
        # Convert DataFrame to list of dictionaries
        data = df.to_dict('records')
        
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
        print(json.dumps({'error': str(e)}))
        return 1

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(json.dumps({'error': 'Invalid arguments'}))
        sys.exit(1)
    
    symbol = sys.argv[1]
    start_date = sys.argv[2]
    end_date = sys.argv[3]
    
    sys.exit(get_ohlcv(symbol, start_date, end_date)) 