import React from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');
socket.on('connect', () => {
    console.log(`Your id is: ${socket.id}`);
})

socket.emit('custom-event', 'Mina', 'Sana', 37);

export default class Thirteen extends React.Component{

    render(){
        return(
            <h1>Hello Hoe</h1>
        );
    }
}
