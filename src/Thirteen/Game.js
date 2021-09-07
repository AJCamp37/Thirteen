import { useEffect }from 'react';
import { socket } from './Thirteen';
import shuffle from '../utils/shuffle';
import cardDeck from '../utils/cardDeck';

const Game = (props) => {
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

    }, [])

        
        return(
            <div>
                <h1>Player 1 has </h1>
                </div>
        );
    }

export default Game;
