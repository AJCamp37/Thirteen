import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import { useEffect, useState }from 'react';
import { socket } from './Thirteen';
import shuffle from '../utils/shuffle';
import cardDeck from '../utils/cardDeck';
import './Game.css';

//Returns an updated currentPlay array
const handlePlay = (card, play) => {
    //If the array is empty
    if(play.length === 0){
        const temp = [card];
        return temp;
    }//If the card is already in the array
    else if(play.indexOf(card) !== -1){
        const index = play.indexOf(card);
        play.splice(index, 1);
    }//If the card is not already in the array
    else{
        play.push(card);
    }
    return play;
} 

//Returns the index for the player's deck
const getDeck = (playerName) => {
    var value;
    const num = playerName.charAt(7);
    
    switch (num){
        case '1': 
            value = 0;
            break;
        case '2': 
            value = 1;
            break;
        case '3':
            value = 2;
            break;
        case '4': 
            value = 3;
            break;
    }               
    return value;
}

//Return the player whose turn is next
///This will not work if there aren't 4 players need to fix it////////
const getNext = (turn, skip) => {
    const players = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
    if(skip.length !== 0){
        var index;
        for(var i = 0; i < players.length; i++){
            index = skip.indexOf(players[i]);
            if(index !== -1)
                players.splice(index, 1);
        }
    }

    const current = players.indexOf(turn);
    if(current === players.length - 1)
        return players[0];
    else
        return players[current+1];
    
}

//Returns deck with played cards removed
const removeCards = (deck, player, play) => {
    const removed = deck[player];
    for(var i = 0; i < play.length; i++){
        removed.splice(removed.indexOf(play[i]), 1); 
    }

    return removed;
}

const Game = (props) => {

    const [room, setRoom] = useState();
    const [gameStart, setGameStart] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [users, setUsers] = useState([]);
    const [player, setPlayer] = useState();
    const [decks, setDecks] = useState([]);
    const [currentBoard, setCurrentBoard] = useState([]);
    const [currentTurn, setCurrentTurn] = useState('Player 1');
    const [currentPlay, setCurrentPlay] = useState([]);
    const [skipped, setSkipped] = useState([]);

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
            setDecks([data.p1, data.p2, data.p3, data.p4]);
            setGameStart(true);
        });
    }, []);

    useEffect(() => {
        socket.on('updateGame', (data) => {
            setCurrentTurn(getNext(data.turn, data.skip));
            if(data.play.length === 0)
                setSkipped([...data.skip, data.turn]);
            else{
                setCurrentBoard(data.play);
                setCurrentPlay([]);
                const index = getDeck(data.turn);
                const removed = removeCards(data.deck, index, data.play);
                console.log(removed)
                setDecks(prevDecks => {
                    return [...prevDecks.slice(0,index), removed, ...prevDecks.slice(index+1,prevDecks.length)];
                });
            }
        });
    },[])
    
    if(gameStart){
        const deck = decks[getDeck(player)];

        return(
            <div className='board'>
                <div className='play'>{
                    currentBoard.map((value, idx) =>
                        <h1 className='cards' key={idx}>{value}</h1> 
                    )}
                </div>
                <div className='hand'>
                {
                    deck.map((value, idx) => 
                        <h1 className='cards' key={idx} onClick={()=>setCurrentPlay(handlePlay(value, currentPlay))}>{value}</h1>
                    )
                }
                            <button onClick={() => 
                                socket.emit('updateGame', {skip: skipped, deck: decks, turn: currentTurn, play: currentPlay})
                            }>Submit</button>
                            <button onClick={() =>
                                socket.emit('updateGame', {skip: skipped, deck: decks, turn: currentTurn, play: currentPlay}) 
                            }>Skip</button>
                                </div>
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
}/////////////////////////////////////////////////////////////////////


//Functions for Displays
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
