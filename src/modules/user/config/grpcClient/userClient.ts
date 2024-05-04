import dotenv from "dotenv";
import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

dotenv.config();

const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, "../proto/user.proto")
);
const userProto = grpc.loadPackageDefinition(packageDefinition) as any;

const UserServices = userProto.UserServices as grpc.ServiceClientConstructor;

const UserClient = new UserServices(
  `0.0.0.0:${process.env.USER_PORT}`,
  grpc.credentials.createInsecure()
);

export { UserClient };
