function View(){}

View.prototype = {

    showBoard: function(board){             //adding the actual board to the page                  
        for(var i=0;i<9;i++){
            $('.board').append("<div></div>");
            $('.board > div').last().addClass("cell " + board.cellCollection[i].positionID);    //each cell is given the class name 'cell' as well as the position ID
        }
    },

    showPlayerPiece: function(cellID){        //find the cell with the specific ID. place an X on it
        $("."+cellID).html("x");
    },

    showComputerPiece: function(cellID){
        $("."+cellID).html("o");
    },

    showWinState: function(position1,position2,position3){
        $("."+position1).css("color","red");
        $("."+position2).css("color","red");
        $("."+position3).css("color","red");
    }
}