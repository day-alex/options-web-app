import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '../../protos/options.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDefinition) as any;
const OptionsService = grpcObject.Options;
const client = new OptionsService(
  '127.0.0.1:50051',
  grpc.credentials.createInsecure()
);

export function getOptionPrices(input: {
  S: number;
  K: number;
  T: number;
  R: number;
  V: number;
}): Promise<{ c: number; p: number }> {
  console.log('Attempting to connect to gRPC server on 127.0.0.1:50051');
  console.log('--> Sending to gRPC with input:', input);
  return new Promise((resolve, reject) => {
    client.BlackScholes(input, (err: grpc.ServiceError, response: any) => {
      if (err) {
        console.error('gRPC error:', err);
        reject(err);
      } else {
        console.log('<-- gRPC response:', response);
        resolve(response);
      }
    });
  });
}
