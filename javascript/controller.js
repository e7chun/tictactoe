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

    //player makes the move. wherever the player clicks,
    //we check all the possible remaining empty cells
    makeMove: function(e){                             
        var possibleAreas = [];

        if(this.p1.myTurn){
            var id = e.target.className.substr(-1);
            this.gameView.showPlayerPiece(id);
            this.updateTrackerAndMoves(id,false,"x",true);
            this.anyWinner();                           //checks if any player won

            for(var i=0;i<this.board.fullBoard.length;i++){
                for(var j=0;j<3;j++){
                    if(this.board.fullBoard[i][j] == id) possibleAreas.push(this.board.fullBoard[i]);
                }
            }
            //if the board is not completely full, then it's the computer's turn. 
            //player will get the last move
            if(this.totalMoves < 9) this.computerTurn(possibleAreas);
            else{
                this.tieGame();
                this.resetGame();
            }
        $('.'+id).off('click');                 //makes sure you can't click on that cell
        }
    },

    //computer's thought process
    //logic comes from http://www.chessandpoker.com/tic_tac_toe_strategy.html and http://www.quora.com/Is-there-a-way-to-never-lose-at-Tic-Tac-Toe
    computerTurn: function(emptyAreas){                           
        while(this.p1.myTurn == false){

            var position;
            var possibleWin = this.winningMove();                   //if there is a winningMove for the computer, it will make that move

            if(this.totalMoves == 1){
                //if p1 first move = center, computer must go for a corner
                if(this.board.tracker[4] == "x"){
                    var choices = [0,2,6,8];
                    var randChoice = choices[Math.floor(Math.random() * choices.length)];
                    position = randChoice;
                    this.updateTrackerAndMoves(position,true,"o",true);
                }
                //p1 first move = corner or edge
                else{
                    position = 4;
                    this.updateTrackerAndMoves(position,true,"o",true);
                }
            }
            //checks if computer can win next turn
            else if(possibleWin){
                position = possibleWin[0];
                this.updateTrackerAndMoves(position,true,"o",true);
            }
            else if(this.totalMoves > 2){
                var chosenPosition;

                //check if there needs to be a counter move to prevent player from getting three-in-a-row
                for(var i=0;i<emptyAreas.length;i++){
                    var countX = 0;
                    var countO = 0;

                    for(var j=0;j<emptyAreas[i].length;j++){
                        if(this.board.tracker[emptyAreas[i][j]] == "x") countX++;
                        else if(this.board.tracker[emptyAreas[i][j]] == "o") countO++;
                        else chosenPosition = emptyAreas[i][j];                 //cell is empty
                    }
                    //this blocks the player from getting three-in-a-row
                    if((countX == 2) && (countO == 0)){
                        position = chosenPosition;
                        this.updateTrackerAndMoves(position,true,"o",false);
                        break
                    }
                }
                //if we're not blocking a three-in-a-row, computer has to strategically place its pieces
                if(this.p1.myTurn == false){
                    var remainingSpots = [];
                    var smartEmptySpots = [];                       //smartEmptySpots are the empty spots that the computer should consider
                    var randChoice;
                    for(var i=0;i<this.board.tracker.length;i++){
                        if(this.board.tracker[i] == "") remainingSpots.push(i);
                    }
                    //certain precautions need to be taken in on the computer's second move, when totalMoves = 4
                    if(this.totalMoves == 4){   
                        //if the player's first move was the center, then computer's first move would be a corner
                        //if the player's trying to win, then his second move would be a corner. computer's second move must be a corner
                        if(this.board.tracker[4] == "x"){
                            for(var i=0;i<remainingSpots.length;i++){
                                if(remainingSpots[i]==0 || remainingSpots[i]==2 || remainingSpots[i]==6 || remainingSpots[i]==8){
                                    if(this.board.tracker[remainingSpots[i]] == "") smartEmptySpots.push(remainingSpots[i]);
                                }
                            }
                        }
                        //if the player's first move was the edge, then computer's first move would be a center.
                        //player's second move can be an edge or corner. depending on which, computer's second move must be a particular corner
                        else if(this.board.tracker[1] == "x" || this.board.tracker[3] == "x" || this.board.tracker[5] == "x" || this.board.tracker[7] == "x"){
                            for(var i=0;i<remainingSpots.length;i++){
                                if(remainingSpots[i]==0 || remainingSpots[i]==2 || remainingSpots[i]==6 || remainingSpots[i]==8){
                                    if(this.board.tracker[remainingSpots[i]]== "") smartEmptySpots.push(remainingSpots[i]);
                                }
                            }
                            if(this.board.tracker[1] == "x"){
                                if(this.board.tracker[3] == "x" || this.board.tracker[8] == "x") smartEmptySpots = [0];
                                else if(this.board.tracker[5] == "x" || this.board.tracker[6] == "x") smartEmptySpots = [2];
                            }
                            else if(this.board.tracker[3] == "x"){
                                if(this.board.tracker[7] == "x" || this.board.tracker[2] == "x") smartEmptySpots = [6];
                                else if(this.board.tracker[8] == "x") smartEmptySpots = [0];
                            }
                            else if(this.board.tracker[5] == "x"){
                                if(this.board.tracker[7] == "x" || this.board.tracker[0] == "x") smartEmptySpots = [8];
                                else if(this.board.tracker[6] == "x") smartEmptySpots = [2];
                            }
                            else if(this.board.tracker[7] == "x"){
                                if(this.board.tracker[0] == "x") smartEmptySpots = [8];
                                else if(this.board.tracker[2] == "x") smartEmptySpots = [6];
                            }
                        }
                        //if the player's first move was the corner, computer would take the center.
                        //if the player's trying to not lose, his second move would be the corner diagonal to his first move. computer's second move must be an edge
                        else if(this.board.tracker[0] == "x" || this.board.tracker[2] == "x" || this.board.tracker[6] == "x" || this.board.tracker[8] == "x"){
                            for(var i=0;i<remainingSpots.length;i++){
                                if(remainingSpots[i]==1 || remainingSpots[i]==3 || remainingSpots[i]==5 || remainingSpots[i]==7){
                                    if(this.board.tracker[remainingSpots[i]]== "") smartEmptySpots.push(remainingSpots[i]);
                                }
                            }
                        }
                    }
                    if(smartEmptySpots.length == 0) randChoice = remainingSpots[Math.floor(Math.random() * remainingSpots.length)];
                    else randChoice = smartEmptySpots[Math.floor(Math.random() * smartEmptySpots.length)];
                    
                    chosenPosition = randChoice;
                    position = chosenPosition;
                    this.updateTrackerAndMoves(position,true,"o",false);
                }
            }
        }
        if(this.p1.myTurn && this.board.tracker[position] == "o"){
            this.totalMoves ++;
            this.gameView.showComputerPiece(position);
            $('.'+position).off('click');              //make sure player can't steal computer's spot     
            this.anyWinner();                           //check if computer won
        }
    },

    updateTrackerAndMoves: function(position,turn,piece,move){
        this.board.tracker[position] = piece;
        this.p1.myTurn = turn;
        if(move) this.totalMoves ++;
    },

    winningMove: function(){
        var boardWin = [[],[],[],[],[],[],[],[]];
        
        //we are trying to find the sections that are one piece away from the computer winning
        for(var i=0;i<this.board.fullBoard.length;i++){
            for(var j=0;j<3;j++){
                if(this.board.tracker[this.board.fullBoard[i][j]] == "o") boardWin[i].push(this.board.fullBoard[i][j]);
            }
        }
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
        //horizontal wins
        for(var i=0;i<this.board.tracker.length;i+=3){
            if(this.board.tracker[i] == "o" && this.board.tracker[i+1] == "o" && this.board.tracker[i+2] == "o"){
                this.winState(i,i+1,i+2,"o");
            }
        }
        //vertical wins
        for(var i=0;i<this.board.tracker.length/3;i++){
            if(this.board.tracker[i] == "o" && this.board.tracker[i+3] == "o" && this.board.tracker[i+6] == "o"){
                this.winState(i,i+3,i+6,"o");
            }
        }
        //diagonal wins
        if(this.board.tracker[0] == "o" && this.board.tracker[4] == "o" && this.board.tracker[8] == "o"){           
            this.winState(0,4,8,"o");            
        }
        else if(this.board.tracker[2] == "o" && this.board.tracker[4] == "o" && this.board.tracker[6] == "o"){
            this.winState(2,4,6,"o");            
        }
    },

    findingLastPiece: function(section,sectionWin){
        diff = section.filter(function(x) { return sectionWin.indexOf(x) < 0 })
        return diff;
    },

    winState: function(position1,position2,position3,piece){
        this.gameView.showWinState(position1,position2,position3);
        if(piece == "o") this.alertMessage("Computer");
    },

    tieGame: function(){
        alert("Tie game!");
    },

    alertMessage: function(Player){
        alert(Player+" wins!");
        this.resetGame();
    }
}

$(document).ready(function(){               
    var view = new View();
    var player = new Player();
    var game = new GameController(view,player);
    game.makeEventListenersBeforeStart();              
});