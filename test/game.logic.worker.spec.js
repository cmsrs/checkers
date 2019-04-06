require('../scripts/config');
require('../scripts/game.logic.worker');

var assert = require('assert');

var conf = {};
var testMatrix = [];
var testMatrixEmpty = [];
var initMatrix = [];
var testX = '';
var testY = '';


describe('gameLogicWorker', function() {

  before(function() {
    conf = config.getConfig();
  });

  beforeEach(function() {
    logic.init(conf.action);
    initMatrix = logic.initMatrix();

    for (var y=0;y<conf.action.rows;y++) {
        testMatrixEmpty[y] = [];
        for (var x=0;x<conf.action.cols;x++) {
            testMatrixEmpty[y][x] = '';
            if( ( x%2 && !(y%2) ) || ( !(x%2) && y%2 ) ){
              testMatrixEmpty[y][x] = conf.action.blank;
            }
        }
    }

    for (var y=0;y<conf.action.rows;y++) {
        testMatrix[y] = [];
        for (var x=0;x<conf.action.cols;x++) {
            testMatrix[y][x] = '';
            if( ( x%2 && !(y%2) ) || ( !(x%2) && y%2 ) ){
              testMatrix[y][x] = conf.action.blank;
            }
        }
    }

    testX = 5;
    testY = 0;
    testMatrix[testY][testX] = conf.action.draftsman_black;
    testMatrix[1][6] = conf.action.draftsman_white;
    testMatrix[1][4] = conf.action.draftsman_white;
    testMatrix[1][2] = conf.action.draftsman_white;
    testMatrix[3][2] = conf.action.draftsman_white;
    testMatrix[3][4] = conf.action.draftsman_white;
    testMatrix[5][4] = conf.action.draftsman_white;

  });

  afterEach(function() {
    testMatrix = [];
    testMatrixEmpty = [];
    initMatrix = [];
  });

  after(function() {
    testMatrix = [];
    testMatrixEmpty = [];
    initMatrix = [];
    conf = {};
    testX = '';
    testY = '';

  });

  describe('evaluateMaxScoreByBeat( matrix, player )', function() {
    it('get max score after beating checkers ', function() {

      testMatrixEmpty[5][2] = conf.action.draftsman_white;
      testMatrixEmpty[7][6] = conf.action.king_white;

      testMatrixEmpty[4][1] = conf.action.draftsman_black;
      testMatrixEmpty[4][3] = conf.action.draftsman_black;
      testMatrixEmpty[2][1] = conf.action.draftsman_black;
      testMatrixEmpty[1][4] = conf.action.king_black;
      //testMatrixEmpty[2][3] = conf.action.king_black;

      var out = logic.evaluateMaxScoreByBeat(testMatrixEmpty, conf.action.human );
      assert.equal(out, 101);

    });
  });

  describe('possibleMoves(matrix, player)', function() {
    it('epossibleMoves init matrix', function() {
      //var initMatrix = logic.initMatrix();
      //var out = logic.possibleMoves(initMatrix, conf.action.comp);
      var out = logic.possibleMoves(initMatrix, conf.action.human);
      assert.equal(out.length, 4);
      for(i in out){
        assert.equal(typeof out[i].x, 'number');
        assert.equal(out[i].y, 5);
        assert.equal(out[i].value, conf.action.draftsman_white);
        assert.equal(typeof out[i].move, 'object');
        if( 0 == i){
          assert.equal(out[i].move.length, 1);
        }else{
          assert.equal(out[i].move.length, 2);
        }
      }
    });

    it('possibleMoves init modification matrix - is beat mandatory check', function() {
      initMatrix[2][1] = conf.action.blank;
      initMatrix[3][0] = conf.action.draftsman_black;

      initMatrix[4][1] = conf.action.draftsman_white;
      initMatrix[5][2] = conf.action.blank;

      initMatrix[4][7] = conf.action.draftsman_white;
      initMatrix[5][6] = conf.action.blank;

      //console.log(initMatrix);
      var out = logic.possibleMoves(initMatrix, conf.action.comp);
      //console.log(out[0].move[0]);

      assert.equal(out.length, 1);

    });

  });
  describe('getMandatoryMoveByPossibleMoves(possibleMoves)', function() {
    it('getMandatoryMoveByPossibleMoves test matrix', function() {
      testMatrix[0][7] = conf.action.draftsman_black;
      testMatrix[6][1] = conf.action.draftsman_black;

      //console.log(testMatrix);
      var possibleMoves = logic.possibleMoves(testMatrix, conf.action.comp);
      var out = logic.getMandatoryMoveByPossibleMoves(possibleMoves); //mozna byloby to lepiej napisac
      //console.log(out);

      assert.equal(out.length, 2);
    });
  });

  describe('becomeKing(matrixIn, player )', function() {
    it('becomeKing white', function() {
      testMatrixEmpty[0][5]  = conf.action.draftsman_white;
      //console.log(testMatrixEmpty);
      var out = logic.becomeKing(testMatrixEmpty);
      assert.equal(out[0][5], conf.action.king_white);
      //console.log(out);
    });

    it('becomeKing black', function() {
      testMatrixEmpty[7][6]  = conf.action.draftsman_black;
      //console.log(testMatrixEmpty);
      var out = logic.becomeKing(testMatrixEmpty);
      assert.equal(out[7][6], conf.action.king_black);
      //console.log(out);
    });

  });



  describe('getMatrixByPossibleMoves(matrix, player)', function() {
    it('getMatrixByPossibleMoves init matrix', function() {
      //var initMatrix = logic.initMatrix();

      var possibleMoves = logic.possibleMoves(initMatrix, conf.action.comp);
      var out = logic.getMatrixByPossibleMoves(initMatrix, conf.action.comp, possibleMoves);
      //console.log(out);

      assert.equal(out.length, 3*2+1);
    });

    it('getMatrixByPossibleMoves test matrix', function() {

        testMatrixEmpty[0][5]  = conf.action.draftsman_black;
        testMatrixEmpty[1][4]  = conf.action.draftsman_white;
        testMatrixEmpty[3][4]  = conf.action.draftsman_white;
        testMatrixEmpty[3][2]  = conf.action.draftsman_white;


        var possibleMoves = logic.possibleMoves(testMatrixEmpty, conf.action.comp);
        var out = logic.getMatrixByPossibleMoves(testMatrixEmpty, conf.action.comp, possibleMoves);
        assert.equal(out.length, 2);

        testMatrixEmpty[5][6]  = conf.action.draftsman_black;

        var possibleMoves2 = logic.possibleMoves(testMatrixEmpty, conf.action.comp);
        var out2 = logic.getMatrixByPossibleMoves(testMatrixEmpty, conf.action.comp, possibleMoves2);
        assert.equal(out2.length, 2);//wymagane bicie
    });

    it('getMatrixByPossibleMoves_black_become_king', function(){
      var y = 3;
      var x = 2;
      testMatrixEmpty[3][2] = conf.action.draftsman_black;
      testMatrixEmpty[4][3] = conf.action.draftsman_white;
      testMatrixEmpty[6][3] = conf.action.draftsman_white;
      testMatrixEmpty[4][1] = conf.action.draftsman_white;
      //console.log(testMatrixEmpty);
      var possibleMoves = logic.possibleMoves(testMatrixEmpty, conf.action.comp);
      var out = logic.getMatrixByPossibleMoves(testMatrixEmpty, conf.action.comp, possibleMoves);
      assert.equal(out[0].matrix[7][2], conf.action.king_black );
      //console.log(possibleMove[0]);

    });


  });


  describe('getBestMatix( matrix_in, player )', function() {
    it('getBestMatix init matrix', function() {
      //var initMatrix = logic.initMatrix();
      //getBestMatix( matrix_in, player )
      var out = logic.getBestMatix(initMatrix, conf.action.comp);
      //assert.equal(out[3][0], conf.action.comp); //rozne wartosci w zaleznosci od depth

      assert.ok(out.matrix);

      //var out2 = logic.getBestMatix(initMatrix, conf.action.human);
      //console.log(out2);

      //assert.equal(out2.matrix[4][1], conf.action.human); //w zaleznosci od poziomy w zrone mniejsce sie rusza

    });

    it('getBestMatix test matrix', function() {
        testMatrixEmpty[0][5]  = conf.action.draftsman_black;
        testMatrixEmpty[1][4]  = conf.action.draftsman_white;
        testMatrixEmpty[3][4]  = conf.action.draftsman_white;
        testMatrixEmpty[3][2]  = conf.action.draftsman_white;

        //console.log(testMatrixEmpty);
        var out = logic.getBestMatix(testMatrixEmpty, conf.action.comp);
        assert.equal(out.matrix[4][5], conf.action.comp);

        testMatrixEmpty[5][6]  = conf.action.draftsman_black;
        var out2 = logic.getBestMatix(testMatrixEmpty, conf.action.comp);
        assert.equal(out2.matrix[4][5], conf.action.comp);

        //console.log(out2);
    });

    it('getBestMatix game1', function() { //na 5-tym deep level pokazuje glupi ruch - dlatego podwyzszylem na 8 poziom
      testMatrixEmpty[0][7]  = conf.action.draftsman_black;
      testMatrixEmpty[1][0]  = conf.action.draftsman_black;
      testMatrixEmpty[1][2]  = conf.action.draftsman_black;
      testMatrixEmpty[1][4]  = conf.action.draftsman_black;
      testMatrixEmpty[1][6]  = conf.action.draftsman_black;
      testMatrixEmpty[2][7]  = conf.action.draftsman_black;
      testMatrixEmpty[3][0]  = conf.action.draftsman_black;


      testMatrixEmpty[3][2]  = conf.action.draftsman_white;
      testMatrixEmpty[4][7]  = conf.action.draftsman_white;
      testMatrixEmpty[5][2]  = conf.action.draftsman_white;
      testMatrixEmpty[5][4]  = conf.action.draftsman_white;
      testMatrixEmpty[6][7]  = conf.action.draftsman_white;
      testMatrixEmpty[7][0]  = conf.action.draftsman_white;
      testMatrixEmpty[7][2]  = conf.action.draftsman_white;
      testMatrixEmpty[7][4]  = conf.action.draftsman_white;

      //console.log(testMatrixEmpty);
      var out = logic.getBestMatix(testMatrixEmpty, conf.action.comp);
      //console.log('_________out_______');
      //console.log(out);
    });

    it('getBestMatix game2', function() { //na 5-tym deep level pokazuje glupi ruch - dlatego podwyzszylem na 8 poziom
      testMatrixEmpty[4][1]  = conf.action.draftsman_black;
      testMatrixEmpty[3][2]  = conf.action.draftsman_black;

      testMatrixEmpty[6][1]  = conf.action.draftsman_white;
      testMatrixEmpty[5][6]  = conf.action.draftsman_white;
      testMatrixEmpty[2][7]  = conf.action.draftsman_white;
      //console.log(testMatrixEmpty);
      var out = logic.getBestMatix(testMatrixEmpty, conf.action.comp);
      //console.log('_________out_______');
      //console.log(out);

    })


  });

  describe('play( matrix_in )', function() {
    it('play diffrent matrix', function() {
      //var initMatrix = logic.initMatrix();
      var play = logic.play(initMatrix);
      //console.log(play); return true;
      assert.equal(play.win, 0);
      assert.equal(play.draw, 0);
      //assert.equal(play.matrix[3][0], conf.action.comp ); //rozne wartosci w zaleznosci od depth

      testMatrixEmpty[1][0] = conf.action.draftsman_black;
      testMatrixEmpty[1][2] = conf.action.draftsman_black;
      var play2 = logic.play(testMatrixEmpty);

      assert.equal(play2.win, conf.action.comp);
      assert.equal(play2.draw, 0);
      assert.deepEqual(play2.matrix, testMatrixEmpty);

      testMatrixEmpty[1][0] = conf.action.draftsman_white;
      testMatrixEmpty[1][2] = conf.action.draftsman_white;
      var play3 = logic.play(testMatrixEmpty);
      assert.equal(play3.win, conf.action.human);
      assert.equal(play3.draw, 0);
      assert.deepEqual(play3.matrix, testMatrixEmpty);

      testMatrixEmpty[1][0] = conf.action.draftsman_black;
      testMatrixEmpty[1][2] = conf.action.draftsman_black;
      testMatrixEmpty[2][1] = conf.action.draftsman_white;
      var play4 = logic.play(testMatrixEmpty);
      assert.equal(play4.win, conf.action.comp);
      assert.equal(play4.draw, 0);
      assert.notDeepEqual(play4.matrix, testMatrixEmpty);

    });

    it('play draw matrix - white - human has no move', function() {
      testMatrixEmpty[1][0] = conf.action.draftsman_black;
      testMatrixEmpty[1][2] = conf.action.draftsman_black;
      testMatrixEmpty[2][1] = conf.action.draftsman_black;
      testMatrixEmpty[3][0] = conf.action.draftsman_white;

      testMatrixEmpty[2][7] = conf.action.draftsman_black;
      testMatrixEmpty[3][6] = conf.action.draftsman_white;

      //console.log(testMatrixEmpty);
      var play = logic.play(testMatrixEmpty);
      assert.equal(play.draw, conf.action.human);
      assert.equal(play.win,0);
      assert.notDeepEqual(play.matrix, testMatrixEmpty);

      matrixComp = logic.getBestMatix( testMatrixEmpty, conf.action.comp );
      assert.deepEqual(play.matrix, matrixComp.matrix);

    });

    it('play draw matrix - black - comp has no move', function() {
      testMatrixEmpty[1][0] = conf.action.draftsman_black;
      testMatrixEmpty[2][1] = conf.action.draftsman_white;
      testMatrixEmpty[3][0] = conf.action.draftsman_white;
      testMatrixEmpty[3][2] = conf.action.draftsman_white;


      //console.log(testMatrixEmpty);
      var play = logic.play(testMatrixEmpty);

      assert.equal(play.draw, conf.action.comp);
      assert.equal(play.win,0);
      assert.deepEqual(play.matrix, testMatrixEmpty);


      //console.log(play);
    });

  });


  describe.skip('evaluate( matrix, player )', function() {
    it('evaluate init matrix', function() {
      //var initMatrix = logic.initMatrix();

      var out = logic.evaluate( initMatrix, conf.action.comp );
      assert.ok( out.score < 0 );
      assert.equal(  out.win, 0 );

      var out2 = logic.evaluate( initMatrix, conf.action.human );
      assert.ok( out2.score > 0 );
      assert.equal(  out2.win, 0 );

      testMatrixEmpty[1][0] = conf.action.draftsman_black;
      testMatrixEmpty[1][2] = conf.action.draftsman_black;
      //console.log(testMatrixEmpty);
      var out3 = logic.evaluate( testMatrixEmpty, conf.action.human );
      //console.log(out3);
      assert.equal(  out3.score, 0 );
      assert.equal(  out3.win, conf.action.comp );

      var y = 1;
      testMatrixEmpty[y][0] = conf.action.draftsman_white;
      testMatrixEmpty[y][2] = conf.action.king_white;
      //console.log(testMatrixEmpty);
      var out4 = logic.evaluate( testMatrixEmpty, conf.action.human );
      assert.equal(  out4.score, (conf.action.draftsman_white + conf.action.king_white)*conf.action.coef_checker + logic.getYForHuman(y) );
      assert.equal(  out4.win, conf.action.human );
      //console.log(out4);


      testMatrixEmpty[y][0] = conf.action.draftsman_white;
      testMatrixEmpty[y][2] = conf.action.draftsman_white;
      //console.log(testMatrixEmpty);
      var out5 = logic.evaluate( testMatrixEmpty, conf.action.human );
      assert.equal(  out5.score, (conf.action.draftsman_white + conf.action.draftsman_white)*conf.action.coef_checker + 2*logic.getYForHuman(y) );
      //assert.equal(  out5.score, 2 );
      assert.equal(  out5.win, conf.action.human );


    });
    it('evaluate equal points', function() {
      testMatrixEmpty[1][0] = conf.action.draftsman_white;
      testMatrixEmpty[3][2] = conf.action.draftsman_white;

      testMatrixEmpty[6][1] = conf.action.draftsman_black;
      testMatrixEmpty[4][7] = conf.action.draftsman_black;

      var evalHuman = logic.evaluate( testMatrixEmpty, conf.action.human );
      var evalComp = logic.evaluate( testMatrixEmpty, conf.action.comp );

      // console.log(testMatrixEmpty);
      // console.log(evalHuman);
      // console.log(evalComp);

      assert.equal(  evalHuman.score, -1*evalComp.score );
      assert.equal(  evalHuman.win, 0 );
      assert.equal(  evalComp.win, 0 );

    });


    it('evaluate y coordinate', function() {
      testMatrixEmpty[1][0] = conf.action.draftsman_black;
      testMatrixEmpty[1][2] = conf.action.draftsman_black;

      testMatrixEmpty[6][1] = conf.action.draftsman_white;
      testMatrixEmpty[6][3] = conf.action.draftsman_white;

      var h1 = logic.evaluate( testMatrixEmpty, conf.action.human );
      var c1 = logic.evaluate( testMatrixEmpty, conf.action.comp );

      //console.log(testMatrixEmpty);

      assert.notEqual(  h1.score, 0 );
      assert.notEqual(  c1.score, 0 );
      assert.equal( Math.abs(h1.score), Math.abs(c1.score) );

      testMatrixEmpty[1][0] = conf.action.blank;
      testMatrixEmpty[2][1] = conf.action.draftsman_black;

      var h2 = logic.evaluate( testMatrixEmpty, conf.action.human );
      var c2 = logic.evaluate( testMatrixEmpty, conf.action.comp );

      assert.notEqual(  h2.score, 0 );
      assert.notEqual(  c2.score, 0 );
      assert.notEqual( Math.abs(h2.score), Math.abs(c2.score) );
      assert.ok( Math.abs(h2.score) < Math.abs(c2.score) );
      assert.equal( Math.abs(h2.score)+1 , Math.abs(c2.score) );
      //console.log(h2.score);
      //console.log(c2.score);
      testMatrixEmpty[6][1] = conf.action.blank;
      testMatrixEmpty[6][3] = conf.action.draftsman_white;
      testMatrixEmpty[4][1] = conf.action.draftsman_white;
      //console.log(testMatrixEmpty);

      var h3 = logic.evaluate( testMatrixEmpty, conf.action.human );
      var c3 = logic.evaluate( testMatrixEmpty, conf.action.comp );
      assert.notEqual(  h3.score, 0 );
      assert.notEqual(  c3.score, 0 );
      assert.notEqual( Math.abs(h3.score), Math.abs(c3.score) );
      assert.ok( Math.abs(h3.score) > Math.abs(c3.score) );
      assert.equal( Math.abs(h3.score), Math.abs(c3.score) + 1 );


      //console.log(testMatrixEmpty);



    });

    it('evaluate real matrix', function() {

      testMatrixEmpty[0][3] = conf.action.draftsman_black;
      testMatrixEmpty[0][5] = conf.action.draftsman_black;
      testMatrixEmpty[0][7] = conf.action.draftsman_black;
      testMatrixEmpty[1][0] = conf.action.draftsman_black;
      testMatrixEmpty[1][2] = conf.action.draftsman_black;
      testMatrixEmpty[1][4] = conf.action.draftsman_black;
      testMatrixEmpty[2][1] = conf.action.draftsman_black;
      testMatrixEmpty[2][3] = conf.action.draftsman_black;
      testMatrixEmpty[2][5] = conf.action.draftsman_black;
      testMatrixEmpty[3][2] = conf.action.draftsman_black;


      testMatrixEmpty[3][6] = conf.action.draftsman_white;
      testMatrixEmpty[4][7] = conf.action.draftsman_white;
      testMatrixEmpty[5][0] = conf.action.draftsman_white;
      testMatrixEmpty[5][2] = conf.action.draftsman_white;
      testMatrixEmpty[6][1] = conf.action.draftsman_white;
      testMatrixEmpty[6][3] = conf.action.draftsman_white;
      testMatrixEmpty[7][0] = conf.action.draftsman_white;
      testMatrixEmpty[7][2] = conf.action.draftsman_white;
      testMatrixEmpty[7][4] = conf.action.draftsman_white;
      testMatrixEmpty[7][6] = conf.action.draftsman_white;

      //console.log(testMatrixEmpty);
      var eval1 = logic.evaluate(testMatrixEmpty, conf.action.comp  );
      //console.log(eval1);

      testMatrixEmpty[0][5] = conf.action.blank;
      testMatrixEmpty[1][6] = conf.action.draftsman_black;
      //console.log(testMatrixEmpty);
      var eval2 = logic.evaluate(testMatrixEmpty, conf.action.comp  );
      //console.log(eval2);

      assert.notEqual(eval1.score, eval2.score);
      //console.log(eval1.score, eval2.score);

    });



  });


  describe('initMatrix()', function() {
    it('return init matrix', function() {
      //var initMatrix  =  gameLogicWorker.logic.initMatrix()
      //console.log(config.getConfig());
      //var player = conf.action.human;
      var out = logic.initMatrix();
      var sumBlack = 0;
      var sumWhite = 0;
      for (var y=0;y<conf.action.cols;y++) {
        for (var x=0;x<conf.action.rows;x++) {
          if( '' !== out[y][x]){
            //console.log(out[y][x]);
            if( out[y][x] ==  conf.action.draftsman_black ){
              sumBlack += out[y][x];
            }
            if( out[y][x] ==  conf.action.draftsman_white ){
              sumWhite += out[y][x];
            }

          }
        }
      }

      assert.notEqual( 0, sumBlack );
      assert.notEqual( 0, sumWhite );
      assert.equal(  -1*sumBlack,  sumWhite );

    });
  });

  describe('possibleMove(matrix, x, y)', function() {
    it('possible move', function(){
      //var initMatrix = logic.initMatrix();

      possibleMoveFalse = logic.possibleMove(initMatrix, 1, 0);
      assert.equal(possibleMoveFalse, false);
      assert.ok(!possibleMoveFalse);

      var outUndefined = logic.possibleMove(initMatrix, 20, 0);
      assert.ok(!outUndefined);
      assert.equal(outUndefined, false);
      var outEmpty = logic.possibleMove(initMatrix, 2, 0);
      assert.equal(outEmpty, false);
      assert.ok(!outEmpty);

      var outDraftsmanBlack4 = logic.possibleMove(initMatrix, 7, 2);

      assert.equal(outDraftsmanBlack4.length, 1);
      assert.ok( typeof outDraftsmanBlack4[0].x === 'number' );
      assert.ok( typeof outDraftsmanBlack4[1] === 'undefined' );
      initMatrix[3][6] = conf.action.king_white;

      var possibleMove = logic.possibleMove(initMatrix, 7, 2);

      assert.equal(possibleMove[0].beats.length, 1);
      assert.equal(possibleMove[0].x, 5);
      assert.equal(possibleMove[0].y, 4);

      assert.equal(possibleMove[0].beats[0].x, 5);
      assert.equal(possibleMove[0].beats[0].y, 4);

    });

    it('possible_move_test2', function(){

      var possibleMove = logic.possibleMove(testMatrix, testX, testY);
      assert.equal(possibleMove.length, 4);
      //console.log(possibleMove);
    });

    it('possible_move_round_test2', function(){ //todo
      var testX =3; testY = 2;
      testMatrix[2][3] = conf.action.draftsman_black;
      testMatrix[1][2] = conf.action.blank;
      testMatrix[1][4] = conf.action.blank;
      testMatrix[5][2] = conf.action.draftsman_white;
      //testMatrix[5][4] = conf.action.blank;
      //console.log(testMatrix);

      var possibleMove = logic.possibleMove(testMatrix, testX, testY);
    });

    it('possible_move_black_become_king', function(){ //przy towrzeniu matrixa jest tworzona damka
      var y = 3;
      var x = 2;
      testMatrixEmpty[3][2] = conf.action.draftsman_black;
      testMatrixEmpty[4][3] = conf.action.draftsman_white;
      testMatrixEmpty[6][3] = conf.action.draftsman_white;
      testMatrixEmpty[4][1] = conf.action.draftsman_white;

      //console.log(testMatrixEmpty);
      var possibleMove = logic.possibleMove(testMatrixEmpty, x, y);
      //console.log(possibleMove);
    });

    it('max move king', function(){
      var x = 0;
      var y = 7;

      testMatrixEmpty[y][x] = conf.action.king_white;

      var possibleMove = logic.possibleMove(testMatrixEmpty, x, y);

      var isFind = false;
      for(var i in possibleMove){
        if((possibleMove[i].x === 7) &&  (possibleMove[i].y === 0) ){
          isFind = true;
        }
      }
      assert.ok(isFind);


    });

    it('max move king second example', function(){
      var x = 7;
      var y = 6;

      testMatrixEmpty[y][x] = conf.action.king_white;

      //console.log(testMatrixEmpty);
      var possibleMove = logic.possibleMove(testMatrixEmpty, x, y);

      //console.log(possibleMove);

      var isFind = false;
      for(var i in possibleMove){
        if((possibleMove[i].x === 1) &&  (possibleMove[i].y === 0) ){
          isFind = true;
        }
      }
      assert.ok(isFind);
    });


  });

  describe('getEnemiesByValue(value)', function() {
    it('get enemies by value', function(){

      var enemies = logic.getEnemiesByValue(conf.action.draftsman_black);
      assert.equal( conf.action.draftsman_white, enemies[0] );
      assert.equal( conf.action.king_white, enemies[1] );

      var enemies2 = logic.getEnemiesByValue(conf.action.king_white);
      assert.equal( conf.action.draftsman_black, enemies2[0] );
      assert.equal( conf.action.king_black, enemies2[1] );

      var enemies3 = logic.getEnemiesByValue(conf.action.blank);
      assert.ok(!enemies3);
      //assert.equal( [], enemies3 );
      //console.log(enemies3);

    });
  });



  describe('possibleBeatsKing( matrixIn, x, y, value, enemies, was_x, was_y )', function() {
    it('possible king move - not back', function(){

      var x2 = 3;
      var y2 = 4;
      var value = conf.action.king_black

      var was_x = 5;
      var was_y = 6;


      testMatrixEmpty[2][5] = conf.action.draftsman_white;
      testMatrixEmpty[y2][x2] = value;
      testMatrixEmpty[was_y][was_x] = conf.action.draftsman_white;
      testMatrixEmpty[2][1] = conf.action.draftsman_white;

      //console.log(testMatrixEmpty);

      enemies = logic.getEnemiesByValue(value);

      var out = logic.possibleBeatsKing( testMatrixEmpty, x2, y2, value, enemies, was_x, was_y );
      //console.log(out);

      assert.equal(out.length, 3);

    });

    it('add point after beat', function(){
      var x2 = 3;
      var y2 = 4;
      var value = conf.action.king_black

      var was_x = 5;
      var was_y = 6;


      testMatrixEmpty[2][5] = conf.action.draftsman_white;
      testMatrixEmpty[y2][x2] = value;
      testMatrixEmpty[was_y][was_x] = conf.action.draftsman_white;
      testMatrixEmpty[3][2] = conf.action.draftsman_white;

      //console.log(testMatrixEmpty);

      enemies = logic.getEnemiesByValue(value);

      var out = logic.possibleBeatsKing( testMatrixEmpty, x2, y2, value, enemies, was_x, was_y );
      assert.equal(out.length, 4);

      //console.log(out);

    });

  });

  describe('bugs', function() {
    it('infinite loop - recursive problem - done!', function(){
      //testMatrix[testY][testX] = conf.action.king_black;

      var testXX = 7;
      var testYY = 4;

      testMatrixEmpty[testYY][testXX] = conf.action.king_white;

      testMatrixEmpty[2][7] = conf.action.draftsman_black;
      testMatrixEmpty[2][5] = conf.action.draftsman_black;
      testMatrixEmpty[2][3] = conf.action.draftsman_black;

      testMatrixEmpty[4][5] = conf.action.draftsman_black;
      testMatrixEmpty[5][2] = conf.action.draftsman_black;

      //console.log(testMatrixEmpty);
      var outKing = logic.possibleBeatsMove(testMatrixEmpty, testXX, testYY);
      assert.ok(outKing);

      var out = logic.getBestMatix(testMatrixEmpty, conf.action.comp); //TODO - tu bylo zapetlnie - zapetnienie - nieskonczone!

    });
  });


  describe('optimisation', function() {
    it('diagnose black move real1 example', function(){

      testMatrixEmpty[0][3] = conf.action.draftsman_black;
      testMatrixEmpty[0][5] = conf.action.draftsman_black;
      testMatrixEmpty[0][7] = conf.action.draftsman_black;
      testMatrixEmpty[1][0] = conf.action.draftsman_black;
      testMatrixEmpty[1][2] = conf.action.draftsman_black;
      testMatrixEmpty[1][4] = conf.action.draftsman_black;
      testMatrixEmpty[2][1] = conf.action.draftsman_black;
      testMatrixEmpty[2][3] = conf.action.draftsman_black;
      testMatrixEmpty[2][5] = conf.action.draftsman_black;
      testMatrixEmpty[3][2] = conf.action.draftsman_black;


      testMatrixEmpty[3][6] = conf.action.draftsman_white;
      testMatrixEmpty[4][7] = conf.action.draftsman_white;
      testMatrixEmpty[5][0] = conf.action.draftsman_white;
      testMatrixEmpty[5][2] = conf.action.draftsman_white;
      testMatrixEmpty[6][1] = conf.action.draftsman_white;
      testMatrixEmpty[6][3] = conf.action.draftsman_white;
      testMatrixEmpty[7][0] = conf.action.draftsman_white;
      testMatrixEmpty[7][2] = conf.action.draftsman_white;
      testMatrixEmpty[7][4] = conf.action.draftsman_white;
      testMatrixEmpty[7][6] = conf.action.draftsman_white;


      //console.log(testMatrixEmpty);
      var out = logic.getBestMatix(testMatrixEmpty, conf.action.comp);
      //console.log(out);

      var possibleMoves  =logic.possibleMoves(testMatrixEmpty, conf.action.comp);
      //console.log(possibleMoves);

      var matrixPossibleMoves  =logic.getMatrixByPossibleMoves(testMatrixEmpty, conf.action.comp, possibleMoves);
      //console.log(matrixPossibleMoves);

      for(var i in  matrixPossibleMoves){
        //console.log('========');
        //console.log(matrixPossibleMoves[i].matrix);
        var eval = logic.evaluate( matrixPossibleMoves[i].matrix, conf.action.comp );
        //console.log(eval);
      }

    });

    it('diagnose black move real2 example', function(){
      testMatrixEmpty[0][1] = conf.action.draftsman_black;
      testMatrixEmpty[0][3] = conf.action.draftsman_black;
      testMatrixEmpty[0][5] = conf.action.draftsman_black;
      testMatrixEmpty[1][2] = conf.action.draftsman_black;
      //testMatrixEmpty[1][4] = conf.action.draftsman_black;
      testMatrixEmpty[1][6] = conf.action.draftsman_black;
      testMatrixEmpty[2][3] = conf.action.draftsman_black;
      testMatrixEmpty[2][5] = conf.action.draftsman_black;
      testMatrixEmpty[3][0] = conf.action.draftsman_black;

      testMatrixEmpty[2][7] = conf.action.draftsman_white;
      testMatrixEmpty[4][5] = conf.action.draftsman_white;

      testMatrixEmpty[5][0] = conf.action.draftsman_white;
      testMatrixEmpty[5][6] = conf.action.draftsman_white;

      testMatrixEmpty[6][1] = conf.action.draftsman_white;
      testMatrixEmpty[6][7] = conf.action.draftsman_white;
      testMatrixEmpty[7][0] = conf.action.draftsman_white;
      testMatrixEmpty[7][2] = conf.action.draftsman_white;

      //console.log(testMatrixEmpty);


      var possibleMoves  =logic.possibleMoves(testMatrixEmpty, conf.action.comp);
      //console.log(possibleMoves);

      var matrixPossibleMoves  =logic.getMatrixByPossibleMoves(testMatrixEmpty, conf.action.comp, possibleMoves);
      //console.log(matrixPossibleMoves);

      for(var i in  matrixPossibleMoves){
        //console.log('========');
        //console.log(matrixPossibleMoves[i]);
        var eval = logic.evaluate( matrixPossibleMoves[i].matrix, conf.action.comp );
        //console.log(eval);
      }

      var out = logic.getBestMatix(testMatrixEmpty, conf.action.comp);
      //console.log('===best=====');
      //console.log(out);


    });





  });



  describe.skip('depreciate  possibleBeatsMoveArrWrap(matrix, x, y)', function() {
    it('possible beats arr_move_init', function(){
      //var initMatrix = logic.initMatrix();
      //var out = logic.possibleBeatsMove(initMatrix, 1, 2);
      var arrBeats = logic.possibleBeatsMoveArrWrap(testMatrixEmpty, 1, 2);
      assert.equal(arrBeats, false);
    });

    it('possible beats move arr_test1', function(){

      var x = 2;
      var y = 3;
      testMatrixEmpty[y][x] = conf.action.draftsman_black;
      testMatrixEmpty[2][1] = conf.action.draftsman_white;
      testMatrixEmpty[2][3] = conf.action.draftsman_white;
      testMatrixEmpty[4][3] = conf.action.draftsman_white;
      testMatrixEmpty[4][1] = conf.action.draftsman_white;

      //console.log(testMatrixEmpty);
      var arrBeats = logic.possibleBeatsMoveArrWrap(testMatrixEmpty, x, y);
      //console.log(arrBeats);

      var expected =
      [ { in_x: 2, in_y: 3, value: -1, beat_x: 1, beat_y: 2, x: 0, y: 1 },
        { in_x: 2, in_y: 3, value: -1, beat_x: 3, beat_y: 2, x: 4, y: 1 },
        { in_x: 2, in_y: 3, value: -1, beat_x: 3, beat_y: 4, x: 4, y: 5 },
        { in_x: 2, in_y: 3, value: -1, beat_x: 1, beat_y: 4, x: 0, y: 5 } ];

      assert.equal(arrBeats.arrBeats.length, 4);
      assert.equal(arrBeats.terminateIn.length, 4);

      assert.deepEqual(arrBeats.arrBeats, expected);
      assert.deepEqual(arrBeats.terminateIn, expected);
    });

    it('possible beats move arr_test2', function(){

      //console.log(testMatrix);
      var arrBeats = logic.possibleBeatsMoveArrWrap(testMatrix, testX, testY);
      //console.log(arrBeats);

      assert.equal(arrBeats.terminateIn.length, 4);
      assert.equal(arrBeats.arrBeats.length, 6);

    });

    it('possible_move_arr_round', function(){ //nie dokonca dobrze pokazuje wynik - ale pozniej sie wybierze i tak lepszy wynik
      var testX =3; testY = 2;
      testMatrix[2][3] = conf.action.draftsman_black;
      testMatrix[1][2] = conf.action.blank;
      testMatrix[1][4] = conf.action.blank;
      testMatrix[5][2] = conf.action.draftsman_white;
      //testMatrix[5][4] = conf.action.blank;
      //console.log(testMatrix);

      var arrBeats = logic.possibleBeatsMoveArrWrap(testMatrix, testX, testY);
      //console.log(arrBeats);
      assert.equal(arrBeats.arrBeats.length, 5); //jedna nadmiarowa - bo zatacvza kolo
    });



    it('arr_round_test2', function(){ //todo - przypadek mocno wymyslony - raczej malo prawdopodobny w grze
      testMatrix[5][2] = conf.action.draftsman_white; //to dodalem - tworzymy petle
      testMatrix[1][2] = conf.action.blank;
      //console.log(testMatrix);

      var arrBeats = logic.possibleBeatsMoveArrWrap(testMatrix, testX, testY);
      //console.log(arrBeats);

      assert.equal(arrBeats.arrBeats.length, 7); //jedna nadmiarowa - bo zatacvza kolo

    });

    it('possible beats king', function(){

      var x = 7;
      var y = 0;

      var x2 = 3;
      var y2 = 4;


      testMatrixEmpty[y][x] = conf.action.king_black;
      testMatrixEmpty[2][5] = conf.action.draftsman_white;
      testMatrixEmpty[y2][x2] = conf.action.king_black;
      testMatrixEmpty[4][5] = conf.action.king_white;
      testMatrixEmpty[6][5] = conf.action.draftsman_white;

      testMatrixEmpty[4][1] = conf.action.draftsman_white;
      testMatrixEmpty[2][1] = conf.action.draftsman_white;

      //testMatrixEmpty[2][3] = conf.action.draftsman_white;//zatacza kolo!!

      //console.log(testMatrixEmpty);
      var arrBeats = logic.possibleBeatsMoveArrWrap(testMatrixEmpty, x2, y2); //nie mozna bic do tylu damka
      //console.log(arrBeats);

      assert.equal(arrBeats.arrBeats.length, 3);
      assert.equal(arrBeats.terminateIn.length, 3);

      //assert.ok(arrBeats.arrBeats.length);
      //assert.ok(arrBeats.terminateIn.length);



      //console.log(testMatrixEmpty);


    });

    it('king beats ok', function(){
      var x = 7;
      var y = 0;

      var x2 = 3;
      var y2 = 4;


      testMatrixEmpty[y][x] = conf.action.king_black;
      testMatrixEmpty[2][5] = conf.action.draftsman_white;
      testMatrixEmpty[y2][x2] = conf.action.king_black;
      testMatrixEmpty[4][5] = conf.action.king_white;
      testMatrixEmpty[6][5] = conf.action.draftsman_white;

      testMatrixEmpty[4][1] = conf.action.draftsman_white;
      testMatrixEmpty[2][1] = conf.action.draftsman_white;

      //console.log(testMatrixEmpty);
      //to dziala ok - dobry przypadek testowy
      var arrBeats = logic.possibleBeatsMoveArrWrap(testMatrixEmpty, x, y);
      //console.log(arrBeats);

      //assert.equal(arrBeats.arrBeats.length,5); //bijemy wszystkie pionki przeciwnika - a jest ich 5
      //assert.equal(arrBeats.terminateIn.length,2);  //bijemy je za jednym razem - powinno byc 2 - terminate zle dziala dla damek - dlatego jest osobna na to logika


      var beats = logic.possibleBeatsMove(testMatrixEmpty, x, y);
      assert.equal(beats.length,2);

      //console.log(beats);

    });


    it('possible beats diagonal king', function(){
      var x = 7;
      var y = 0;
      testMatrixEmpty[y][x] = conf.action.king_black;
      testMatrixEmpty[6][1] = conf.action.draftsman_white;
      var arrBeats = logic.possibleBeatsMoveArrWrap(testMatrixEmpty, x, y);

      assert.equal(arrBeats.arrBeats.length, 1);

      testMatrixEmpty[3][4] = conf.action.draftsman_black;
      var arrBeats = logic.possibleBeatsMoveArrWrap(testMatrixEmpty, x, y);
      assert.ok(!arrBeats.arrBeats.length);

      testMatrixEmpty[3][4] = conf.action.king_white;

      //console.log(testMatrixEmpty);
      var arrBeats = logic.possibleBeatsMoveArrWrap(testMatrixEmpty, x, y);
      //console.log(arrBeats);

      assert.equal(arrBeats.arrBeats.length, 3);


    });

  });



  describe('possibleBeatsMove(matrix, x, y)', function() {



    it('possible beats possible_beats_move_init', function(){
      //var initMatrix = logic.initMatrix();

      //console.log( initMatrix );
      var out = logic.possibleBeatsMove(initMatrix, 1, 2);

      //console.log(initMatrix);
      //console.log(out);
      assert.equal(out, false);
    });

    it('possible beats wrap ex1', function(){
      var x = 7;
      var y = 2;

      testMatrixEmpty[y][x] = conf.action.king_white;
      testMatrixEmpty[4][5] = conf.action.king_black;
      testMatrixEmpty[5][2] = conf.action.draftsman_black;

      //console.log(testMatrixEmpty);
      //possibleBeatsMove
      var outKing = logic.possibleBeatsMove(testMatrixEmpty, x, y);
      //possibleBeatsMoveArrWrap
      //console.log(outKing);

      assert.equal(outKing.length, 2);
      var tmp = [];
      for(var i in outKing){
        if( (outKing[i].x === 0) &&  (outKing[i].y === 3) ){
          tmp.push(true);
        }
        if( (outKing[i].x === 1) &&  (outKing[i].y === 4) ){
          tmp.push(true);
        }
      }
      assert.equal(tmp.length, 2);
    });


    it('possible_beats_move_test1', function(){

      var x = 2;
      var y = 3;
      testMatrixEmpty[y][x] = conf.action.draftsman_black;
      testMatrixEmpty[2][1] = conf.action.draftsman_white;
      testMatrixEmpty[2][3] = conf.action.draftsman_white;
      testMatrixEmpty[4][3] = conf.action.draftsman_white;
      testMatrixEmpty[4][1] = conf.action.draftsman_white;
      //console.log(testMatrixEmpty);
      var out = logic.possibleBeatsMove(testMatrixEmpty, x, y);
      assert.equal(out.length, 4);
    });



    it('possible beats possible_beats_move_test2', function(){


      //console.log(testMatrix);
      //console.log(testX, testY);
      var out = logic.possibleBeatsMove(testMatrix, testX, testY);
      //console.log(out);
      //console.log('-------2----------');
      //console.log(out[2]);

      assert.equal(out[2].x, 3);
      assert.equal(out[2].y, 6);
      assert.equal(out[2].beats.length, 3);
      assert.equal(typeof out[2].beats[0].in_x, 'number');
      assert.equal(typeof out[2].beats[0].in_y, 'number');
      assert.equal(typeof out[2].beats[0].value, 'number');
      assert.equal(typeof out[2].beats[0].beat_x, 'number');
      assert.equal(typeof out[2].beats[0].beat_y, 'number');
      assert.equal(typeof out[2].beats[0].x, 'number');
      assert.equal(typeof out[2].beats[0].y, 'number');

      assert.equal(out.length, 4);

      //console.log(out[2]);


      for( var i in out){
        assert.ok(out[i].beats.length);
      }

    });

    it('possible_beats_move_arr_round', function(){ //nie dokonca dobrze pokazuje wynik - ale pozniej sie wybierze i tak lepszy wynik
      var testX =3; var testY = 2;
      testMatrix[2][3] = conf.action.draftsman_black;
      testMatrix[1][2] = conf.action.blank;
      testMatrix[1][4] = conf.action.blank;
      testMatrix[5][2] = conf.action.draftsman_white;
      //testMatrix[5][4] = conf.action.blank;
      //console.log(testMatrix);

      var out = logic.possibleBeatsMove(testMatrix, testX, testY);
      //console.log(out);

      assert.equal(out[0].x, 3);
      assert.equal(out[0].y, 2);
      assert.equal(out[0].beats.length, 4);
      //console.log(out[0].beats);
      assert.equal(out.length, 2);

      //assert.equal(arrBeats.length, 5); //jedna nadmiarowa - bo zatacvza kolo
    });

    it('possible beats possible_beats_move_round_test3', function(){ //todo - przypadek mocno wymyslony - raczej malo prawdopodobny w grze
      testMatrix[5][2] = conf.action.draftsman_white; //to dodalem - tworzymy petle - zakladam, ze taki przypadek nie wystapi w grze.
      testMatrix[1][2] = conf.action.blank; //jak sie doda pionek bialy to nie blije wszystkich piakow

      //console.log(testMatrix);

      var out = logic.possibleBeatsMove(testMatrix, testX, testY);
      //console.log('__________exit______');
      //console.log(out);

      assert.equal(out[1].beats.length, 5);
      for( var i in out){
        //console.log(out[i]);
        assert.ok(out[i].beats.length);
      }

    });

    it('possible beats move king', function(){//niestety bije inaczej niz dla piokow TODO (nie bije 3 pionkow na raz)
      var outDraftsman = logic.possibleBeatsMove(testMatrix, testX, testY);
      testMatrix[testY][testX] = conf.action.king_black;
      var outKing = logic.possibleBeatsMove(testMatrix, testX, testY);

      //to powinno byc sobie rowna
      assert.equal(outDraftsman[2].beats.length, 3);
      assert.equal(outKing[0].beats.length, 2);
      assert.equal(outDraftsman.length, 4); //tylko 4 dla piokow - inne dla damki bedzie - patrz: 'possible beats king give the next possiblity'

    });

    it('possible beats king give the next possiblity', function(){
      testMatrix[testY][testX] = conf.action.king_black;

      //console.log(testMatrix);
      var outKing = logic.possibleBeatsMove(testMatrix, testX, testY);
      //console.log('=koniecccc testy=');
      //console.log(outKing);
      assert.equal(outKing.length, 8);



      // console.log(outKing[0]);
      // console.log(outKing[1]);
      // console.log(outKing[2]);
      // console.log(outKing[3]);
      //
      //
      // assert.equal(outKing.length, 8);
      // assert.equal(outKing[5].x, 7);
      // assert.equal(outKing[5].y, 6);
      // assert.equal(outKing[5].beats[1].x, 7);
      // assert.equal(outKing[5].beats[1].y, 6);


      //console.log(outKing);
      //assert.ok(outKing.length >4);
    });
    it('possible beats king give the next another possiblity', function(){
      testMatrixEmpty[testY][testX] = conf.action.king_black;
      testMatrixEmpty[2][3] = conf.action.king_white;

      var outKing = logic.possibleBeatsMove(testMatrixEmpty, testX, testY);
      //console.log(testMatrixEmpty);
      //console.log(outKing[0]);
      //console.log(outKing[1]);
      //console.log(outKing[2]);
      // console.log('==');
      assert.equal(outKing.length,3);
      //assert.ok(outKing.length >4);
    });

    it('possible beats king two checkers ex1', function(){
      var x = 7;
      var y = 2;

      testMatrixEmpty[y][x] = conf.action.king_white;
      testMatrixEmpty[4][5] = conf.action.king_black;
      testMatrixEmpty[5][2] = conf.action.draftsman_black;

      //console.log(testMatrixEmpty);
      var outKing = logic.possibleBeatsMove(testMatrixEmpty, x, y);
      //console.log(outKing);
      //console.log(outKing[0]);
      //console.log(outKing[1]);


      assert.equal(outKing.length, 2);
      var tmp = [];
      for(var i in outKing){
        if( (outKing[i].x === 0) &&  (outKing[i].y === 3) ){
          tmp.push(true);
        }
        if( (outKing[i].x === 1) &&  (outKing[i].y === 4) ){
          tmp.push(true);
        }
      }
      assert.equal(tmp.length, 2);
    });


    it('possible beats king two checkers ex2', function(){
      var x = 7;
      var y = 2;

      testMatrixEmpty[y][x] = conf.action.king_white;
      testMatrixEmpty[4][5] = conf.action.king_black;
      testMatrixEmpty[4][1] = conf.action.draftsman_black;

      var outKing = logic.possibleBeatsMove(testMatrixEmpty, x, y);
      //console.log(outKing);

      assert.equal(outKing.length, 1);
      var tmp = [];
      for(var i in outKing){
        if( (outKing[i].x === 0) &&  (outKing[i].y === 3) ){
          tmp.push(true);
        }
      }
      assert.equal(tmp.length, 1);
    });

    it('possible beats king diagonal checkers ex3 (not perfect beats - only two checkers - possible 4)', function(){
      var x = 7;
      var y = 0;

      testMatrixEmpty[y][x] = conf.action.king_black;
      testMatrixEmpty[2][5] = conf.action.draftsman_white;

      testMatrixEmpty[4][5] = conf.action.draftsman_white;
      testMatrixEmpty[4][1] = conf.action.draftsman_white;
      testMatrixEmpty[2][1] = conf.action.draftsman_white;
      testMatrixEmpty[5][4] = conf.action.draftsman_white;

      //console.log(testMatrixEmpty);

      var outKing = logic.possibleBeatsMove(testMatrixEmpty, x, y);
      assert.equal(outKing.length, 6);

    });

    it('possible beats king diagonal checkers one beats ex3', function(){
      var x = 7;
      var y = 0;

      testMatrixEmpty[y][x] = conf.action.king_black;
      testMatrixEmpty[2][5] = conf.action.draftsman_white;

      //console.log(testMatrixEmpty);

      var outKing = logic.possibleBeatsMove(testMatrixEmpty, x, y);
      //console.log(outKing); //outKing - tu bedzie 5 bic!!!!

      assert.equal(outKing.length, 5);




      // console.log('----------0--------------');
      // console.log(outKing[0]);
      // console.log('----------1--------------');
      // console.log(outKing[1]);

    });






    it('extreme beats king one checkers', function(){
      var x = 0;
      var y = 7;

      testMatrixEmpty[y][x] = conf.action.king_white;
      testMatrixEmpty[6][1] = conf.action.draftsman_black;

      //console.log(testMatrixEmpty);
      var outKing = logic.possibleBeatsMove(testMatrixEmpty, x, y);
      //console.log(outKing);
      assert.equal(outKing.length, 6);

      var isFind = false;
      for(var i in  outKing ){
        if( (outKing[i].x === 7) &&  (outKing[i].y === 0) ){
          isFind = true;
        }
      }

      assert.ok(isFind);
    });


  });

  describe('possibleSimpleKingMove(matrix, x, y)', function() {
    it( 'simple king move without beat', function(){
      var x = 7;
      var y = 0;

      var x2 = 3;
      var y2 = 4;
      var value = conf.action.king_black;

      testMatrixEmpty[y][x] = conf.action.king_black;
      testMatrixEmpty[1][6] = conf.action.king_black;
      testMatrixEmpty[2][5] = conf.action.draftsman_white;
      testMatrixEmpty[y2][x2] = value;
      testMatrixEmpty[4][5] = conf.action.king_white;
      testMatrixEmpty[1][0] = conf.action.king_white;
      //testMatrixEmpty[6][5] = conf.action.draftsman_white;

      testMatrixEmpty[4][1] = conf.action.draftsman_white;
      testMatrixEmpty[2][1] = conf.action.draftsman_white;

      //console.log(testMatrixEmpty);

      var out = logic.possibleSimpleKingMove(testMatrixEmpty, x2, y2, value);
      //console.log(out);

      assert.equal(out.length, 8);


    });
  });


  describe('getValue(matrix, x, y)', function() {
    it('get value', function(){

      //var initMatrix = logic.initMatrix();
      var value =  logic.getValue(initMatrix, 1, 4);


      assert.ok(value === 0 );
      assert.strictEqual( value, conf.action.blank );
      assert.equal( value, false );

      var outUndefined = logic.getValue(initMatrix, -1, -2);
      assert.ok(outUndefined !== 0 );
      assert.notStrictEqual( outUndefined,  conf.action.blank );
      assert.ok(!outUndefined);
      //return false;

      var outUndefined = logic.getValue(initMatrix, 20, 0);
      assert.ok(!outUndefined);
      assert.notStrictEqual( outUndefined,  conf.action.blank );
      assert.ok(outUndefined !== 0 );

      var outEmpty = logic.getValue(initMatrix, 2, 0);
      assert.ok(!outEmpty);
      assert.ok(outEmpty !== 0);


      var value =  logic.getValue(initMatrix, 1, 0);
      assert.equal( conf.action.draftsman_black, value );

      var value =  logic.getValue(initMatrix, 1, 6);
      assert.equal( conf.action.draftsman_white, value );


    });
  });



  describe('possibleOneStepMove(matrix, x, y)', function() {
    it('possible one step move', function(){
      //var initMatrix = logic.initMatrix();
      var outUndefined = logic.possibleOneStepMove(initMatrix, 20, 0);
      assert.ok(!outUndefined);
      var outEmpty = logic.possibleOneStepMove(initMatrix, 2, 0);
      assert.ok(!outEmpty);

      var outDraftsmanBlack1 = logic.possibleOneStepMove(initMatrix, 1, 2);
      assert.ok( typeof outDraftsmanBlack1[0].x === 'number' );
      assert.ok( typeof outDraftsmanBlack1[1].x === 'number' );

      var outDraftsmanBlack2 = logic.possibleOneStepMove(initMatrix, 3, 2);
      assert.ok( typeof outDraftsmanBlack2[0].x === 'number' );
      assert.ok( typeof outDraftsmanBlack2[1].x === 'number' );

      var outDraftsmanBlack3 = logic.possibleOneStepMove(initMatrix, 5, 2);
      assert.ok( typeof outDraftsmanBlack3[0].x === 'number' );
      assert.ok( typeof outDraftsmanBlack3[1].x === 'number' );

      var outDraftsmanBlack4 = logic.possibleOneStepMove(initMatrix, 7, 2);
      assert.ok( typeof outDraftsmanBlack4[0].x === 'number' );
      assert.ok( typeof outDraftsmanBlack4[1] === 'undefined' );
      assert.equal(outDraftsmanBlack4.length, 1);


      var outDraftsmanWhite1 = logic.possibleOneStepMove(initMatrix, 0, 5);
      assert.ok( typeof outDraftsmanWhite1[0].x ===  'number'  );
      assert.ok( typeof outDraftsmanWhite1[1] ===  'undefined' );
      assert.equal(outDraftsmanWhite1.length, 1);

      var outDraftsmanWhite2 = logic.possibleOneStepMove(initMatrix, 2, 5);
      assert.ok( typeof outDraftsmanWhite2[0].x ===  'number'  );
      assert.ok( typeof outDraftsmanWhite2[1].x ===  'number' );

      var outDraftsmanWhite3 = logic.possibleOneStepMove(initMatrix, 4, 5);
      assert.ok( typeof outDraftsmanWhite3[0].x ===  'number'  );
      assert.ok( typeof outDraftsmanWhite3[1].x ===  'number' );

      var outDraftsmanWhite4 = logic.possibleOneStepMove(initMatrix, 6, 5);
      assert.ok( typeof outDraftsmanWhite4[0].x ===  'number'  );
      assert.ok( typeof outDraftsmanWhite4[1].x ===  'number' );

      var outDraftsmanBlackEmpty = logic.possibleOneStepMove(initMatrix, 2, 1);
      assert.ok(!outDraftsmanBlackEmpty);

    });
  });

});
