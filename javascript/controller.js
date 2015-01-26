function GameController(view,player){
    this.gameView = view;
    this.p1 = player;
    this.board = new Board();
    this.totalMoves = 0;
}

GameController.prototype = {

    makeEventListenersBeforeStart: function(){         //setting eventListeners in one method
        $('.start-game').on('click',this.startGame.bind(this));
        // $('.start-game').off('click');
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

            for(var i=0;i<this.board.r1.length;i++){
                if(this.board.r1[i] == id) possibleAreas.push(this.board.r1);
                if(this.board.r2[i] == id) possibleAreas.push(this.board.r2);
                if(this.board.r3[i] == id) possibleAreas.push(this.board.r3);
                if(this.board.c1[i] == id) possibleAreas.push(this.board.c1);
                if(this.board.c2[i] == id) possibleAreas.push(this.board.c2);
                if(this.board.c3[i] == id) possibleAreas.push(this.board.c3);
                if(this.board.d1[i] == id) possibleAreas.push(this.board.d1);
                if(this.board.d2[i] == id) possibleAreas.push(this.board.d2);
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
        var r1Win = [], r2Win = [], r3Win = [], c1Win = [], c2Win = [], c3Win = [], d1Win = [], d2Win = [], diff = []; 

        for(var i=0;i<3;i++){
            if(this.board.tracker[this.board.r1[i]] == "o") r1Win.push(this.board.r1[i]);
            if(this.board.tracker[this.board.r2[i]] == "o") r2Win.push(this.board.r2[i]);
            if(this.board.tracker[this.board.r3[i]] == "o") r3Win.push(this.board.r3[i]);
            if(this.board.tracker[this.board.c1[i]] == "o") c1Win.push(this.board.c1[i]);
            if(this.board.tracker[this.board.c2[i]] == "o") c2Win.push(this.board.c2[i]);
            if(this.board.tracker[this.board.c3[i]] == "o") c3Win.push(this.board.c3[i]);
            if(this.board.tracker[this.board.d1[i]] == "o") d1Win.push(this.board.d1[i]);
            if(this.board.tracker[this.board.d2[i]] == "o") d2Win.push(this.board.d2[i]);
        }
        if(r1Win.length == 2){
            diff = this.board.r1.filter(function(x) { return r1Win.indexOf(x) < 0 })
            if(this.board.tracker[diff[0]] == "") return diff;
        }
        if(r2Win.length == 2){
            diff = this.board.r2.filter(function(x) { return r2Win.indexOf(x) < 0 })
            if(this.board.tracker[diff[0]] == "") return diff;
        }
        if(r3Win.length == 2){
            diff = this.board.r3.filter(function(x) { return r3Win.indexOf(x) < 0 })
            if(this.board.tracker[diff[0]] == "") return diff;
        }
        if(c1Win.length == 2){
            diff = this.board.c1.filter(function(x) { return c1Win.indexOf(x) < 0 })
            if(this.board.tracker[diff[0]] == "") return diff;
        }
        if(c2Win.length == 2){
            diff = this.board.c2.filter(function(x) { return c2Win.indexOf(x) < 0 })
            if(this.board.tracker[diff[0]] == "") return diff;
        }
        if(c3Win.length == 2){
            diff = this.board.c3.filter(function(x) { return c3Win.indexOf(x) < 0 })
            if(this.board.tracker[diff[0]] == "") return diff;
        }
        if(d1Win.length == 2){
            diff = this.board.d1.filter(function(x) { return d1Win.indexOf(x) < 0 })
            if(this.board.tracker[diff[0]] == "") return diff;
        }
        if(d2Win.length == 2){
            diff = this.board.d2.filter(function(x) { return d2Win.indexOf(x) < 0 })
            if(this.board.tracker[diff[0]] == "") return diff;
        }
    },

    anyWinner: function(){
        var position0 = this.board.tracker[0];
        var position1 = this.board.tracker[1];
        var position2 = this.board.tracker[2];
        var position3 = this.board.tracker[3];
        var position4 = this.board.tracker[4];
        var position5 = this.board.tracker[5];
        var position6 = this.board.tracker[6];
        var position7 = this.board.tracker[7];
        var position8 = this.board.tracker[8];

        //horizontal wins
        //player win scenarios
        if(position0 == "x" && position1 == "x" && position2 == "x"){           
            this.gameView.showWinState(0,1,2);
            this.alertMessage("Player");
        }
        else if(position3 == "x" && position4 == "x" && position5 == "x"){
            this.gameView.showWinState(3,4,5);
            this.alertMessage("Player");
        }
        else if(position6 == "x" && position7 == "x" && position8 == "x"){
            this.gameView.showWinState(6,7,8);
            this.alertMessage("Player");
        }
        //computer win scenarios
        else if(position0 == "o" && position1 == "o" && position2 == "o"){           
            this.gameView.showWinState(0,1,2);
            this.alertMessage("Computer");
        }
        else if(position3 == "o" && position4 == "o" && position5 == "o"){
            this.gameView.showWinState(3,4,5);
            this.alertMessage("Computer");
        }
        else if(position6 == "o" && position7 == "o" && position8 == "o"){
            this.gameView.showWinState(6,7,8);
            this.alertMessage("Computer");
        }

        //vertical wins
        //player win scenarios
        if(position0 == "x" && position3 == "x" && position6 == "x"){           
            this.gameView.showWinState(0,3,6);
            this.alertMessage("Player");
        }
        else if(position1 == "x" && position4 == "x" && position7 == "x"){
            this.gameView.showWinState(1,4,7);
            this.alertMessage("Player");
        }
        else if(position2 == "x" && position5 == "x" && position8 == "x"){
            this.gameView.showWinState(2,5,8);
            this.alertMessage("Player");
        }
        //computer win scenarios
        else if(position0 == "o" && position3 == "o" && position6 == "o"){           
            this.gameView.showWinState(0,3,6);
            this.alertMessage("Computer");
        }
        else if(position1 == "o" && position4 == "o" && position7 == "o"){
            this.gameView.showWinState(1,4,7);
            this.alertMessage("Computer");
        }
        else if(position2 == "o" && position5 == "o" && position8 == "o"){
            this.gameView.showWinState(2,5,8);
            this.alertMessage("Computer");
        }

        //diagonal wins
        //player win scenarios
        if(position0 == "x" && position4 == "x" && position8 == "x"){           
            this.gameView.showWinState(0,4,8);
            this.alertMessage("Player");
        }
        else if(position2 == "x" && position4 == "x" && position6 == "x"){
            this.gameView.showWinState(2,4,6);
            this.alertMessage("Player");
        }
        //computer win scenarios
        else if(position0 == "o" && position4 == "o" && position8 == "o"){           
            this.gameView.showWinState(0,4,8);
            this.alertMessage("Computer");
        }
        else if(position2 == "o" && position4 == "o" && position6 == "o"){
            this.gameView.showWinState(2,4,6);
            this.alertMessage("Computer");
        }
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