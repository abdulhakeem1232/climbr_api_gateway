import dotenv from "dotenv";
import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

dotenv.config();

const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, "../proto/post.proto"));
const recruiterProto = grpc.loadPackageDefinition(packageDefinition) as any;

const PostServices = recruiterProto.PostServices as grpc.ServiceClientConstructor;

const clientOptions: grpc.ChannelOptions = {
    'grpc.max_receive_message_length': 300 * 1024 * 1024,
    'grpc.max_send_message_length': 300 * 1024 * 1024
};
const Domain = process.env.NODE_ENV === 'dev' ? "0.0.0.0" : process.env.PRO_DOMAIN_POST

const PostClient = new PostServices(
    `${Domain}:${process.env.POST_PORT}`,
    grpc.credentials.createInsecure(),
    clientOptions
);

export { PostClient };
