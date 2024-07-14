import dotenv from "dotenv";
import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

dotenv.config();

const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, "../proto/recruiter.proto")
);
const recruiterProto = grpc.loadPackageDefinition(packageDefinition) as any;

const RecuiterServices = recruiterProto.RecuiterServices as grpc.ServiceClientConstructor;
const Domain = process.env.NODE_ENV === 'dev' ? "0.0.0.0" : process.env.PRO_DOMAIN_RECRUITER

const RecruiterClient = new RecuiterServices(
  `${Domain}:${process.env.RECRUITER_PORT}`,
  grpc.credentials.createInsecure()
);

export { RecruiterClient };
