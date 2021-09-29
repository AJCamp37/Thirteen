//import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import { useEffect, useState }from 'react';
import { socket } from './Thirteen';
import shuffle from '../utils/shuffle';
import cardDeck from '../utils/cardDeck';
import './Game.css';

//Returns an updated currentPlay array
const handlePlay = (card, play, idx) => {
    const image = document.getElementById(`card${idx}`);

    //If the array is empty
    if(play.length === 0){
        image.src = require(`../assets/cards/black/${card}.png`).default;
        const temp = [card];
        return temp;
    }//If the card is already in the array
    else if(play.indexOf(card) !== -1){
        image.src = require(`../assets/cards/white/${card}.png`).default;
        const index = play.indexOf(card);
        play.splice(index, 1);
    }//If the card is not already in the array
    else{
        image.src = require(`../assets/cards/black/${card}.png`).default;
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
const getNext = (length, turn, skip, round) => {
    //Potential players
    const players = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];


    console.log( skip)
    //Make players contain only the amount of users
    players.splice(length,players.length);

    const before = players.indexOf(turn);
    console.log('before' + before)
    //If someone has skipped remove them from potential players
    if(skip.length !== 0){
        var index;
        for(let i = 0; i < players.length; i++){
            console.log(`i: ${i}`)
            index = skip.indexOf(players[i]);
            
            if(index !== -1){
                console.log(`found ${players[i]}`)
                players.splice(i, 1);
            }
        }
    }
    const current = players.indexOf(turn);
    console.log('current' + current)
    
    console.log('current player ' + turn )
    console.log('remaining players ' + players)
    //Next player
    var answer;

    if(players.length === 0)
        return {player: round[round.length-1], error: true};

    if(current === -1){
        if(before === players.length)
            answer = players[0];
        else
            answer = players[before];
    }
    else{
        if(current === players.length - 1)
            answer = players[0];
        else if(players.indexOf(turn) === -1)
            answer = players[current];
        else
            answer = players[current+1];
    }
    return {player: answer, error: false};
}

//Returns deck with played cards removed
const removeCards = (deck, player, play) => {
    const removed = deck[player];
    for(let i = 0; i < play.length; i++){
        removed.splice(removed.indexOf(play[i]), 1); 
    }

    return removed;
}

//Gives the value for a card
const getValue = card => {
    var suit = card.charAt(0);
    var value;
    switch(suit){
        case 'S':
            value = 0;
            break;
        case 'C':
            value = 0.25;
            break;
        case 'D':
            value = 0.50;
            break;
        case 'H':
            value = 0.75;
            break;
    }

    if(isNaN(Number(card.charAt(1)))){
        switch(card.charAt(1)){
            case 'T':
                value += 10;
                break;
            case 'J':
                value += 11;
                break;
            case 'Q':
                value += 12;
                break;
            case 'K':
                value += 13;
                break;
            case 'A':
                value += 14;
                break;
        }
    }
    else if(card.charAt(1) === '2')
        value+= 15;
    else
        value += Number(card.charAt(1));
    
    return value;
}

//Returns the type of play
const playType = play => {
    const length = play.length;
    var temp;

    if(length === 1)
        return 'single';

    temp = play[0][1];
    
    if(length === 2){
        if(play.every((curr) => curr[1] === temp))
            return 'double';
        else
            return 'invalid';
    }
    else if(length === 3 && play.every((curr) => curr[1] === temp))
        return 'triple';
    else if(length === 4 && play.every((curr) => curr[1] === temp))
        return '4-of-kind';
    else{
        for(let i = 0; i < play.length-1; i++){
            if(Math.floor(getValue(play[i+1])) !== (Math.floor(getValue(play[i]))+1)){
            console.log('here')

                return 'invalid';
            }
        }
       return 'straight';
    }
}

//Return the play in sorted order
const sortPlay = play => {
    return play.sort((a, b) => getValue(a) - getValue(b));
}

//Validates a player's move
const validate = (prevPlay, attemptedPlay) => {
    attemptedPlay = sortPlay(attemptedPlay);
    if(prevPlay.length === 0){
        if(playType(attemptedPlay) === 'invalid')
            return false;
    }
    else{
        const prevType = playType(prevPlay);
        if(prevType !== playType(attemptedPlay))
            return false;
        else{
            if(prevPlay.length !== attemptedPlay.length)
                return false;
            else{
                if(getValue(prevPlay[prevPlay.length-1]) > getValue(attemptedPlay[attemptedPlay.length-1]))
                    return false;
            }
        }
    }
    return true;
}

//Returns the player that should go first
const firstTurn = (users, decks) => {
    console.log(users)
    if(users === 4){
        for(let i = 0; i < decks.length; i++){
            if(decks[i].indexOf('S3') !== -1){
                console.log(i)
                return `Player ${i+1}`;
            }
        }
    }
    else{
        var lowest = {val: 15.75, index: 0};
        for(let i = 0; i < users; i++){
            const mapped = decks[i].map(x => getValue(x));
            const min = Math.min(...mapped);
            if(min < lowest.val){
                lowest.val = min;
                lowest.index = i;
            }
        }
        return `Player ${lowest.index+1}`;
    }
}

const Game = (props) => {

    const [room, setRoom] = useState();
    const [gameStart, setGameStart] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [winners, setWinners] = useState([]);
    const [users, setUsers] = useState([]);
    const [player, setPlayer] = useState();
    const [decks, setDecks] = useState([]);
    const [currentBoard, setCurrentBoard] = useState([]);
    const [currentTurn, setCurrentTurn] = useState();
    const [currentPlay, setCurrentPlay] = useState([]);
    const [skipped, setSkipped] = useState([]);
    const [round, setRound] = useState([]);
    const [played, setPlayed] = useState();

    useEffect(() => {
        socket.on('initGame', (data) => {
            setUsers(data.users);
            setRoom(data.room);
        });
    }, []);

    useEffect(() => {
        socket.on('start-game', (users)=> {
            setUsers(users);
            for(let i = 0; i < users.length; i++){
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

                socket.emit('init-data', {users: users.length, p1: p1, p2: p2, p3: p3, p4: p4});
            }
        });

        socket.on('init-game', (data) => {
            setDecks([data.p1, data.p2, data.p3, data.p4]);
            setCurrentTurn(firstTurn(data.users, [data.p1, data.p2, data.p3, data.p4]));
            setGameStart(true);
        });
    }, []);

    useEffect(() => {
        socket.on('updateGame', (data) => {
            if(getDeck(data.turn).length === 0){
                setWinners([...winners, data.turn]);
            }

            if(winners.length === users.length-1)
                setGameOver(true);
            let next;
            if(data.play.length === 0){
                next = getNext(data.length, data.turn, [...data.skip, data.turn], data.round);
                setSkipped([...data.skip, data.turn]);
            }
            else{
                next = getNext(data.length, data.turn, data.skip, data.round);
                setCurrentBoard(sortPlay(data.play));
                setRound([...data.round, data.turn]);
            }

            if(next.error){
                console.log('everyone skipped')
                setCurrentBoard([]);
                setRound([]);
                setSkipped([]);
            }

            setCurrentTurn(next.player);
            setCurrentPlay([]);
            const index = getDeck(data.turn);
            const removed = removeCards(data.deck, index, data.play);
            console.log(removed)
            setDecks(prevDecks => {
                return [...prevDecks.slice(0,index), removed, ...prevDecks.slice(index+1,prevDecks.length)];
            });
        });
    },[])
    
    if(gameStart){
        if(gameOver){
            return(
                <GameOver winners={winners}/>
            );
        }
        else{
            const deck = sortPlay(decks[getDeck(player)]);

            return(
                <div className='board'>
                    <div className='play'>{
                        currentBoard.map((value, idx) =>
                            <img className='cards' key={idx} src={require(`../assets/cards/white/${value}.png`).default}/> 
                        )}
                    </div>
                    <div className='hand'>
                    {
                        deck.map((value, idx) => 
                            <img className='cards' key={idx} id={'card'+idx} 
                                disabled={currentTurn !== player} onClick={()=>
                                setCurrentPlay(handlePlay(value, currentPlay, idx))
                            } src={require(`../assets/cards/white/${value}.png`).default}/>
                        )
                    }
                                <button disabled={currentTurn !== player} onClick={() =>{
                                    if(validate(currentBoard, currentPlay)) 
                                        socket.emit('updateGame', {length: users.length, skip: skipped, deck: decks, turn: currentTurn, play: currentPlay, round: round}) 
                                    else{
                                        alert('Your move is invalid, please play something different');
                                        setCurrentPlay([]);
                                    }
                                }}>Submit</button>
                                <button disabled={currentTurn !== player} onClick={() =>
                                    socket.emit('updateGame', {length: users.length, skip: skipped, deck: decks, turn: currentTurn, play: [], round: round}) 
                                }>Skip</button>
                                    </div>
                </div>
            );
        }
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

function GameOver(props){
    return(
        <div>
            <h1>Game Over!</h1>
            <h1>{props.winners[0]} Wins!</h1>
        </div>
    );
}

export default Game;
