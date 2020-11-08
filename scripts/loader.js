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


        var jewelProto = document.getElementById("square-size");
        var rect = jewelProto.getBoundingClientRect();
        ttt.settings.ticSize = rect.width;
        display.initialize( ttt );

    }, false);

}else{
    alert(  ttt.text['pl'].alternative +  " / " +    ttt.text['en'].alternative );
}
