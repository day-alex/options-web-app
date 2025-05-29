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
