import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import amqp from 'amqplib';

const access_key = process.env.ACCESS_KEY
const secret_access_key = process.env.SECRET_ACCESS_KEY
const bucket_region = process.env.BUCKET_REGION
const bucket_name = process.env.BUCKET_NAME

if (!access_key || !secret_access_key) {
    throw new Error("AWS credentials are not provided.");
}
const s3: S3Client = new S3Client({
    credentials: {
        accessKeyId: access_key,
        secretAccessKey: secret_access_key
    },
    region: process.env.BUCKET_REGION
});

const setupSocket = async (server: HTTPServer): Promise<SocketIOServer> => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });

    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchange = 'direct_exchange';
    const routingKey = 'message_routing_key';

    await channel.assertExchange(exchange, 'direct', { durable: true });

    const onlineUsers = new Map<string, string>();

    io.on('connection', (socket) => {
        console.log('A user connected');

        const broadcastOnlineUsers = () => {
            console.log("----------", Array.from(onlineUsers.keys()), 'kkkk', onlineUsers);

            io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        };
        socket.on('getOnlineUsers', () => {
            console.log('00000======');
            socket.emit('onlineUsers', Array.from(onlineUsers.keys()));
        });

        socket.on('join', (userId) => {
            onlineUsers.set(userId, socket.id);
            broadcastOnlineUsers();
            console.log(`User ${userId} is online`);
        });
        // socket.on('reconnect', () => {
        //     const userId = [...onlineUsers].find(([_, socketId]) => socketId === socket.id)?.[0];
        //     if (userId) {
        //         onlineUsers.set(userId, socket.id);
        //         console.log(`User ${userId} has reconnected`);
        //         broadcastOnlineUsers();
        //     }
        // });

        socket.on('leave', (userId) => {
            if (onlineUsers.has(userId)) {
                onlineUsers.delete(userId);
                broadcastOnlineUsers();
                console.log(`User ${userId} is offline`);
            }
        });

        socket.on('disconnect', () => {
            const userId = [...onlineUsers].find(([_, socketId]) => socketId === socket.id)?.[0];
            if (userId) {
                onlineUsers.delete(userId);
                broadcastOnlineUsers();
                console.log(`User ${userId} is offline`);
            }
        });

        socket.on('sendMessage', async (data) => {
            console.log('Message received: ', data);
            const { chatId, userId, message, filePath, fileType } = data;
            let newMessage = { chatId, sender: userId, message, createdAt: new Date().toISOString(), filePath, fileType };
            if (filePath.trim() != "") {
                const getObjectParams = {
                    Bucket: bucket_name,
                    Key: filePath,
                }
                const getObjectCommand = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
                newMessage.filePath = url
            }
            channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)));
            io.emit('message', newMessage);
        });
    });

    return io;
};

export default setupSocket;
