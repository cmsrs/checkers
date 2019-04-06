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
        comp ;

    function init( conf ){
        cols = conf.cols;
        rows = conf.rows;
        draftsman_white = conf.draftsman_white;
        king_white = conf.king_white;
        draftsman_black = conf.draftsman_black;
        king_black = conf.king_black;
        init_number_draftsman = conf.init_number_draftsman;
        max_depth  = conf.max_depth;
        inf =  conf.inf;
        human =  conf.human;
        blank = conf.blank;
        comp = conf.comp;
        coef_checker = conf.coef_checker;
        //draw_after_moves = conf.draw_after_moves;


        //return  initMatrix();
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
      //var possibleMoves = logic.possibleMoves(matrix, player);

      //console.log(possibleMoves);

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
              //var isBeats = false;
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
            //console.log('scoreBeat', scoreBeat );
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
      var move = 6;

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
        // if(  (beatX === wasBeatX) &&  (beatY === wasBeatY)  ){ //nie mozna bic do tylu
        //   break;
        // }

        if( !notBlank.length && getValue(matrixIn, beatX, beatY) &&  (blank === getValue(matrixIn, newX, newY)) && inArray(matrixIn[beatY][beatX],enemies) ){
          isKingBeat = true;
          break;
        }
      }
      return isKingBeat;
    }


    function kingBeatOneSite(matrixIn, x, y, value, enemies  , wasBeatX, wasBeatY, signX, signY ) {
      var out = [];
      var move = 6;

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
      var move = 6;

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



    function possibleBeatsMoveArr(matrixIn, inn ,enemies, arrBeats, terminateIn){

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
        terminateIn.push(inn);
      }

      for (ii in out){
        arrBeats.push(out[ii]);
        var children = possibleBeatsMoveArr(matrixIn, out[ii], enemies, arrBeats, terminateIn);
      }
      return  {'arrBeats': arrBeats, 'terminateIn': terminateIn} ;
    }


    /**
    * Nowa wersja
    */
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
        for(let j=1; j<pathLen; j++  ){
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

      for (ii in out){
        paths = possibleBeatsMovePath(matrixIn, out[ii], enemies, pathIn, pathLen, paths);
      }
      return paths;
    }

/*
    function possibleBeatsMove_depraciate(matrix, x, y){
      var arrBeats = possibleBeatsMoveArrWrap(matrix, x, y);


      if(!arrBeats  || !arrBeats.arrBeats.length){
        return false;
      }
    function possibleBeatsMoveArrWrap_depreciate(matrix, x, y){
*/


    function possibleBeatsMove(matrix, x, y){
      var value = logic.getValue(matrix, x, y);
      if(!value){
        return false;
      }

      enemies = logic.getEnemiesByValue(value);

      //var arrIn = [];
      //var terminateIn = [];
      var pathIn = [];
      var pathLen = 0;
      var paths = [];

      var inn = {'x': x, 'y' : y, 'value': value,  'beat_x': x, 'beat_y': y };

      var matrixIn = logic.copyMarix(matrix);
      //var beatsMove = logic.possibleBeatsMoveArr(matrixIn, inn, enemies, arrIn, terminateIn);
      var beatsMove = possibleBeatsMovePath(matrixIn, inn, enemies, pathIn, pathLen, paths);


      // console.log('---arrBeats return false----', beatsMove );
      //console.log(beatsMove);
      // return false;

      return beatsMove;
    }

    function inArrayBeats(needle, haystack) {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if( (haystack[i].in_x === needle.in_x) &&
                (haystack[i].in_y === needle.in_y) &&
                (haystack[i].beat_x === needle.beat_x ) &&
                (haystack[i].beat_y === needle.beat_y ) &&
                (haystack[i].value === needle.value ) ){
              return true;
            }
        }
        return false;
    }


    /**
    * damka po biciu moze zuszyc sie w pare miejsc
    */
    function getTmpKingPossibleBeatsByArrBeats(arrBeats) {
        //console.log('arrBeats',   arrBeats);
        beats = [];
        for(var i in  arrBeats){
          var beatItem = { 'in_x': arrBeats[i].in_x, 'in_y': arrBeats[i].in_y, 'beat_x':  arrBeats[i].beat_x, 'beat_y': arrBeats[i].beat_y, 'value': arrBeats[i].value  };
          if( !inArrayBeats(beatItem, beats) ){
            beatItem.kingMoveAfterBeats = [];
            beats.push(beatItem);
          }
        }
        for(var j in beats){
          var beat = beats[j];
          for(var k in  arrBeats){
            if( (arrBeats[k].in_x === beat.in_x) &&
                (arrBeats[k].in_y === beat.in_y) &&
                (arrBeats[k].beat_x === beat.beat_x) &&
                (arrBeats[k].beat_y === beat.beat_y) &&
                (arrBeats[k].value === beat.value) ){
              beat.kingMoveAfterBeats.push({'x':arrBeats[k].x, 'y':arrBeats[k].y });
            }
          }
        }
        return beats;
    }

    function getTerminateKing(tmpArrBeats){
      kingBeats = [];

      //console.log(terminateInTmp);
      for(var k in  tmpArrBeats){
        var kingMoveAfterBeats = tmpArrBeats[k].kingMoveAfterBeats;
        for(var i in kingMoveAfterBeats){
          var lastMove = { 'in_x': tmpArrBeats[k].in_x,
                            'in_y': tmpArrBeats[k].in_y,
                            'beat_x':tmpArrBeats[k].beat_x,
                            'beat_y':tmpArrBeats[k].beat_y,
                            'value':tmpArrBeats[k].value,
                            'x': kingMoveAfterBeats[i].x,
                            'y': kingMoveAfterBeats[i].y
                          };
          kingBeats.push(lastMove);
        }
      }

      return kingBeats;
    }


    function possibleBeatsMove_depraciate(matrix, x, y){
      var arrBeats = possibleBeatsMoveArrWrap(matrix, x, y);


      if(!arrBeats  || !arrBeats.arrBeats.length){
        return false;
      }

      var value = getValue(matrix, x, y );
      var terminateIn = arrBeats.terminateIn;


      //komentujac tego if-a - gra nie bedzie zgodna z zadadami - ale mozna podkrecic zmienna max_depth np na 8
      //patrz 'bug' - to jest nastepny problem
      /*
      if( (king_white === value) || (king_black === value)   ){
        var tmpArrBeats = getTmpKingPossibleBeatsByArrBeats(arrBeats.arrBeats);

        var terminateInTmp = [];
        terminateInTmp = getTerminateKingBeats( tmpArrBeats, x, y, terminateInTmp );
        var terminateIn = getTerminateKing(terminateInTmp);
      }
      */





      var move = 8;
      outt = [];
      if(arrBeats.arrBeats.length){
        for( i in terminateIn){
          var arrBeatsMove = [];
          arrBeatsMove = getBeats(arrBeats.arrBeats, x, y, terminateIn[i], arrBeatsMove);
          outt.push({'x':terminateIn[i].x, 'y':terminateIn[i].y, 'beats': arrBeatsMove });
        }
      }
      return outt;
    }

    /**
    * bierzemy tylko ostatnie mozliwosci klikniecia na dane skosowanie - TODO!!! - mozliwosc zapetlenia!! - patrz testy 'bug'
    */
    function getTerminateKingBeats(  tmpArrBeats, x, y, kingBeats ){
        var findBeat = [];
        for(var k in tmpArrBeats){
          var kingMoveAfterBeats = tmpArrBeats[k].kingMoveAfterBeats;
          if( (tmpArrBeats[k].in_x === x) && (tmpArrBeats[k].in_y === y) ){

            var find = false;

            for(var j in kingMoveAfterBeats){
              var newX = kingMoveAfterBeats[j].x;
              var newY = kingMoveAfterBeats[j].y;
              for(var kk in tmpArrBeats){
                if( (tmpArrBeats[kk].in_x === newX) && (tmpArrBeats[kk].in_y === newY) ){
                  find = true;
                  //findBeat.push({'x':newX, 'y':newY});
                  getTerminateKingBeats( tmpArrBeats, newX, newY, kingBeats ); //malo optymalne dla depth 12.
                }
              }
            }

            if(!find){
              //console.log(tmpArrBeats[k]);
              if( !inArrayBeats(tmpArrBeats[k], kingBeats)){
                kingBeats.push(tmpArrBeats[k]);
              }
            }
          }
        }

        return kingBeats;
      }

    function getBeats( arrBeats , x, y, terminateIn, out ){
      if( x === terminateIn.in_x && y === terminateIn.in_y && out.length ){
        out.push( terminateIn );
        return out;
      }
      out.push( terminateIn );

      for(var i in  arrBeats){
        if( (arrBeats[i].x ===  terminateIn.in_x) &&  (arrBeats[i].y ===  terminateIn.in_y) ){
          return getBeats( arrBeats , x, y, arrBeats[i], out );
        }
      }

      return out;
    }

    function possibleSimpleKingMove(matrixIn, x, y, value){

      var out = [];
      var move = 8;

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
        evalY = 10;
      }else if(  1<=y<=2 ){
        evalY = 2;
      }else if( 3<=y<=4 ){
        evalY = 4;
      }else if( 5<=y<=6 ){
        evalY = 8;
      }else if( y===7 ){
        evalY = 10;
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

            if( ((x === 0) ||  (x === cols-1))  &&  (  (draftsman_white === value) || (draftsman_black === value)  ) ){
               sumX = 2*value;
            }


            if( (player === human) &&  ( draftsman_white === value  ) ){
              //sumY += Math.abs(y-(cols-1));
              var yTmp = getYForHuman(y);
              sumY += evaluateY(yTmp);
              //sumY += getYForHuman(y);
            }
            if( (player === comp) &&  ( draftsman_black === value  ) ){
              var yTmp = y;
              sumY += evaluateY(yTmp);
              //sumY += -y;
            }

            if( inArray(value,playerValues) ){
              scorePlayer += value;
            }
            if( inArray(value,enemyValues) ){
              scoreEnemy += value;
            }
          }
        }
        var sum = (scorePlayer + scoreEnemy);

        if(sum > 0 &&  (!scorePlayer || !scoreEnemy) ){
          win = human;
        }

        if(sum < 0 &&  (!scorePlayer || !scoreEnemy) ){
          win = comp;
        }

        //console.log( ' player=' + player + ' sumY='+sumY );
        var maxScoreByBeat = evaluateMaxScoreByBeat( matrix, player );
        var maxScoreByBeatEnemy = evaluateMaxScoreByBeat( matrix, -1*player );

        //console.log( 'maxScoreByBeat', maxScoreByBeat);
        //console.log( 'maxScoreByBeatEnemy', maxScoreByBeatEnemy );


        score = scorePlayer*coef_checker + player*sumY + sumX + player*maxScoreByBeat*coef_checker - player*maxScoreByBeatEnemy*coef_checker;

        //console.log(scorePlayer,maxScoreByBeat, sumY, maxScoreByBeatEnemy);

        return { score: score, win: win};
    }

    function getBestMatix( matrix_in, player ){
        var tree_ab  = alphaBetaPruning( matrix_in, 0,  -inf, inf, player );
        //console.log(tree_ab); return false;


        var  matrix_out = getMatrix(  tree_ab.tree, tree_ab.alphabeta  );
        return  matrix_out
    }

    function getMatrix( tree , alphabeta  ){
        var tree_len = tree.length;

        for( var i=0; i<tree_len; i++ ){
            if( tree[i].alphabeta == alphabeta  ){
                return tree[i]; //.matrix;
            }
        }
        return false;
    }


    function alphaBetaPruning( node, depth, alpha, beta, player ){

        var eval = evaluate( node, player );
        var possibleMoves = logic.possibleMoves(node, player);
        if(  (eval['win'] !== 0 )   || ( eval['score'] === 0 ) || ( !possibleMoves.length ) || (depth >= max_depth ) ){
            return  { 'alphabeta': eval['score'], 'tree' : null };
        }

        var children = logic.getMatrixByPossibleMoves(node, player, possibleMoves);
        depth++;


        if( player == human ){ //maximizingPlayer
            var tree = [];
            for( var i=0;  i<children.length;  i++ ){
                tree[i] = {};
                tree[i].matrix = children[i].matrix;
                tree[i].move = children[i].move;
                //var tree_children  = alphaBetaPruning( children[i].matrix, depth, alpha, beta, -player  );
                var tree_children  = alphaBetaPruning( children[i].matrix, depth, alpha, beta, comp  );
                var alpha = ( tree_children['alphabeta'] > alpha  ) ?  tree_children['alphabeta'] : alpha;

                tree[i].alphabeta = alpha;
                if( beta <= alpha ){
                    break;
                }
            }
            return {  'alphabeta':  alpha, 'tree': tree };
        }else{
            var tree = [];
            for( var i=0;  i<children.length;  i++ ){
                tree[i] = {};
                tree[i].matrix = children[i].matrix;
                tree[i].move = children[i].move;
                var tree_children = alphaBetaPruning(  children[i].matrix, depth, alpha, beta, human );
                var beta = ( tree_children['alphabeta'] < beta  ) ?  tree_children['alphabeta'] :  beta;

                tree[i].alphabeta = beta;
                if( beta <= alpha ){
                    break;
                }
            }
            return {  'alphabeta':  beta, 'tree': tree };
        }
    }


    function play( matrix_in ) {
      var out = {};
      //matrix_in = logic.becomeKing(matrix_in);

      var eval = logic.evaluate( matrix_in, human );
      if( eval.win  ){
        return { 'win': eval.win, 'draw': 0, 'matrix':matrix_in  };
      }
      var possibleMovesComp = logic.possibleMoves(matrix_in, comp);
      if( !possibleMovesComp.length ){
        return { 'win': 0, 'draw': comp, 'matrix':matrix_in  };
      }

      var  matrix_out = logic.getBestMatix( matrix_in, comp );
      //matrix_out.matrix = logic.becomeKing(matrix_out.matrix);

      var eval = logic.evaluate( matrix_out.matrix, comp  );
      if( eval.win  ){
        return { 'win': eval.win, 'draw': 0, 'matrix':matrix_out.matrix, 'move':matrix_out.move  };
      }
      var possibleMovesHuman = logic.possibleMoves(matrix_out.matrix, human);
      if( !possibleMovesHuman.length ){
        return { 'win': 0, 'draw': human, 'matrix':matrix_out.matrix, 'move':matrix_out.move   };
      }

      return { 'win': 0, 'draw': 0, 'matrix':matrix_out.matrix, 'move':matrix_out.move   };
    }

    return {
        init : init,
        play : play,
        evaluate : evaluate,
        initMatrix : initMatrix,
        possibleMove : possibleMove,
        possibleOneStepMove : possibleOneStepMove,
        possibleBeatsMoveArr: possibleBeatsMoveArr,
        //possibleBeatsMoveArrWrap: possibleBeatsMoveArrWrap,
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
