export default function shuffle(cards){
  var arr = [];                                                                                
                                                                                               
  while(cards.length){                                                                         
      var randIndex = Math.floor(Math.random() * cards.length),                                
          element = cards.splice(randIndex, 1);                                                
      arr.push(element[0]);                                                                    
  }                                                                                            
    return arr;
};
