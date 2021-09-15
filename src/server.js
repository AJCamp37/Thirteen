const {addUser, removeUser, getUser, getUsersInRoom} = require('./users');
const app = require('express')();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
    cors:{
        origin: ['http://localhost:3000'],
    },
});

io.on('connection', socket => {
    console.log('New client connected ' + socket.id);

    socket.on('join-room', (room, cb) => {
        let usersInRoom = getUsersInRoom(room).length;
        //you can probably get rid of the if statement
        if(usersInRoom === 0){
            const { newUser} = addUser({
                id: socket.id,
                name: 'Player 1',
                room: room
            });
            socket.join(room);
            console.log(newUser);
        }
        else{
            const { error, newUser } = addUser({
                id: socket.id,
                name: `Player ${usersInRoom + 1}`,
                room: room
            });
            //Call callback with true so that it will not redirect to the game room
            //but instead ask for a different code
            if(error)
                cb(error);
            else
                console.log(newUser);
            socket.join(room);
            io.to(room).emit('initGame', {room: room, users: getUsersInRoom(room)});
        }
        console.log(getUsersInRoom(room));
        //Call callback with false so that it will redirect to game room
        cb(false);
    });
    socket.on('start', () => {
        let room = getUser(socket.id).room;
        let users = getUsersInRoom(room);
        io.to(room).emit('set-room', room, users);
    })
})

httpServer.listen(4000, () => console.log(`Listening on port 4000`));
