const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');

const { Server } = require('socket.io');

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods:["Get", "POST"]
    }
});

io.on('connect', (socket) => {
    console.log('user has connected:', socket.id);

    socket.on('join_channel', (data) => {//data pass name and channel name from front end
        socket.join(data)
        console.log(`User with ID: ${socket.id} has entered room: ${data}`)
    });

    socket.on('send_message', (data) => {
        socket.to(data.channel).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('user has disconnected:', socket.id);
    });

    socket.emit("me", socket.id);

    socket.on('join_call', (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id}`);
        socket.emit("me", socket.id);
        socket.broadcast.emit("new-user", socket.id);
    })

    socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})

});

server.listen(5000, () => {
    console.log('server is up')
});