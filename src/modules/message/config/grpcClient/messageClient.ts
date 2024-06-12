import dotenv from "dotenv";
import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

dotenv.config();

const PROTO_PATH = path.join(__dirname, "../proto/message.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const messageProto = grpc.loadPackageDefinition(packageDefinition) as any;

const MessageServices = messageProto.MessageServices as grpc.ServiceClientConstructor;


const MESSAGE_PORT = process.env.MESSAGE_PORT

const MessageClient = new MessageServices(
    `0.0.0.0:${MESSAGE_PORT}`,
    grpc.credentials.createInsecure()
);

export { MessageClient };
