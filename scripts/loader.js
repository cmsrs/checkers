var ttt = config.getConfig();

window.requestAnimationFrame = (function() {
        return window.requestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.oRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function(callback, element) {
                return window.setTimeout(
                    function() {
                        callback(+new Date);
                    }, 1000 / 60
                );
            };
})();


if (Modernizr.canvas && Modernizr.webworkers ){

    window.addEventListener("load", function() {
        if(typeof  lang !==  'undefined' ){
            ttt.lang =  lang;
        }
        if(typeof pathToCheckers !==  'undefined' ){
            ttt.path = pathToCheckers;
        }

        if(typeof isPolishDraughts !==  'undefined' ){
            ttt.action.rows = 10;
            ttt.action.cols = 10;
	        ttt.action.init_number_draftsman = 20;
            ttt.text.pl.title = 'Warcaby polskie';
            ttt.text.en.title = 'Polish draughts';
            var jewelProto = document.getElementById("square-size-ten");
        }else if(  typeof isDraughtsMin !==  'undefined'  ){
            ttt.action.rows = 6;
            ttt.action.cols = 6;
	        ttt.action.init_number_draftsman = 6;
            ttt.text.pl.title = 'Mini warcaby';
            ttt.text.en.title = 'Min draughts';
            var jewelProto = document.getElementById("square-size-checkers");
        }else{
            var jewelProto = document.getElementById("square-size-checkers");
        }




        var rect = jewelProto.getBoundingClientRect();
        ttt.settings.ticSize = rect.width;
        display.initialize( ttt );

    }, false);

}else{
    alert(  ttt.text['pl'].alternative +  " / " +    ttt.text['en'].alternative );
}
