import dotenv from "dotenv";
import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

dotenv.config();

const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, "../proto/jobProto.proto")
);
const jobProto = grpc.loadPackageDefinition(packageDefinition) as any;

const JobServices = jobProto.JobServices as grpc.ServiceClientConstructor;

const Domain = process.env.NODE_ENV === 'dev' ? "0.0.0.0" : process.env.PRO_DOMAIN_JOB
const JobClient = new JobServices(
    `${Domain}:${process.env.JOB_PORT}`,
    grpc.credentials.createInsecure()
);

export { JobClient };
