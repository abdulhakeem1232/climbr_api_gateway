import { Channel } from "amqplib";
import rabbitmqConfig from "../config/rabbitmq";
import { randomUUID } from "crypto";
import EventEmitter from "events";

export default class Producer {
    constructor(
        private channel: Channel,
        private replyQueueName: string,
        private eventEmitter: EventEmitter
    ) { }

    async produceMessage(data: any, operation: any) {
        console.log(this.replyQueueName, "replyy driver [-=-=-=-=-=-=-]");

        const uuid = randomUUID();
        this.channel.sendToQueue(
            rabbitmqConfig.queues.messageQueue,
            Buffer.from(JSON.stringify(data)),
            {
                replyTo: this.replyQueueName,
                correlationId: uuid,
                expiration: 10,
                headers: {
                    function: operation,
                },
            }
        );

        return new Promise((res, rej) => {
            this.eventEmitter.once(uuid, async (reply) => {
                try {
                    const replyDataString = Buffer.from(reply.content).toString("utf-8");
                    const replyObject = JSON.parse(replyDataString);
                    res(replyObject);
                } catch (error) {
                    rej(error);
                }
            });
        });
    }
}