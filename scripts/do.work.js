importScripts('game.logic.worker.js' );
importScripts('config.js' );
var conf = config.getConfig();

self.addEventListener('message', function(e) {

    if( e.data.cmd == 'play'  ){
        logic.init( e.data.conf );

/*
        testX = 5;
        testY = 0;
        matrixt[testY][testX] = conf.action.draftsman_black;
        matrixt[1][6] = conf.action.draftsman_white;
        matrixt[1][4] = conf.action.draftsman_white;
        matrixt[1][2] = conf.action.draftsman_white;
        matrixt[3][2] = conf.action.draftsman_white;
        matrixt[3][4] = conf.action.draftsman_white;
        matrixt[5][4] = conf.action.draftsman_white;
*/


        var move = logic.play( e.data.matrix  );
        //var move = logic.play( matrixt  );

        var possibleMoves = logic.possibleMoves(move.matrix, conf.action.human);
        var mandatoryMoves = logic.getMandatoryMoveByPossibleMoves(possibleMoves);
        self.postMessage( { cmd : 'play', move : move, possibleMoves : possibleMoves, 'mandatoryMoves' : mandatoryMoves});

    }else if(  e.data.cmd == 'init' ){
        logic.init( e.data.conf );
        var initMatrix =  logic.initMatrix();
        var possibleMoves = logic.possibleMoves(initMatrix, conf.action.human);
        self.postMessage( { cmd : 'init', possibleMoves : possibleMoves});
    }

}, false);
