function GameController(view,player){
    this.gameView = view;
    this.p1 = player;
    this.board = new Board();
    this.totalMoves = 0;
}

GameController.prototype = {

    makeEventListenersBeforeStart: function(){         //setting eventListeners in one method
        $('.start-game').on('click',this.startGame.bind(this));
        $('.reset-game').on('click',this.resetGame.bind(this));
    },

    makeEventListenersAfterStart: function(){
        $('.cell').on('click',this.makeMove.bind(this));
    },

    startGame: function(){                              //game is already prepared when document is loaded
        this.board.populate();
        this.gameView.showBoard(this.board);
        this.makeEventListenersAfterStart();
        $('.start-game').off('click');
    },

    resetGame: function(){
        location.reload();
    },

    //player makes the move. wherever the player clicks, we check all the possible remaining empty cells
    makeMove: function(e){                             
        var possibleAreas = [];
        var id = e.target.className.substr(-1);
        this.gameView.showPlayerPiece(id);
        this.updateTrackerAndMoves(id,false,"x",true);
        this.anyWinner();                           //checks if any player won
        this.findingPossibleAreas(id,possibleAreas,1);
        //if the board is not completely full, then it's the computer's turn. player will get the last move
        if(this.totalMoves < 9) this.computerTurn(possibleAreas);
        else{
            this.tieGame();
            this.resetGame();
        }
        $('.'+id).off('click');                 //makes sure you can't click on that cell
    },

    //computer's thought process
    //logic comes from http://www.chessandpoker.com/tic_tac_toe_strategy.html and http://www.quora.com/Is-there-a-way-to-never-lose-at-Tic-Tac-Toe
    computerTurn: function(emptyAreas){                           
        var position;
        var possibleWin = this.winningMove();                   //if there is a winningMove for the computer, it will make that move

        if(this.totalMoves == 1) position = this.firstMove();
        //checks if computer can win next turn
        else if(possibleWin){
            position = possibleWin[0];
            this.updateTrackerAndMoves(position,true,"o",true);
        }
        else{
            //if computer has to counter
            if(typeof this.counterMove(emptyAreas) != 'undefined'){
                position = this.counterMove(emptyAreas);
                this.updateTrackerAndMoves(position,true,"o",false);
            }
            //if we're not countering, computer has to strategically place its pieces
            else{
                var randChoice, smartEmptySpots;
                var remainingSpots = this.findAllEmptySpots();
                
                //certain precautions need to be taken in on the computer's second move, when totalMoves = 4
                if(this.totalMoves == 4) smartEmptySpots = this.precautionMoves(remainingSpots);

                if(smartEmptySpots && smartEmptySpots.length != 0) randChoice = smartEmptySpots[Math.floor(Math.random()*smartEmptySpots.length)];
                else randChoice = remainingSpots[Math.floor(Math.random()*remainingSpots.length)];
                
                position = randChoice;
                this.updateTrackerAndMoves(position,true,"o",false);
            }
        }
        this.totalMoves ++;
        this.gameView.showComputerPiece(position);
        $('.'+position).off('click');              //make sure player can't steal computer's spot     
        this.anyWinner();                           //check if computer won
    },

    updateTrackerAndMoves: function(position,turn,piece,move){
        this.board.tracker[position] = piece;
        this.p1.myTurn = turn;
        if(move) this.totalMoves ++;
    },

    firstMove: function(){
        var firstPosition;
        //if p1 first move = center, computer must go for a corner
        if(this.board.tracker[4] == "x"){
            var choices = [0,2,6,8];
            var randChoice = choices[Math.floor(Math.random() * choices.length)];
            firstPosition = randChoice;
        }
        //p1 first move = corner or edge, then computer takes center
        else firstPosition = 4;
        this.updateTrackerAndMoves(firstPosition,true,"o",true);
        return firstPosition;
    },

    counterMove: function(emptySpots){
        var chosenPosition;
        //check if there needs to be a counter move to prevent player from getting three-in-a-row
        for(var i=0;i<emptySpots.length;i++){
            var countX = 0;
            var countO = 0;

            for(var j=0;j<emptySpots[i].length;j++){
                if(this.board.tracker[emptySpots[i][j]] == "x") countX++;
                else if(this.board.tracker[emptySpots[i][j]] == "o") countO++;
                else chosenPosition = emptySpots[i][j];                 //cell is empty
            }
            if((countX == 2) && (countO == 0)) return chosenPosition;
        }
    },

    findAllEmptySpots: function(){
        var remainingSpots = [];
        for(var i=0;i<this.board.tracker.length;i++){
            if(this.board.tracker[i] == "") remainingSpots.push(i);
        }
        return remainingSpots;
    },

    precautionMoves: function(leftOverSpots){
        var smartRemainingSpots = [];        //smartRemainingSpots are the empty spots that the computer should consider
        //if the player's first move was the center, then computer's first move would be a corner
        //if the player's trying to win, then his second move would be a corner. computer's second move must be a corner
        if(this.board.tracker[4] == "x") return this.findSmartEmptySpots(leftOverSpots,smartRemainingSpots,"c");
        //if the player's first move was the edge, then computer's first move would be a center.
        //player's second move can be an edge or corner. depending on which, computer's second move must be a particular corner
        else if(this.board.tracker[1] == "x" || this.board.tracker[3] == "x" || this.board.tracker[5] == "x" || this.board.tracker[7] == "x"){
            if((this.board.tracker[1]=="x" && this.board.tracker[3]=="x") || 
                (this.board.tracker[1]=="x" && this.board.tracker[8]=="x") || 
                (this.board.tracker[3]=="x" && this.board.tracker[8]=="x")) smartRemainingSpots = [0];
            else if((this.board.tracker[1]=="x" && this.board.tracker[5]=="x") || 
                    (this.board.tracker[1]=="x" && this.board.tracker[6]=="x") || 
                    (this.board.tracker[5]=="x" && this.board.tracker[6]=="x")) smartRemainingSpots = [2];
            else if((this.board.tracker[2]=="x" && this.board.tracker[3]=="x") || 
                    (this.board.tracker[2]=="x" && this.board.tracker[7]=="x") || 
                    (this.board.tracker[3]=="x" && this.board.tracker[7]=="x")) smartRemainingSpots = [6];
            else if((this.board.tracker[0]=="x" && this.board.tracker[5]=="x") || 
                    (this.board.tracker[0]=="x" && this.board.tracker[7]=="x") || 
                    (this.board.tracker[5]=="x" && this.board.tracker[7]=="x")) smartRemainingSpots = [8];
            return smartRemainingSpots; 
        }
        //if the player's first move was the corner, computer would take the center.
        //if the player's trying to not lose, his second move would be the corner diagonal to his first move. computer's second move must be an edge
        else return this.findSmartEmptySpots(leftOverSpots,smartRemainingSpots,"e");
    },

    findingPossibleAreas: function(value,array,possibleAreaOrBoardWin){
        for(var i=0;i<this.board.fullBoard.length;i++){
            for(var j=0;j<3;j++){
                if(possibleAreaOrBoardWin == 1){     //looking for possibleArea
                    if(this.board.fullBoard[i][j] == value) array.push(this.board.fullBoard[i]);
                }
                else{       //looking for boardWin
                    if(this.board.tracker[this.board.fullBoard[i][j]] == value) array[i].push(this.board.fullBoard[i][j]);
                }
            }
        }
        return array;
    },

    findSmartEmptySpots: function(leftOverSpots,smartRemainingSpots,cornerOrEdge){
        for(var i=0;i<leftOverSpots.length;i++){
            if(cornerOrEdge == "c"){  //corner
                if(leftOverSpots[i]==0 || leftOverSpots[i]==2 || leftOverSpots[i]==6 || leftOverSpots[i]==8){
                    if(this.board.tracker[leftOverSpots[i]] == "") smartRemainingSpots.push(leftOverSpots[i]);
                }
            }
            else if(cornerOrEdge == "e"){ //edge
                if(leftOverSpots[i]==1 || leftOverSpots[i]==3 || leftOverSpots[i]==5 || leftOverSpots[i]==7){
                    if(this.board.tracker[leftOverSpots[i]]== "") smartRemainingSpots.push(leftOverSpots[i]);
                }
            }
        }
        return smartRemainingSpots;
    },

    winningMove: function(){
        var boardWin = [[],[],[],[],[],[],[],[]];
        //we are trying to find the sections that are one piece away from the computer winning
        this.findingPossibleAreas("o",boardWin,2);
        //if we find a section, we find the last cell of that section
        for(var i=0;i<boardWin.length;i++){
            if(boardWin[i].length == 2){
                var missingPiece = this.findingLastPiece(this.board.fullBoard[i],boardWin[i]);
                if(this.board.tracker[missingPiece[0]] == "") return missingPiece;
            }
        }
    },

    anyWinner: function(){
        //player cannot win, so we only consider computer win scenarios
        this.horizontalWin();
        this.verticalWin();
        this.diagonalWin();
    },

    horizontalWin: function(){
        for(var i=0;i<this.board.tracker.length;i+=3){
            if(this.board.tracker[i] == "o" && this.board.tracker[i+1] == "o" && this.board.tracker[i+2] == "o"){
                this.winState(i,i+1,i+2,"o");
            }
        }
    },

    verticalWin: function(){
        for(var i=0;i<this.board.tracker.length/3;i++){
            if(this.board.tracker[i] == "o" && this.board.tracker[i+3] == "o" && this.board.tracker[i+6] == "o"){
                this.winState(i,i+3,i+6,"o");
            }
        }
    },

    diagonalWin: function(){
        if(this.board.tracker[0] == "o" && 
            this.board.tracker[4] == "o" && 
            this.board.tracker[8] == "o") this.winState(0,4,8,"o");         
        else if(this.board.tracker[2] == "o" && 
                this.board.tracker[4] == "o" && 
                this.board.tracker[6] == "o") this.winState(2,4,6,"o");            
    },

    findingLastPiece: function(section,sectionWin){
        diff = section.filter(function(x) { return sectionWin.indexOf(x) < 0 })
        return diff;
    },

    winState: function(position1,position2,position3,piece){
        this.gameView.showWinState(position1,position2,position3);
        if(piece == "o") this.alertMessage();
    },

    tieGame: function(){
        alert("Tie game!");
    },

    alertMessage: function(){
        alert("Computer wins!");
        this.resetGame();
    }
}

$(document).ready(function(){               
    var view = new View();
    var player = new Player();
    var game = new GameController(view,player);
    game.makeEventListenersBeforeStart();              
});