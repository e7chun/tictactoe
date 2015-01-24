function Board(){
    this.cellCollection = [];
    this.tracker = new Array(9);
}

Board.prototype = {
    populate: function(){

        for(var i=0;i<9;i++){
            var newCell = new Cell(i);
            this.cellCollection.push(newCell);
            this.tracker[i] = "";
        }
    }
}

function Cell(id){
    this.positionID = id;
    this.value = "";
}

function Player(){
    this.myTurn = true;
}