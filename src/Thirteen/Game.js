import { useEffect, useState }from 'react';
import { socket } from './Thirteen';
import shuffle from '../utils/shuffle';
import cardDeck from '../utils/cardDeck';

const Game = (props) => {

    const [gameStart, setGameStart] = useState(false);
    const [room, setRoom] = useState();
    const [player, setPlayer] = useState();
    const [users, setUsers] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [player1Deck, setP1Deck] = useState([]);
    const [player2Deck, setP2Deck] = useState([]);
    const [player3Deck, setP3Deck] = useState([]);
    const [player4Deck, setP4Deck] = useState([]);

    //split these into different useEffects so we get less unneccesary console.logs!!!
    
    useEffect(() => {
        socket.on('initGame', (data) => {
            setUsers(data.users);
            setRoom(data.room);
        });
    }, []);

    useEffect(() => {
        socket.on('start-game', (users)=> {
            setUsers(users);
            for(var i = 0; i < users.length; i++){
                if(socket.id === users[i].id){
                    setPlayer(users[i].name);
                }
            }

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
            setGameStart(true);
        });

    }, []);
    
    //Put your functions to do validation and such here
    ////////////////////////////////////////////////////
    if(gameStart){

    let deck = [];
    const num = player.charAt(7);
    
    switch (num){
        case '1': 
            deck = player1Deck;
            break;
        case '2': 
            deck = player2Deck;
            break;
        case '3':
            deck = player3Deck;
            break;
        case '4': 
            deck = player4Deck;
            break;
    }

        return(
            <div>
                {
                    deck.map((value, idx) => (
                        <button className='boi' key={idx}>{value}</button>
                    ))
                }
            </div>

        );
    }
    else{
        return(
            <div>
                {
                    (users.length === 0) ? <Others/> : ((users[0].id === socket.id) ? <Player1/> : <Others/>)
                }
            </div>
        );
    }
}

function Player1(){
    return(
        <div>
            <h1>Start Game?</h1>
                <button onClick={() => socket.emit('start')}>START</button>
        </div>
    );
} 

function Others(){
    return(
        <div>
            <h1>Waiting for more players</h1>
        </div>
    );
}

export default Game;
