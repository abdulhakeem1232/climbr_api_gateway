import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import amqp from 'amqplib';
import messageRabbitclinet from '../rabbitmq/client';

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
            origin: 'https://climbr.site',
            credentials: true
        }
        // cors: {
        //     origin: 'http://localhost:3000',
        //     methods: ['GET', 'POST']
        // }
    });

    // const connection = await amqp.connect('amqp://rabbitmq:5672');
    // const channel = await connection.createChannel();

    // const exchange = 'direct_exchange';
    // const routingKey = 'message_routing_key';

    // await channel.assertExchange(exchange, 'direct', { durable: true });

    const onlineUsers = new Map<string, string>();

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('getOnlineUsers', () => {
            socket.emit('onlineUsers', Array.from(onlineUsers.keys()));
        });

        socket.on('join', (userId) => {
            onlineUsers.set(userId, socket.id);
            broadcastOnlineUsers();
            console.log(`User ${userId} is online`);
        });

        socket.on('leave', (userId) => {
            if (onlineUsers.has(userId)) {
                onlineUsers.delete(userId);
                broadcastOnlineUsers();
            }
        });

        socket.on('disconnect', () => {
            const userId = [...onlineUsers].find(([_, socketId]) => socketId === socket.id)?.[0];
            if (userId) {
                onlineUsers.delete(userId);
                broadcastOnlineUsers();
            }
        });

        socket.on('sendMessage', async (data) => {
            const { chatId, userId, message, filePath, fileType } = data;
            let newMessage = { chatId, sender: userId, message, createdAt: new Date().toISOString(), filePath, fileType };
            if (filePath.trim() !== "") {
                const getObjectParams = {
                    Bucket: bucket_name,
                    Key: filePath,
                }
                const getObjectCommand = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 });
                newMessage.filePath = url
            }
            // channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)));
            const response = await messageRabbitclinet.produce(data, 'chat')
            io.emit('message', newMessage);
            io.emit("sortChatlist", newMessage);
        });

        socket.on('callUser', ({ userToCall, from, offer, fromId }) => {
            console.log(`Incoming call to ${userToCall} from ${from}`);
            const userSocketId = onlineUsers.get(userToCall);
            if (userSocketId) {
                io.to(userSocketId).emit('incomingCall', { from, offer, fromId });
            }
        });

        socket.on('signal', (data) => {
            const { userId, type, candidate, answer, context } = data;
            if (context === 'webRTC') {
                const userSocketId = onlineUsers.get(userId);
                if (userSocketId) {
                    io.to(userSocketId).emit('signal', { type, candidate, answer });
                }
            }
        });

        socket.on('callAccepted', ({ userId, answer, context }) => {
            if (context == 'webRTC') {
                const userSocketId = onlineUsers.get(userId) || ''
                console.log('----------');
                console.log(`Sending call accepted signal to ${userId}${userSocketId}`);
                io.to(userSocketId).emit('callAcceptedSignal', { answer });
            }
        });
        socket.on('callEnded', (guestId) => {
            let userSocketId = onlineUsers.get(guestId) || ''
            io.to(userSocketId).emit('callEndedSignal');
        })
    });

    const broadcastOnlineUsers = () => {
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    };

    return io;
};

export default setupSocket;
