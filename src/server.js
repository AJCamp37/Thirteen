const app = require('express')();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
    cors:{
        origin: ['http://localhost:3000'],
    },
});

io.on('connection', socket => {
    console.log('New client connected ' + socket.id);

    socket.on('custom-event', (string1, string2, number) => {
        console.log(string1 + ' + ' + string2 + ' = ' + number);
    })

    socket.on('joined', (id, cb) =>{
        console.log(`Player ${id} successfully joined the game!!!!`);
        cb(socket.id);
    })

    socket.on('disconnect', socket => {
        console.log(`A player has disconnected`);
    })

    socket.on('join-room', (room, cb) => {
        socket.join(room);
        socket.to(room).emit('joined');
        cb();
    })
})


httpServer.listen(4000, () => console.log(`Listening on port 4000`));
