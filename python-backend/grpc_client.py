import grpc
from generated import options_pb2
from generated import options_pb2_grpc


def get_option_prices(data):
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = options_pb2_grpc.OptionsStub(channel)

        request = options_pb2.OptionInputs(
            S=float(data['spot']),
            K=float(data['strike']),
            T=float(data['exp']),
            R=float(data['rate']),
            V=float(data['vol'])
        )

        response = stub.BlackScholes(request)

        return response


def get_monte_carlo_prices(data):
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = options_pb2_grpc.OptionsStub(channel)

        request = options_pb2.MonteCarloInputs(
            S=float(data['spot']),
            K=float(data['strike']),
            T=float(data['exp']),
            R=float(data['rate']),
            V=float(data['vol']),
            num_paths=int(data.get('num_paths', 100000)),
            num_steps=int(data.get('num_steps', 252)),
            num_vis_paths=int(data.get('num_vis_paths', 50)),
        )

        response = stub.MonteCarlo(request)

        return response
