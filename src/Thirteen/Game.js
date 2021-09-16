import { useEffect, useState }from 'react';
import { socket } from './Thirteen';
import shuffle from '../utils/shuffle';
import cardDeck from '../utils/cardDeck';

const Game = (props) => {

    const [room, setRoom] = useState();
    const [player, setPlayer] = useState();
    const [users, setUsers] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [player1Deck, setP1Deck] = useState([]);
    const [player2Deck, setP2Deck] = useState([]);
    const [player3Deck, setP3Deck] = useState([]);
    const [player4Deck, setP4Deck] = useState([]);

    useEffect(() => {
        socket.on('set-room', (room, users)=> {
            setRoom(room);
            setUsers(users)
    
            for(var i = 0; i < users.length; i++){
                if(socket.id === users[i].id){
                    setPlayer(users[i].name);
                }
            }

            //If they're player one they shuffle and pass out deck
            if(socket.id === users[0].id){
                const shuffledCards = shuffle(cardDeck);

                const p1 = shuffledCards.splice(0,13);
                const p2 = shuffledCards.splice(0,13);
                const p3 = shuffledCards.splice(0,13);
                const p4 = shuffledCards.splice(0,13);

                socket.emit('init-data', {p1: p1, p2: p2, p3: p3, p4: p4});
            }
        });

        socket.on('init-game', (data) => {
            setP1Deck(data.p1);
            setP2Deck(data.p2);
            setP3Deck(data.p3);
            setP4Deck(data.p4);
        });

    }
 );
    /*
    constructor(props){
        super(props);

        this.state = {
            gameOver: false,
            winner: [],
            decks: [[]],
            turn: 1,
            round: [],
            out: [],
       };
    }
    */

    useEffect(() => {
                
    }, [])

    return(
        <div>
            <h1>Game Room</h1>
                <button onClick={() => socket.emit('start')}>START</button>
        </div>
    );

//Do something like this for your conditional rendering
    /*
    let x = 1;
    if(x){
        return(
            <Test />
        );
    }
    else{
        return(
            <Test2 />
        );
    }
    */
}

function Test(){
    return(
        <div>
            <h1>Test 1</h1>
        </div>
    );
} 

function Test2(){
    return(
        <div>
            <h1>Test 2</h1>
        </div>
    );
}

export default Game;
