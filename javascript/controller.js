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
    //we check all the possible rows/columns/diagonals that
    //could lead to a three-in-a-row.
    makeMove: function(e){                             
        var possibleAreas = [];

        if(this.p1.myTurn){
            var id = e.target.className.substr(-1);
            this.gameView.showPlayerPiece(id);
            this.board.tracker[id] = "x";
            this.p1.myTurn = false;
            this.totalMoves ++;

            //check if player won
            this.anyWinner();

            for(var i=0;i<this.board.fullBoard.length;i++){
                for(var j=0;j<3;j++){
                    if(this.board.fullBoard[i][j] == id) possibleAreas.push(this.board.fullBoard[i]);
                }
            }
            if(this.totalMoves < 9) this.computerTurn(possibleAreas);
            else{
                this.tieGame();
                this.resetGame();
            }
        //make sure you can't click on that cell
        $('.'+id).off('click');
        }
    },

    //now it's the computer's turn. we first take into consideration
    //the player's first move in order to make the smartest move for the computer.
    //computer also checks if the player is about to get a three-in-a-row
    computerTurn: function(winningAreas){                           
        while(this.p1.myTurn == false){

            var position;
            var possibleWin = this.winningMove();

            //p1 first move = center
            if(this.totalMoves == 1 && this.board.tracker[4] == "x"){
                //computer must go for a corner
                var choices = [0,2,6,8];
                var randChoice = choices[Math.floor(Math.random() * choices.length)];
                position = randChoice;
                this.updateTracker(position);
            }
            //p1 first move = corner or edge
            else if(this.totalMoves == 1 && this.board.tracker[4] != "x"){
                //computer should go for center
                position = 4;
                this.updateTracker(position);
            }
            //checks if computer can win next turn
            else if(possibleWin){
                position = possibleWin[0];
                this.updateTracker(position);
            }
            //check if there needs to be a counter move to prevent
            //player from getting three-in-a-row
            else if(this.totalMoves > 2){

                var chosenPosition;
                for(var i=0;i<winningAreas.length;i++){
                    var countX = 0;
                    var countO = 0;

                    for(var j=0;j<winningAreas[i].length;j++){
                        if(this.board.tracker[winningAreas[i][j]] == "x") countX++;
                        else if(this.board.tracker[winningAreas[i][j]] == "o") countO++;
                        //the cell is empty
                        else chosenPosition = winningAreas[i][j];
                    }
                    //this blocks the player from getting three-in-a-row
                    if((countX == 2) && (countO == 0)){
                        position = chosenPosition;
                        this.board.tracker[position] = "o";
                        this.p1.myTurn = true;
                        break
                    }
                }
                if(this.p1.myTurn == false){
                    var remainingSpots = [];
                    var smartEmptySpots = [];
                    var randChoice;
                    for(var i=0;i<this.board.tracker.length;i++){
                        if(this.board.tracker[i] == "") remainingSpots.push(i);
                    }
                    //certain precautions need to be taken in this step. assuming the player is smart,
                    //the computer's second move (totalMoves=4) is absolutely vital
                    if(this.totalMoves == 4){
                        //if the player's first move was the center, computer's second move must be a corner
                        if(this.board.tracker[4] == "x"){
                            for(var i=0;i<remainingSpots.length;i++){
                                if(remainingSpots[i]==0 || remainingSpots[i]==2 || remainingSpots[i]==6 || remainingSpots[i]==8){
                                    if(this.board.tracker[remainingSpots[i]] == "") smartEmptySpots.push(remainingSpots[i]);
                                }
                            }
                        }
                        //if the player's first move was the edge, computer's second move must be a particular corner,
                        //depending on the player's second move
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
                        //if the player's first move was the corner, computer's second move must be an edge
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
                    this.board.tracker[position] = "o";
                    this.p1.myTurn = true;
                }
            }
        }
        if(this.p1.myTurn && this.board.tracker[position] == "o"){
            this.totalMoves ++;
            this.gameView.showComputerPiece(position);
            //make sure player can't steal computer's spot
            $('.'+position).off('click');
            //check if computer won
            this.anyWinner();
        }
    },

    updateTracker: function(position){
        this.board.tracker[position] = "o";
        this.p1.myTurn = true;
        this.totalMoves ++;
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

//establishing the game
$(document).ready(function(){               
    var view = new View();
    var player = new Player();
    var game = new GameController(view,player);
    game.makeEventListenersBeforeStart();              
});