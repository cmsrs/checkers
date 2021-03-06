logic = (function() {
    var
        cols ,
        rows ,
        max_depth  ,
        inf ,
        human ,
        blank ,
        draftsman_white,
        king_white,
        draftsman_black,
        king_black,
        coef_checker,
        near_inf,
        comp,
        histCompMatrix
        ;

    function init( conf ){
        cols = conf.cols;
        rows = conf.rows;
        draftsman_white = conf.draftsman_white;
        king_white = conf.king_white;
        draftsman_black = conf.draftsman_black;
        king_black = conf.king_black;
        init_number_draftsman = conf.init_number_draftsman;
        max_depth  = conf.max_depth;
        inf = conf.inf;
        near_inf = conf.near_inf;
        human =  conf.human;
        blank = conf.blank;
        comp = conf.comp;
        coef_checker = conf.coef_checker;
        histCompMatrix = [];
    }

    function initTestMatrix(){
      var testMatrixEmpty = [];

      for (var y=0;y<rows;y++) {
          testMatrixEmpty[y] = [];
          for (var x=0;x<cols;x++) {
              testMatrixEmpty[y][x] = '';
              if( ( x%2 && !(y%2) ) || ( !(x%2) && y%2 ) ){
                testMatrixEmpty[y][x] = blank;
              }
          }
      }

      testMatrixEmpty[0][7] = king_white;
      //testMatrixEmpty[1][6] = king_black;
      testMatrixEmpty[7][6] = king_black;



      // testMatrixEmpty[0][1] = draftsman_black;
      // testMatrixEmpty[0][3] = draftsman_black;
      // testMatrixEmpty[0][5] = draftsman_black;
      // testMatrixEmpty[0][7] = draftsman_black;
      //
      // testMatrixEmpty[1][2] = draftsman_black;
      // testMatrixEmpty[1][6] = draftsman_black;
      //
      // testMatrixEmpty[2][1] = draftsman_black;
      // testMatrixEmpty[2][3] = draftsman_black;
      // testMatrixEmpty[2][7] = draftsman_white;
      //
      // testMatrixEmpty[3][2] = draftsman_black;
      //
      // testMatrixEmpty[4][5] = draftsman_white;
      // testMatrixEmpty[4][7] = draftsman_white;
      //
      // testMatrixEmpty[5][0] = draftsman_white;
      //
      // testMatrixEmpty[6][1] = draftsman_white;
      // testMatrixEmpty[6][3] = draftsman_white;
      // testMatrixEmpty[6][5] = draftsman_black;
      // testMatrixEmpty[6][7] = draftsman_white;
      //
      // testMatrixEmpty[7][0] = draftsman_white;
      // testMatrixEmpty[7][2] = draftsman_white;
      // testMatrixEmpty[7][4] = draftsman_white;

      return testMatrixEmpty;
    }


    function initMatrix(){
        var out = [];
        var ii = 0;
        var startWhite = (cols * rows / 2) - init_number_draftsman;
        for (var y=0;y<rows;y++) {
            out[y] = [];
            for (var x=0;x<cols;x++) {
                out[y][x] = '';
                if( ( x%2 && !(y%2) ) || ( !(x%2) && y%2 ) ){
                  if( ii < init_number_draftsman ){
                    out[y][x] = draftsman_black;
                  }else if( ii >= startWhite ){
                    out[y][x] = draftsman_white;
                  }else{
                    out[y][x] = blank;
                  }
                  ii++;
                }
            }
        }
        return out;
    }

    function getMatrixByPossibleMoves(matrix, player, possibleMoves)
    {
      var out = [];
      var k = 0;
      for(i in possibleMoves){
        var value = getValue(matrix, possibleMoves[i].x, possibleMoves[i].y);
        for(ii in possibleMoves[i].move){
          var matrixTmp = copyMarix(matrix);
          matrixTmp[possibleMoves[i].y][possibleMoves[i].x] = blank;
          matrixTmp[possibleMoves[i].move[ii].y][possibleMoves[i].move[ii].x] = value;
          if(typeof possibleMoves[i].move[ii].beats  != 'undefined' ){
            for(j in possibleMoves[i].move[ii].beats){
              matrixTmp[possibleMoves[i].move[ii].beats[j].beat_y][possibleMoves[i].move[ii].beats[j].beat_x] = blank;
            }
          }
          out[k] = {};
          out[k].move =  { 'from_x': possibleMoves[i].x, 'from_y': possibleMoves[i].y, 'x': possibleMoves[i].move[ii].x, 'y': possibleMoves[i].move[ii].y, 'beats': possibleMoves[i].move[ii].beats  };//do widowku potrzebne
          out[k].matrix = logic.becomeKing(matrixTmp);
          k++;
        }
      }
      return out;
    }

    function getMandatoryMoveByPossibleMoves(possibleMoves){
      var out = [];
      for(i in  possibleMoves){
        var possibleMove = possibleMoves[i];
        if(possibleMove.isMandatoryBeats){
          out.push( {'x': possibleMove.x, 'y': possibleMove.y, 'value':possibleMove.value  });
        }
      }
      return out;
    }


    function possibleMoves(matrix, player){
      var playerValues = getPlayerValues(player);
      var out = [];
      var outBeats = [];
      for (var y=0;y<rows;y++) {
        for (var x=0;x<cols;x++) {
          var value = getValue(matrix, x, y );
          if(  inArray(value, playerValues ) ){
            var move = logic.possibleMove(matrix, x, y);
            if(move){
              var moveTmp = {'x': x, 'y': y, 'value': value, 'move' : move };
              moveTmp['isMandatoryBeats'] = false;
              out.push( moveTmp );
              for( var i  in move){ //sprawdzamy czy jest bicie przymusowe
                if(  'undefined' !== typeof(move[i].beats) ){
                  moveTmp['isMandatoryBeats'] = true;
                  outBeats.push(moveTmp);
                  break;
                }
              }
            }
          }
        }
      }

      return outBeats.length ? outBeats : out;
    }

    function evaluateMaxScoreByBeat( matrix, player ){
      var eval = 0;
      var possibleMoves = logic.possibleMoves(matrix, player);
      for(var i in possibleMoves){
        if(possibleMoves[i].isMandatoryBeats){
          var move = possibleMoves[i].move;
          for(var j in move){
            var beats = move[j].beats;
            var scoreBeat = 0;
            for(var k in  beats){
              var value = logic.getValue( matrix, beats[k].beat_x, beats[k].beat_y );
              scoreBeat += Math.abs(value);
            }
            eval = Math.max(scoreBeat, eval);
          }
        }
      }
      return eval;
    }



    function getValue(matrix, x, y){
      if( typeof(matrix[y]) === 'undefined' ){
        return false;
      }
      var value = matrix[y][x];
      if( ('' === value) || (typeof(value) === 'undefined')  ){
        return false;
      }
      return value;
    }

    function getPlayerValues(value){
      return getEnemiesByValue(-1*value);
    }

    function getEnemiesByValue(value){
      var out = [];
      if( value < 0 ){
        out[0] = draftsman_white;
        out[1] = king_white;
      }else if( value > 0 ){
        out[0] = draftsman_black;
        out[1] = king_black;
      }else{
        out = false;
      }
      return out;
    }

    function possibleMove(matrix, x, y){
      var value = getValue(matrix, x, y);
      if(!value){
        return false;
      }
      var out = false;
      out = possibleBeatsMove(matrix, x, y);
      if(out.length){ //bicia przymusowe
        return out;
      }
      out = possibleOneStepMove(matrix, x, y);

      if( (king_black === value) || (king_white === value) ){
        out = logic.possibleSimpleKingMove(matrix, x, y, value);
      }

      return out;
    }

    function becomeKing(matrixIn){
      //comp
      for (var x=0;x<cols;x++) {
        var y = rows -1;
        value = getValue(matrixIn, x, y);
        if(draftsman_black === value){
          matrixIn[y][x] = king_black;
        }
      }
      //human
      for (var x=0;x<cols;x++) {
        var y = 0;
        value = getValue(matrixIn, x, y);
        if(draftsman_white === value){
          matrixIn[y][x] = king_white;
        }
      }
      return matrixIn;
    }

    function possibleBeatsDraftsman( matrixIn, x, y, value, enemies ){
      var out = [];

      if( getValue(matrixIn, x-1, y-1) &&  (0 === getValue(matrixIn, x-2, y-2)) && inArray(matrixIn[y-1][x-1],enemies) ){
        out.push({ 'in_x': x, 'in_y': y, 'value': value,  'beat_x': x-1, 'beat_y': y-1, 'x' : x-2, 'y': y-2  });
      }
      if( getValue(matrixIn, x+1, y-1) && (0 === getValue(matrixIn, x+2, y-2))  && inArray(matrixIn[y-1][x+1],enemies) ){
        out.push({ 'in_x': x, 'in_y': y, 'value': value,  'beat_x': x+1, 'beat_y': y-1, 'x' : x+2, 'y': y-2  });
      }
      if( getValue(matrixIn, x+1, y+1) && (0 === getValue(matrixIn, x+2, y+2)) && inArray(matrixIn[y+1][x+1],enemies) ){
        out.push({ 'in_x': x, 'in_y': y, 'value': value,  'beat_x': x+1, 'beat_y': y+1,  'x' : x+2, 'y': y+2  });
      }
      if( getValue(matrixIn, x-1, y+1) && (0 === getValue(matrixIn, x-2, y+2)) && inArray(matrixIn[y+1][x-1],enemies) ){
        out.push({  'in_x': x, 'in_y': y, 'value': value, 'beat_x': x-1,  'beat_y': y+1, 'x' : x-2, 'y': y+2  });
      }
      return out;
    }

    function checkIsKingHaveBeat(matrixIn, x, y, value, enemies, signX, signY){
      var out = [];
      var move = rows - 2;

      var notBlank = [];
      var isKingBeat = false;
      for (var k=0;k<move;k++) {
        var newX = x + (signX * 2) + (signX * k);
        var newY = y + (signY * 2) + (signY * k);

        var beatX = x + (signX * 1) + (signX * k);
        var beatY = y + (signY * 1) + (signY * k);

        var val = getValue(matrixIn, x + (signX * k), y + (signY * k));
        if( (k > 0) &&  (blank !== val) ){
          notBlank.push(val);
        }

        if( !notBlank.length && getValue(matrixIn, beatX, beatY) &&  (blank === getValue(matrixIn, newX, newY)) && inArray(matrixIn[beatY][beatX],enemies) ){
          isKingBeat = true;
          break;
        }
      }
      return isKingBeat;
    }


    function kingBeatOneSite(matrixIn, x, y, value, enemies  , wasBeatX, wasBeatY, signX, signY ) {
      var out = [];
      var move = rows - 2;

      var notBlank = [];
      var movesWithoutJump = [];
      for (var k=0;k<move;k++) {
        var newX = x + (signX * 2) + (signX * k);
        var newY = y + (signY * 2) + (signY * k);

        var beatX = x + (signX * 1) + (signX * k);
        var beatY = y + (signY * 1) + (signY * k);

        var val = getValue(matrixIn, x + (signX * k), y + (signY * k));
        if( (k > 0) &&  (blank !== val) ){
          notBlank.push(val);
        }
        if(  (beatX === wasBeatX) &&  (beatY === wasBeatY)  ){ //nie mozna bic do tylu
          break;
        }

        if( !notBlank.length && getValue(matrixIn, beatX, beatY) &&  (blank === getValue(matrixIn, newX, newY)) && inArray(matrixIn[beatY][beatX],enemies) ){
          movesWithoutJump.push({ 'in_x': x, 'in_y': y, 'value': value,  'beat_x': beatX, 'beat_y': beatY, 'x' : newX, 'y': newY });

          for (var i=1;i<move;i++) {
            var newX = newX+(signX);
            var newY = newY+(signY);

            var valueNext = getValue(matrixIn, newX, newY);

            if( blank !== valueNext ){
              break;
            }
            movesWithoutJump.push({ 'in_x': x, 'in_y': y, 'value': value,  'beat_x': beatX, 'beat_y': beatY, 'x' : newX, 'y': newY });
          }


          var passibleJumps = [];
          if(movesWithoutJump.length){
            for(var m in movesWithoutJump){
              var kingHaveBeat1 = checkIsKingHaveBeat(matrixIn, movesWithoutJump[m].x, movesWithoutJump[m].y, value, enemies, -1*signX, signY);
              var kingHaveBeat2 = checkIsKingHaveBeat(matrixIn, movesWithoutJump[m].x, movesWithoutJump[m].y, value, enemies, signX, -1*signY);
              if( kingHaveBeat1 || kingHaveBeat2 ){
                passibleJumps.push({ 'in_x': x, 'in_y': y, 'value': value,  'beat_x': beatX, 'beat_y': beatY, 'x' : movesWithoutJump[m].x, 'y': movesWithoutJump[m].y });
              }
            }
          }
          //return false;
          var moveToMerge = [];
          moveToMerge =  passibleJumps.length ? passibleJumps : movesWithoutJump;
          for(var j in moveToMerge ){
            out.push(moveToMerge[j]);
          }
        }
      }

      return out;
    }


    function possibleBeatsKing( matrixIn, x, y, value, enemies  , wasBeatX, wasBeatY ){
      var out = [];
      var move = rows - 2;

      var site1 = kingBeatOneSite(matrixIn, x, y, value, enemies  , wasBeatX, wasBeatY, -1, -1 );
      if(site1.length){
        for(var i in site1){
          out.push(site1[i]);
        }
      }

      var site2 = kingBeatOneSite(matrixIn, x, y, value, enemies  , wasBeatX, wasBeatY, 1, -1 );
      if(site2.length){
        for(var i in site2){
          out.push(site2[i]);
        }
      }

      var site3 = kingBeatOneSite(matrixIn, x, y, value, enemies  , wasBeatX, wasBeatY, 1, 1 );
      if(site3.length){
        for(var i in site3){
          out.push(site3[i]);
        }
      }

      var site4 = kingBeatOneSite(matrixIn, x, y, value, enemies  , wasBeatX, wasBeatY, -1, 1 );
      if(site4.length){
        for(var i in site4){
          out.push(site4[i]);
        }
      }

      return out;
    }

    function possibleBeatsMovePath(matrixIn, inn ,enemies, pathIn, pathLen, paths){

      pathIn[pathLen] =  inn;
      pathLen++;

      matrixIn[inn.beat_y][inn.beat_x] = blank;

      var x = inn.x;
      var y = inn.y;
      var value = inn.value;

      if( (draftsman_black === inn.value) ||  (draftsman_white === inn.value)  ){
        var out = possibleBeatsDraftsman( matrixIn, x, y, value, enemies );
      }
      if( (king_black === inn.value) ||  (king_white === inn.value)  ){
        var out = possibleBeatsKing( matrixIn, x, y, value, enemies , inn.beat_x, inn.beat_y );
      }

      if( !out.length ){
        var beat = [];
        for(var j=1; j<pathLen; j++  ){
           beat.push(pathIn[j]);
        }
        if( !beat.length ){
          return false;
        }

        var path = { 'x': x, 'y': y };
        path.beats = [];
        path.beats = beat;

        paths.push( path );
        return paths;
      }

      for (var ii in out){
        paths = possibleBeatsMovePath(matrixIn, out[ii], enemies, pathIn, pathLen, paths);
      }
      return paths;
    }


    function possibleBeatsMove(matrix, x, y){
      var value = logic.getValue(matrix, x, y);
      if(!value){
        return false;
      }

      enemies = logic.getEnemiesByValue(value);

      var pathIn = [];
      var pathLen = 0;
      var paths = [];

      var inn = {'x': x, 'y' : y, 'value': value,  'beat_x': x, 'beat_y': y };

      var matrixIn = logic.copyMarix(matrix);
      var beatsMove = possibleBeatsMovePath(matrixIn, inn, enemies, pathIn, pathLen, paths);

      return beatsMove;
    }

    function possibleSimpleKingMove(matrixIn, x, y, value){

      var out = [];
      var move = rows;

      for (var k=1;k<move;k++) {
        var val = getValue(matrixIn, x-k, y-k);
        if( blank !== val ){
          break;
        }
        out.push({ 'in_x': x, 'in_y': y, 'value': value,  'x':x-k,  'y': y-k  });
      }

      for (var k=1;k<move;k++) {
        var val = getValue(matrixIn, x+k, y-k);
        if( blank !== val ){
          break;
        }

        out.push({ 'in_x': x, 'in_y': y, 'value': value,  'x':x+k,  'y': y-k  });
      }


      for (var k=1;k<move;k++) {
        var val = getValue(matrixIn, x+k, y+k);
        if( blank !== val ){
          break;
        }

        out.push({ 'in_x': x, 'in_y': y, 'value': value,  'x':x+k,  'y': y+k  });
      }


      for (var k=1;k<move;k++) {
        var val = getValue(matrixIn, x-k, y+k);
        if( blank !== val ){
          break;
        }

        out.push({ 'in_x': x, 'in_y': y, 'value': value,  'x':x-k,  'y': y+k  });
      }
      if(!out.length){
        return false;
      }

      return out;
    }


    function possibleOneStepMove(matrix, x, y){
      var value = getValue(matrix, x, y);
      if(!value){
        return false;
      }

      var out = [];
      if( draftsman_black ===  value ){
        if(  ( typeof(matrix[y+1]) !== 'undefined' ) &&  (matrix[y+1][x-1] === blank) ){
          out.push({ 'x': x-1, 'y': y+1 });
        }
        if( ( typeof(matrix[y+1]) !== 'undefined' ) && (matrix[y+1][x+1] === blank) ){
          out.push({ 'x': x+1, 'y': y+1 });
        }
      }

      if( draftsman_white ===  value ){
        if( ( typeof(matrix[y-1]) !== 'undefined' ) &&  (matrix[y-1][x-1] === blank) ){
          out.push({ 'x': x-1, 'y': y-1 });
        }
        if( ( typeof(matrix[y-1]) !== 'undefined' ) &&  (matrix[y-1][x+1] === blank) ){
          out.push({ 'x': x+1, 'y': y-1 });
        }
      }

      if(!out.length){
        return false;
      }

      return out;
    }

    function inArray(needle, haystack) {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i] == needle) return true;
        }
        return false;
    }

    function copyMarix( matrix ){
        var out = [];
        for (var y=0;y<rows;y++) {
            out[y] = [];
            for (var x=0;x<cols;x++) {
                out[y][x] = matrix[y][x];
            }
        }
        return out;
    }

    function getYForHuman(y) {
      return Math.abs(y-(rows-1));
    }

    function evaluateY(y){
      var evalY = 0;
      if(y===0){
        evalY = 3;
      }else if(  1<=y<=1 ){
        evalY =2;
      }else if( 3<=y<=4 ){
        evalY = 1;
      }else if( 5<=y<=5 ){
        evalY = 1;
      }else if( 6<=y<=6 ){
        evalY = 2;
      }else if( y===7 ){
        evalY = 3;
      }

      return evalY;
    }

    function evaluate( matrix, player ){

        var score = 0;
        var win = 0;

        var playerValues = getPlayerValues(player);
        var enemyValues = getEnemiesByValue(player);

        var scorePlayer = 0;
        var scoreEnemy = 0;
        var sumY = 0;
        var sumX = 0;
        for (var y=0;y<rows;y++) {
          for (var x=0;x<cols;x++) {
            var value = getValue(matrix, x, y);

            // if( ((x === 0) ||  (x === cols-1))  &&  (  inArray(value,playerValues)  ) ){
            //    sumX += value;
            // }

            if( (player === human) &&  ( draftsman_white === value  ) ){
              var yTmp = getYForHuman(y);
              sumY += evaluateY(yTmp);
            }
            if( (player === comp) &&  ( draftsman_black === value  ) ){
              var yTmp = y;
              sumY += evaluateY(yTmp);
            }

            if( inArray(value,playerValues) ){
              scorePlayer += value;
            }
            if( inArray(value,enemyValues) ){
              scoreEnemy += value;
            }
          }
        }

        var sum = scorePlayer + scoreEnemy;

        scorePlayer = Math.abs(scorePlayer);
        scoreEnemy = Math.abs(scoreEnemy);

        var maxScoreByBeatEnemy = evaluateMaxScoreByBeat( matrix, -1*player );
        var maxScoreByBeat = evaluateMaxScoreByBeat( matrix, player );
        var score = sum*coef_checker + player*sumY + player*maxScoreByBeat*coef_checker - player*maxScoreByBeatEnemy*coef_checker;

        var win = 0;
        if( ((player === comp) &&  !scoreEnemy) || ((player === human) &&  !scorePlayer) ){
          win = comp;
          return { score: -near_inf, win: comp, real_score: score}; //real score potrzebne do testu
        }
        if( (player === human) &&  !scoreEnemy || ((player === comp)  &&  !scorePlayer) ){
          win = human;
          return { score: near_inf, win: human, real_score: score};
        }

        // var maxScoreByBeat = 0;
        // if( !maxScoreByBeatEnemy ){ //to jest potrzebne aby sam nie dawal sie bic - moje doswiadczenia podczas grania
        //   var maxScoreByBeat = evaluateMaxScoreByBeat( matrix, player ); //ma to sens jesli samego siebie nie bija patrz test: diagnose black move real3 example
        // }


        return { score: score, win: win, real_score: score};
    }

    function getBestMatix( matrix_in, player ){
        var tree_ab  = alphaBetaPruning( matrix_in, max_depth,  -inf, inf, player, null );

        return tree_ab.tree;
    }

    function alphaBetaPruning( node, depth, alpha, beta, player, move  ){

        var eval = evaluate( node, player );
        var possibleMoves = logic.possibleMoves(node, player);
        var children = logic.getMatrixByPossibleMoves(node, player, possibleMoves);

        if(  (eval['win'] !== 0 )   || ( !possibleMoves.length ) || (depth === 0 )  || !children.length   ){ // || ( eval['score'] === 0 )
            return  { 'alphabeta': eval['score'], 'tree' : {'matrix': node, 'move': move, 'alphabeta': eval['score']  } };
        }

        if( player === human ){ //maximizingPlayer human.
            var value = -1*inf;

            var tree = {};
            for( var i=0;  i<children.length;  i++ ){
                var node = children[i].matrix;
                var move = children[i].move;

                var tree_children  = alphaBetaPruning( node, depth - 1, alpha, beta, -player,  move );
                if( tree_children['alphabeta'] >  value ){
                  value = tree_children['alphabeta'];
                  tree = {};
                  tree.matrix = node;
                  tree.move = move;
                  tree.alphabeta = alpha;
                }

                alpha =  Math.max(alpha, value);

                if( beta <= alpha ){
                    break;
                }
            }
            return { 'alphabeta':  value, 'tree': tree  };
        }else{
            var value = inf;
            var tree = {};

            for( var i=0;  i<children.length;  i++ ){
                var node = children[i].matrix;
                var move = children[i].move;

                var tree_children = alphaBetaPruning( node, depth - 1, alpha, beta, -player,  move );
                if( tree_children['alphabeta'] < value  ){
                  value = tree_children['alphabeta'];
                  tree = {};
                  tree.matrix = node;
                  tree.move = move;
                  tree.alphabeta = beta;
                }
                beta = Math.min(beta, value);

                if( beta <= alpha ){
                    break;
                }
            }
            return {  'alphabeta': value, 'tree': tree };
        }
    }


    function play( matrix_in ) {
      var out = {};

      //histHumanMatrix.push(matrix_in);

      var eval = logic.evaluate( matrix_in, human );
      if( eval.win  ){
        return { 'win': eval.win, 'draw': 0, 'matrix':matrix_in  };
      }
      var possibleMovesComp = logic.possibleMoves(matrix_in, comp);
      if( !possibleMovesComp.length ){
        //  , 'draw': comp
        return { 'win': human,  'draw': 0, 'matrix':matrix_in  };
      }

      var  matrix_out = logic.getBestMatix( matrix_in, comp );

      var eval = logic.evaluate( matrix_out.matrix, comp  );
      if( eval.win  ){
        return { 'win': eval.win, 'draw': 0, 'matrix':matrix_out.matrix, 'move':matrix_out.move  };
      }
      var possibleMovesHuman = logic.possibleMoves(matrix_out.matrix, human);
      if( !possibleMovesHuman.length ){
        //'draw': human
        return { 'win': comp,  'draw': 0, 'matrix':matrix_out.matrix, 'move':matrix_out.move   };
      }

      histCompMatrix.push(matrix_out.matrix);
      var isDraw = logic.isDraw();

      var play = { 'win': 0, 'draw': isDraw, 'matrix':matrix_out.matrix, 'move':matrix_out.move   };
      //console.log(play);
      return play;
    }

    function isDraw() {

      if( histCompMatrix.length > 10 ){
        var lengthComp = histCompMatrix.length;
        var compareOdd = compareMatrix( histCompMatrix[lengthComp-1], histCompMatrix[lengthComp-3], histCompMatrix[lengthComp-5]);
        var compareEven = compareMatrix( histCompMatrix[lengthComp-2], histCompMatrix[lengthComp-4], histCompMatrix[lengthComp-6]);
        if( compareOdd && compareEven ){
          return 1;
        }
      }
      return 0;
    }

    function compareMatrix(matrix1, matrix2, matrix3){
      var theSame = true;
      for (var y=0;y<rows;y++) {
          for (var x=0;x<cols;x++) {
              if(matrix1[y][x] !== matrix2[y][x]){
                theSame = false;
                break;
              }
              if(matrix2[y][x] !== matrix3[y][x]){
                theSame = false;
                break;
              }
          }
      }
      return theSame;
    }



    return {
        init : init,
        play : play,
        isDraw : isDraw,
        evaluate : evaluate,
        initMatrix : initMatrix,
        //initTestMatrix: initTestMatrix,
        possibleMove : possibleMove,
        possibleOneStepMove : possibleOneStepMove,
        possibleBeatsMove : possibleBeatsMove,
        getValue : getValue,
        copyMarix : copyMarix,
        getEnemiesByValue : getEnemiesByValue,
        possibleMoves : possibleMoves,
        getMatrixByPossibleMoves: getMatrixByPossibleMoves,
        getYForHuman: getYForHuman,
        becomeKing: becomeKing,
        getBestMatix: getBestMatix,
        getMandatoryMoveByPossibleMoves: getMandatoryMoveByPossibleMoves,
        becomeKing: becomeKing,
        possibleBeatsKing: possibleBeatsKing,
        possibleSimpleKingMove: possibleSimpleKingMove,
        evaluateMaxScoreByBeat : evaluateMaxScoreByBeat
    };

})();
