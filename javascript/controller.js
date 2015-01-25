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
    },

    resetGame: function(){
        location.reload();
    },

    //player makes the move. wherever the player clicks,
    //we check all the possible rows/columns/diagonals that
    //could lead to a three-in-a-row

    makeMove: function(e){                             
        var possibleAreas = [];
        if(this.p1.myTurn){
            var id = e.target.className.substr(-1);
            console.log("PLAYER MOVE: " +id);
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

            if(this.totalMoves < 9){

                this.computerTurn(possibleAreas);
            }
        }
    },

    //now it's the computer's turn. we first take into consideration
    //the player's first move in order to make the smartest move for the computer.
    //computer also checks if the player is about to get a three-in-a-row
    computerTurn: function(winningAreas){                           
        while(this.p1.myTurn == false){

            var position;
            //p1 first move = center
            if(this.totalMoves == 1 && this.board.tracker[4] == "x"){
                //computer must go for a corner
                var choices = [0,2,6,8];
                var randChoice = choices[Math.floor(Math.random() * choices.length)];
                this.board.tracker[randChoice] = "o";
                position = randChoice;
                this.p1.myTurn = true;
                this.totalMoves ++;
            }
            //p1 first move = corner or edge
            else if(this.totalMoves == 1 && this.board.tracker[4] != "x"){
                //computer should go for center
                position = 4;
                this.board.tracker[position] = "o";
                this.p1.myTurn = true;
                this.totalMoves ++;
            }

            //check if there needs to be a counter move to prevent
            //player from getting three-in-a-row
            
            else if(this.totalMoves > 2){

                var chosenPosition;
                for(var i=0;i<winningAreas.length;i++){
                    var countX = 0;
                    var countO = 0;

                    for(var j=0;j<winningAreas[i].length;j++){
                        if(this.board.tracker[winningAreas[i][j]] == "x"){
                            countX++;
                        }
                        else if(this.board.tracker[winningAreas[i][j]] == "o"){
                            countO++;
                        }
                        //the cell is empty
                        else{
                            chosenPosition = winningAreas[i][j];
                        }
                    }
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
                        if(this.board.tracker[i] == ""){
                            remainingSpots.push(i);
                        }
                    }
                    //certain precautions need to be taken in this step
                    if(this.totalMoves == 4){
                        if(this.board.tracker[4] == "x"){
                            for(var i=0;i<remainingSpots.length;i++){
                                if(remainingSpots[i]==0 || remainingSpots[i]==2 || remainingSpots[i]==6 || remainingSpots[i]==8){
                                    if(this.board.tracker[remainingSpots[i]]== ""){
                                        smartEmptySpots.push(remainingSpots[i]);
                                    }
                                }
                            }
                        }
                        else if(this.board.tracker[0] == "x" || this.board.tracker[2] == "x" || this.board.tracker[6] == "x" || this.board.tracker[8] == "x"){
                            for(var i=0;i<remainingSpots.length;i++){
                                if(remainingSpots[i]==1 || remainingSpots[i]==3 || remainingSpots[i]==5 || remainingSpots[i]==7){
                                    if(this.board.tracker[remainingSpots[i]]== ""){
                                        smartEmptySpots.push(remainingSpots[i]);
                                    }
                                }
                            }
                        }
                    }
                    if(smartEmptySpots.length == 0){
                        randChoice = remainingSpots[Math.floor(Math.random() * remainingSpots.length)];
                    }
                    else{
                        randChoice = smartEmptySpots[Math.floor(Math.random() * smartEmptySpots.length)];
                    }
                    
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
            //check if computer won
            this.anyWinner();
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
            alert("Player wins");
            this.resetGame();
        }
        else if(position3 == "x" && position4 == "x" && position5 == "x"){
            this.gameView.showWinState(3,4,5);
            alert("Player wins");
            this.resetGame();
        }
        else if(position6 == "x" && position7 == "x" && position8 == "x"){
            this.gameView.showWinState(6,7,8);
            alert("Player wins");
            this.resetGame();
        }
        //computer win scenarios
        else if(position0 == "o" && position1 == "o" && position2 == "o"){           
            this.gameView.showWinState(0,1,2);
            alert("Computer wins");
            this.resetGame();
        }
        else if(position3 == "o" && position4 == "o" && position5 == "o"){
            this.gameView.showWinState(3,4,5);
            alert("Computer wins");
            this.resetGame();
        }
        else if(position6 == "o" && position7 == "o" && position8 == "o"){
            this.gameView.showWinState(6,7,8);
            alert("Computer wins");
            this.resetGame();
        }

        //vertical wins
        //player win scenarios
        if(position0 == "x" && position3 == "x" && position6 == "x"){           
            this.gameView.showWinState(0,3,6);
            alert("Player wins");
            this.resetGame();
        }
        else if(position1 == "x" && position4 == "x" && position7 == "x"){
            this.gameView.showWinState(1,4,7);
            alert("Player wins");
            this.resetGame();
        }
        else if(position2 == "x" && position5 == "x" && position8 == "x"){
            this.gameView.showWinState(2,5,8);
            alert("Player wins");
            this.resetGame();
        }
        //computer win scenarios
        else if(position0 == "o" && position3 == "o" && position6 == "o"){           
            this.gameView.showWinState(0,3,6);
            alert("Computer wins");
            this.resetGame();
        }
        else if(position1 == "o" && position4 == "o" && position7 == "o"){
            this.gameView.showWinState(1,4,7);
            alert("Computer wins");
            this.resetGame();
        }
        else if(position2 == "o" && position5 == "o" && position8 == "o"){
            this.gameView.showWinState(2,5,8);
            alert("Computer wins");
            this.resetGame();
        }

        //diagonal wins
        //player win scenarios
        if(position0 == "x" && position4 == "x" && position8 == "x"){           
            this.gameView.showWinState(0,4,8);
            alert("Player wins");
            this.resetGame();
        }
        else if(position2 == "x" && position4 == "x" && position6 == "x"){
            this.gameView.showWinState(2,4,6);
            alert("Player wins");
            this.resetGame();
        }
        //computer win scenarios
        else if(position0 == "o" && position4 == "o" && position8 == "o"){           
            this.gameView.showWinState(0,4,8);
            alert("Computer wins");
            this.resetGame();
        }
        else if(position2 == "o" && position4 == "o" && position6 == "o"){
            this.gameView.showWinState(2,4,6);
            alert("Computer wins");
            this.resetGame();
        }
    }
}

$(document).ready(function(){               //establishing the game
    var view = new View();
    var player = new Player();
    var game = new GameController(view,player);

    game.makeEventListenersBeforeStart();              
});