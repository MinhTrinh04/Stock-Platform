from vnstock import Vnstock, Listing
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

def get_company_info(symbol):
    try:
        # Initialize vnstock
        stock = Vnstock().stock(symbol=symbol, source='VCI')
        
        # Get company overview
        company_info = stock.company.overview()
        
        # Convert to dictionary and handle datetime
        data = company_info.to_dict('records')[0]
        for key, value in data.items():
            if isinstance(value, datetime.datetime):
                data[key] = value.strftime('%Y-%m-%d %H:%M:%S')
            elif isinstance(value, (int, float)):
                data[key] = float(value)
        
        print(json.dumps(data))
        return 0
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        return 1

def get_financial_data(symbol, period_type, statement_type):
    try:
        # Initialize vnstock
        stock = Vnstock().stock(symbol=symbol, source='VCI')
        
        # Get financial data based on statement type
        if statement_type == 'balance':
            df = stock.finance.balance_sheet(period=period_type, lang='en', dropna=True)
        elif statement_type == 'income':
            df = stock.finance.income_statement(period=period_type, lang='en', dropna=True)
        elif statement_type == 'cashflow':
            df = stock.finance.cash_flow(period=period_type, dropna=True)
        else:
            raise ValueError(f"Invalid statement type: {statement_type}")
        
        # Convert DataFrame to list of dictionaries
        data = df.to_dict('records')
        
        # Format the data
        formatted_data = []
        for row in data:
            formatted_row = {}
            for key, value in row.items():
                if isinstance(value, datetime.datetime):
                    formatted_row[key] = value.strftime('%Y-%m-%d %H:%M:%S')
                elif isinstance(value, (int, float)):
                    formatted_row[key] = float(value)
                else:
                    formatted_row[key] = value
            formatted_data.append(formatted_row)
        
        print(json.dumps(formatted_data))
        return 0
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        return 1

def get_market_indices():
    try:
        # Get market indices
        indices = Listing().market_indices()
        
        # Convert DataFrame to list of dictionaries
        data = indices.to_dict('records')
        
        # Format the data
        formatted_data = []
        for row in data:
            formatted_row = {}
            for key, value in row.items():
                if isinstance(value, (int, float)):
                    formatted_row[key] = float(value)
                else:
                    formatted_row[key] = value
            formatted_data.append(formatted_row)
        
        print(json.dumps(formatted_data))
        return 0
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        return 1

def get_all_symbols():
    try:
        # Get all symbols
        symbols = Listing().all_symbols()
        
        # Convert DataFrame to list of dictionaries
        data = symbols.to_dict('records')
        
        # Format the data
        formatted_data = []
        for row in data:
            formatted_row = {}
            for key, value in row.items():
                if isinstance(value, (int, float)):
                    formatted_row[key] = float(value)
                else:
                    formatted_row[key] = value
            formatted_data.append(formatted_row)
        
        print(json.dumps(formatted_data))
        return 0
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Invalid arguments'}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'ohlcv':
        if len(sys.argv) != 5:
            print(json.dumps({'error': 'Invalid arguments for OHLCV'}))
            sys.exit(1)
        symbol = sys.argv[2]
        start_date = sys.argv[3]
        end_date = sys.argv[4]
        sys.exit(get_ohlcv(symbol, start_date, end_date))
    
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