from grpc_client import get_option_prices, get_monte_carlo_prices

def calculate_option_prices(data):
    return get_option_prices(data)

def calculate_monte_carlo(data):
    return get_monte_carlo_prices(data)
