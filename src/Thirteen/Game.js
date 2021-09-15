import { useEffect, useState }from 'react';
import { socket } from './Thirteen';
import shuffle from '../utils/shuffle';
import cardDeck from '../utils/cardDeck';

const Game = (props) => {

    const [room, setRoom] = useState();
    const [num, setNum] = useState();
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
            //////////////////////////////////////////////
            //Make it so if the user is the 1st in the list then he shuffles the decks
            //and then emits the data so every other player is synced as well
            //They each know their own socket.id so use that 
        })
        //Start up the game data
        socket.emit('init', {room, users});
    });
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
        const shuffledCards = shuffle(cardDeck);

        const deck1 = shuffledCards.splice(0, 13);
        const deck2 = shuffledCards.splice(0, 13);
        const deck3 = shuffledCards.splice(0, 13);
        const deck4 = shuffledCards.splice(0, 13);

        
        setP1Deck(deck1);
        setP2Deck(deck1);
        setP3Deck(deck1);
        setP4Deck(deck1);
        
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
