display = (function() {
    var
        lang,
        cols,
        rows,
        ticSize,
        ticPadding,
        ticPaddingX,
        ticWidth,
        ticWidthX,
        sizeLoader,
        theme_black,
        theme_white,
        theme_logo_red,
        divWrapLevel,
        divLevel,
        levelTextPadding,
        levelLengthCircle,
        boardElement,
        divThink,
        divDisplayText,
        matrix,
        ctx,
        anim,
        canvas,
        think,
        possibleMoves,
        possibleMovesKey,
        worker,
        mapLevelToDepth,
        animateRatio
        //counterMove
        ;


    function createBackground( bgctx ){
        var x_start = 0;
        var y_itart = 0;

        for (var y=0;y<rows;y++) {
            for (var x=0;x<cols;x++) {
                x_start = x * ticSize;
                y_start = y * ticSize;
                bgctx.fillStyle = ((x+y) % 2) ? ttt.color.theme_light_blue : '#FFFFFF' ;
                bgctx.fillRect( x_start, y_start, ticSize, ticSize);
                //matrix[x][y] = ttt.action.blank;
            }
        }
    }

    function oneBoxBackground(bgctx, x, y ){
      var x_start = x * ticSize;
      var y_start = y * ticSize;
      bgctx.fillStyle = ttt.color.theme_light_blue;
      bgctx.fillRect( x_start, y_start, ticSize, ticSize);

    }


    function drawBoardByMatrix(matrixIn){
      for (var y=0;y<rows;y++) {
        for (var x=0;x<cols;x++) {
          var value = logic.getValue(matrixIn, x, y);
          if(value){
            drawChequer( x, y, value, false );
          }
        }
      }
    }

    function drawChequer( x, y, value, isRed ){
      if( ttt.action.draftsman_white === value ){
        draftsmanWhite(x,y, isRed);
      }else if( ttt.action.king_white === value ){
        kingWhite(x,y, isRed);
      }else if( ttt.action.draftsman_black === value ){
        draftsmanBlack(x,y, isRed);
      }else if( ttt.action.king_black === value ){
        kingBlack(x,y, isRed);
      }
    }

    function draftsmanWhite(x,y, isRed) {
      x_start = x * ticSize;
      y_start = y * ticSize;

      var color = isRed ? theme_logo_red : theme_white;
      drawO( ctx, x_start, y_start, color, false );
    }

    function kingWhite(x,y, isRed ){
      x_start = x * ticSize;
      y_start = y * ticSize;

      var color = isRed ? theme_logo_red : theme_white;
      drawO( ctx, x_start, y_start, color, true );
    }
    function draftsmanBlack(x,y){
      x_start = x * ticSize;
      y_start = y * ticSize;

      drawO( ctx, x_start, y_start, theme_black, false );
    }
    function kingBlack(x,y){
      x_start = x * ticSize;
      y_start = y * ticSize;

      drawO( ctx, x_start, y_start, theme_black, true );
    }


    function drawO( octx, start_x, start_y, style, is_fill ){
        var half = Math.floor(ticSize/2);
        var r =  half - ticPadding;

        octx.beginPath();

        octx.arc(  start_x + half, start_y + half,  r  , 0, 2 * Math.PI, false);
        if(is_fill){
          octx.fillStyle = style;
        }

        octx.lineWidth =  ticWidth;
        octx.strokeStyle = style; //(style == 'black') ?  theme_black :  theme_logo_red;

        octx.stroke();
        if(is_fill){
          octx.fill();
        }

    }

    function drawXByXY(xctx, x, y ){
      var start_x = x * ticSize;
      var start_y = y * ticSize;

      drawX( xctx,  start_x, start_y );
    }

    function drawX( xctx,  start_x, start_y ){
        var endP = ticSize - ticPaddingX;
        var x_start_point = start_x + ticPaddingX;
        var x_stop_point = start_x + endP;
        var y_start_point =  start_y +  ticPaddingX;
        var y_stop_point =  start_y + endP;

        xctx.beginPath();
        xctx.moveTo( x_start_point , y_start_point );
        xctx.lineTo( x_stop_point  , y_stop_point  );
        xctx.moveTo( x_start_point , y_stop_point  );
        xctx.lineTo( x_stop_point  , y_start_point );

        xctx.lineWidth =  ticWidthX;
        xctx.strokeStyle = theme_logo_red;
        xctx.stroke();
    }

    function displayFinish( move ){
        divDisplayText = document.createElement("div");
        divDisplayText.id = "display_text";
        divDisplayText.style.width = (cols  * ticSize ) + "px";
        divDisplayText.style.paddingTop =  '3px';
        divThink.appendChild(  divDisplayText );
        if( move.draw ){
            divDisplayText.textContent =  ttt.text[lang].draw;
        }else if( human === move.win ){
            ttt.score.you += 1;
            divDisplayText.textContent =  ttt.text[lang].you_win;
        } else if( comp === move.win ){
            ttt.score.cpu += 1;
            divDisplayText.textContent =  ttt.text[lang].cpu_win;
        }
    }

    function startThink(){
        var marginLeft = Math.floor((cols -  sizeLoader)/2);
        anim = document.createElement("div");
        anim.id = "anim";
        anim.style.marginLeft = marginLeft * ticSize +'px' ;

        divThink.appendChild( anim );
        requestAnimationFrame(animate);
    }
    function stopThink(){
        divThink.removeChild( anim );
    }
    function onError(e) {
        document.getElementById('error').textContent = [
        'ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message].join('');
    }

    function animate(time) {
        var r = (sizeLoader * ticSize/2) * 0.8;
        anim.style.left = (r + Math.cos(time /30) * r) + "px";
        anim.style.top = ( r + Math.sin(time /30) * r) + "px";

        requestAnimationFrame(animate);
    }

    function displayScore( ttt_in ){
        document.getElementById('you_score').textContent = ttt_in.score.you;
        document.getElementById('cpu_score').textContent = ttt_in.score.cpu;
    }

    function drawLevelCircle( lctx,  numberLevel ){
        var r = Math.floor(levelLengthCircle/2);
        lctx.beginPath();
        var level = parseInt(numberLevel);
        //var depth =
        lctx.fillStyle = ( mapLevelToDepth[level] == ttt.action.max_depth  ) ? ttt.color.theme_light_blue : '#FFFFFF';
        lctx.arc( r, r , r, 0, 2 * Math.PI, false);
        lctx.lineWidth =  2;
        lctx.strokeStyle = theme_light_black;
        lctx.stroke();
        lctx.fill();
    }

    function drawLevelNumber( lctx, numberLevel ){
      lctx.font = "lighter 14px Verdana, Arial, Helvetica, sans-serif ";
      lctx.textAlign = "center";
      lctx.strokeText(numberLevel, 15, 22);
    }

    function createLevelCanvas( level ){
        var lCanvas = document.createElement("canvas");
        lCanvas.width = levelLengthCircle;
        lCanvas.height = levelLengthCircle;
        lCanvas.className = "circle";
        lCanvas.style.marginRight =   Math.floor(ticSize/3)+ "px";
        var lctx = lCanvas.getContext("2d");
        drawLevelCircle( lctx, level );
        //drawLevelNumber( lctx, level );
        return lCanvas;
    }


    function setup( ttt ) {
        lang = ttt.lang,
        cols = ttt.action.cols,
        rows = ttt.action.rows,
        human =  ttt.action.human;
        comp = ttt.action.comp;
        ticSize = ttt.settings.ticSize;
        ticPadding = ttt.settings.ticPadding;
        ticPaddingX = parseInt( ticSize * 0.35); //ticPaddingX =  ttt.settings.ticPaddingX; //it was 26
        ticWidth = ttt.settings.ticWidth;
        ticWidthX = ttt.settings.ticWidthX;
        theme_black = ttt.color.theme_black;
        theme_white = ttt.color.theme_white;
        theme_logo_red = ttt.color.theme_logo_red;
        theme_light_black = ttt.color.theme_light_black;
        sizeLoader = ttt.settings.sizeLoader;
        mapLevelToDepth = ttt.action.mapLevelToDepth;
        animateRatio = ttt.settings.animateRatio;

        canvas = document.createElement("canvas");
        canvas.id = "main_canvas";
        canvas.width = cols * ticSize;
        canvas.height = rows * ticSize;
        ctx = canvas.getContext("2d");
        createBackground( ctx );


        boardElement = document.getElementById("game-board");
        boardElement.appendChild(canvas);

        divThink = document.getElementById('think');
        divThink.style.height = (sizeLoader * ticSize) +"px";

        var widthGame = cols  * ticSize;


        var el_header =  document.getElementsByTagName('header');

        if(  el_header.length   ){
            el_header[0].style.width = widthGame + "px";
            el_header[0].style.height = ticSize + "px";
        }

        document.getElementById('score').style.width = widthGame + "px";


        divWrapLevel = document.getElementById('wrapLevel');
        divLevel = document.createElement('div');
        divLevel.id  = 'level';
        divWrapLevel.appendChild(divLevel);


        levelLengthCircle =  Math.floor( ticSize/2 );

        divLevel.style.marginLeft = "3px";
        divLevel.style.width = widthGame + "px";
        divLevel.style.height = levelLengthCircle  + "px";

        var divLevelText = document.createElement("div");
        divLevelText.textContent = ttt.text[lang].level;
        divLevelText.style.marginRight = levelLengthCircle + "px";
        divLevel.appendChild( divLevelText  );

        levelTextPadding = Math.floor( ticSize/8 );


        var el_h1 =  document.getElementsByTagName('h1');
        if(  el_h1.length  ){
            el_h1[0].textContent = ttt.text[lang].title;
        }

        document.getElementById('cpu').textContent = ttt.text[lang].cpu;
        document.getElementById('you').textContent = ttt.text[lang].you;
    }

    function clickBall(e){

      if( think === 1  ){
          return false;
      }


      rect = canvas.getBoundingClientRect()

      relX = e.clientX - rect.left;
      relY = e.clientY - rect.top;

      ticX = Math.floor( (relX / rect.width) * cols);
      ticY = Math.floor( (relY / rect.width) * rows);

      var value = logic.getValue(matrix, ticX, ticY);
      if(  (ttt.action.draftsman_white === value) || (ttt.action.king_white === value) ){

        createBackground( ctx );
        drawBoardByMatrix(matrix);


        for(var i in possibleMoves){
          if( (possibleMoves[i].x === ticX) && (possibleMoves[i].y === ticY) ){
            possibleMovesKey = i;
            drawChequer( ticX, ticY, value, true );
            for(var j in  possibleMoves[i].move){
              drawXByXY( ctx, possibleMoves[i].move[j].x, possibleMoves[i].move[j].y);
            }
          }
        }
      }else if( (ttt.action.blank === value) && ('' !== possibleMovesKey ) ){
        var moves = possibleMoves[possibleMovesKey].move;
        for(var j in  moves){
          if( ( moves[j].x === ticX  ) && ( moves[j].y === ticY ) ){
            var fromX  = possibleMoves[possibleMovesKey].x;
            var fromY  = possibleMoves[possibleMovesKey].y;

            matrix[fromY][fromX] = ttt.action.blank;

            if(  'undefined' !== typeof moves[j].beats ){
              var beats = moves[j].beats
              for(var k in beats){
                matrix[beats[k].beat_y][beats[k].beat_x] = ttt.action.blank;
              }
            }
            matrix[ticY][ticX] = possibleMoves[possibleMovesKey].value;
            possibleMovesKey = '';

            matrix = logic.becomeKing(matrix);
            createBackground( ctx );
            drawBoardByMatrix(matrix);
            startThink();
            think = 1;

            // var promise1 = new Promise(function(resolve, reject) {
            //   setTimeout(function() {
            //     resolve('comp_move');
            //   }, 10);
            // });

            //promise1.then(function(value) {
            worker.postMessage({cmd:'play', conf: ttt.action, matrix: matrix});
            //});

          }
        }
      }
    }

    function isFinishByPalyer( move, palyer ){
      if( (move.draw === palyer) || (move.win === palyer) ){
        think = 1;
        displayFinish( move );
        setTimeout(function(){
            boardElement.removeChild(canvas);
            divWrapLevel.removeChild(divLevel);
            ttt.action.who_first = -1*ttt.action.who_first;
            worker.terminate();
            initialize( ttt  );
        },4000);
      }
    }


    function initialize( ttt ) {
        setup( ttt  );
        divThink.textContent = '';
        displayScore( ttt );

        possibleMoves = [];
        possibleMovesKey = '';
        think = 0;


        worker = new Worker( ttt.path + 'scripts/do.work.js');

        logic.init( ttt.action );
        matrix = logic.initMatrix();
        //matrix = logic.initTestMatrix();
        drawBoardByMatrix(matrix);

        worker.addEventListener('message', function(e) {

            if( e.data.cmd == 'init' ){
              possibleMoves = e.data.possibleMoves;
            }

            if( e.data.cmd == 'play'  ){

              stopThink();
              var move = e.data.move;
              isFinishByPalyer( move, human );

              /*******************************/
              /* animation move ball  - start*/
              /*******************************/
              var pointsMove = []; //beat or move checker
              var moveFromX = '';
              var moveFromY = '';

              if(typeof move.move !== 'undefined' ){ //this logic can be moved to model,

                var movemove = move.move;
                moveFromX = movemove.from_x;
                moveFromY = movemove.from_y;

                if(typeof movemove.beats  !== 'undefined'  ){
                  var movemovebeats = movemove.beats;
                  for(j in movemovebeats){
                    pointsMove.push({ x:movemovebeats[j].x, y:movemovebeats[j].y });
                  }
                }else{
                  pointsMove.push({ x:movemove.x, y:movemove.y });
                }
              }

              var startValue = logic.getValue(matrix, moveFromX, moveFromY);
              drawXByXY(ctx, moveFromX, moveFromY );

              var t = 0;
              var animIncrement = 0;
              var animOldVals = [];

              requestAnimationFrame(animateCircle);

              function animateCircle()
              {
                var half = Math.floor(ticSize/2);
                var r =  half - ticPadding;

                if (t > pointsMove.length * r) {
                  createBackground( ctx );
                  drawBoardByMatrix(move.matrix);

                  var mandatoryMoves = e.data.mandatoryMoves;
                  if( mandatoryMoves.length){
                    for(var i in  mandatoryMoves){
                      drawChequer( mandatoryMoves[i].x, mandatoryMoves[i].y, mandatoryMoves[i].value, true );
                    }
                  }

                  return false;
                }

                ctx.beginPath();
                ctx.fillStyle = (ttt.action.draftsman_black === startValue) ? ttt.color.theme_light_blue : theme_black;
                ctx.lineWidth =  ticWidth;
                ctx.strokeStyle = theme_black;

                for(var cc = 0; cc < pointsMove.length;  cc++){
                  if( ( t >= (cc * r) )  &&  ( t < (cc+1)* r ) ){

                    if( (animIncrement > 0) && (animOldVals[animIncrement - 1].cc !== cc) ){
                      oneBoxBackground(ctx, animOldVals[animIncrement - 1].x, animOldVals[animIncrement - 1].y ); //clear last ball in anim
                    }
                    var rr = t - (cc * r);
                    ctx.arc(  (ticSize * pointsMove[cc].x) + half,  (ticSize * pointsMove[cc].y) + half, rr , 0, 2 * Math.PI, false);
                    animOldVals[animIncrement] = { cc: cc, x:pointsMove[cc].x, y: pointsMove[cc].y };
                  }
                }

                ctx.stroke();
                ctx.fill();

                t = t + animateRatio;
                animIncrement++;
                requestAnimationFrame(animateCircle);
              }

              /*******************************/
              /* animation move ball  - stop*/
              /*******************************/

              isFinishByPalyer( move, comp );
              possibleMoves =  e.data.possibleMoves;

              matrix = logic.copyMarix(move.matrix);
              if( !( move.draw || move.win ) ){
                think = 0;
              }

            }

            canvas.addEventListener("click", clickBall, false);
        }, false);

        worker.postMessage({cmd:'init', conf: ttt.action });
        if( ttt.action.who_first == ttt.action.comp ){
          think = 1;
          startThink();
          worker.postMessage({cmd:'play', conf: ttt.action , matrix: matrix});
        }

        for(var i in mapLevelToDepth){
            var lCanvas = createLevelCanvas( i );
            var depth = mapLevelToDepth[i];
            lCanvas.id = 'level_'+depth;
            lCanvas.addEventListener("click", function(e){
                boardElement.removeChild(canvas);
                divWrapLevel.removeChild(divLevel);
                var depthChoose = parseInt( this.id.match( /\d+$/ ) );
                ttt.action.max_depth = depthChoose;
                worker.terminate();
                initialize( ttt  );
            }, false);

            divLevel.appendChild(lCanvas);
        }

        worker.addEventListener('error', onError, false);
    }

    return {
        initialize : initialize
    }
})();
