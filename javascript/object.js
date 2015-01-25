function Board(){
    this.tracker = new Array(9);
    this.r1 = [0,1,2];
    this.r2 = [3,4,5];
    this.r3 = [6,7,8];
    this.c1 = [0,3,6];
    this.c2 = [1,4,7];
    this.c3 = [2,5,8];
    this.d1 = [0,4,8];
    this.d2 = [2,4,6]
}

Board.prototype = {
    populate: function(){
        for(var i=0;i<9;i++){
            this.tracker[i] = "";
        }
    }
}

function Player(){
    this.myTurn = true;
}