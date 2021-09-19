import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    margin: 8px;
    border: 1px solid black;
    border-radius: 2px;
`;
const Title = styled.h2`
    padding: 8px;
`;

export default class Row extends React.Component{
    render(){
        return(
            <Container>
                <Title>{this.props.row.title}</Title>
            </Container> 
        );
    }    
}
