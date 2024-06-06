import dotenv from "dotenv";
import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

dotenv.config();

const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, "../proto/message.proto")
);
const messageProto = grpc.loadPackageDefinition(packageDefinition) as any;

const MessageServices = messageProto.JobServices as grpc.ServiceClientConstructor;

const MessageClient = new MessageServices(
    `0.0.0.0:${process.env.MESSAGE_PORT}`,
    grpc.credentials.createInsecure()
);

export { MessageClient };
