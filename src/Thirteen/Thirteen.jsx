import React from 'react';
import { io } from 'socket.io-client';

//Homepage

const socket = io('http://localhost:4000');
socket.on('connect', () => {
    console.log(`Your id is: ${socket.id}`);
});

//Don't need
socket.on('joined', () => {
    console.log('A new user joined');
});

export default class Thirteen extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            room: ''
        };
    
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(event){
        const target = event.target;
        const name = target.name;
        const value = target.value;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(event){
        //Redirects user to the game room
        socket.emit('join-room', this.state.room, (error) => {
            if(error){
                alert('That room is Full! Please choose another room');
            }
            else{
                this.props.history.push(`/room=${this.state.room}`);
            }
        });

       event.preventDefault();
    }

    render(){
        return(
            <div onSubmit={this.handleSubmit}>
                <form>
                    <label>
                        Room:
                        <input type='text' name='room' onChange={this.handleInputChange}  />
                     </label>
                     <input type='submit' value='Join' />
                </form>
            </div>
        );
    }
}

export { socket };
