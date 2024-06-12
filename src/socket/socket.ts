import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import amqp from 'amqplib';

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
            console.log('join------------');
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

        socket.on('sendMessage', (data) => {
            console.log('Message received: ', data);
            const { chatId, userId, message } = data;
            const newMessage = { chatId, sender: userId, message, createdAt: new Date().toISOString() };
            channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)));
            io.emit('message', newMessage);
        });
    });

    return io;
};

export default setupSocket;
