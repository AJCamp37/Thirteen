import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Thirteen from './Thirteen/Thirteen';
import Game from './Thirteen/Game';
import './App.css';

export default class App extends React.Component{
    render(){
        return (
            <Router>
                <div className="App">
                         <Switch>
                       <Route exact path ='/' component={Thirteen} />
                           <Route exact path='/room' component={test} />
                           </Switch>
                </div>
            </Router>
        );

    }
}

function test(){
    return(
        <div>
            <h1>TEST</h1>
                </div>
    );
}
