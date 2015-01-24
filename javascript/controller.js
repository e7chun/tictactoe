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

    makeMove: function(e){                              //player makes the move
        if(this.p1.myTurn){
            var id = e.target.className.substr(-1);
            console.log("PLAYER MOVE: " +id);
            this.gameView.showPlayerPiece(id);
            this.board.tracker[id] = "x";
            this.p1.myTurn = false;
            this.totalMoves ++;
            //check if player won
            this.anyWinner();
            if(this.totalMoves < 9){
                this.computerTurn();
            }
        }
    },

    computerTurn: function(){                           //computer makes a move
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
        }
        if(this.p1.myTurn && this.board.tracker[position] == "o"){
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