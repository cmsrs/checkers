config = (function() {

  function getConfig(){

    var config = {
        lang : 'en',
        path : '',
        text : {
            pl : {
                title : 'Warcaby',
                alternative : 'Aby zagrać w grę musisz posiadać nową wersję przeglądarki (rekomendowane przeglądarki: firefox lub chrome)',
                draw : 'Remis.',
                you_win : 'Gratuluje wygraleś!',
                cpu_win : 'Przegrałeś!',
                play_again : 'Zagraj jeszcze raz!',
                level : 'Poziom:',
                you : 'TY',
                cpu : 'CPU'
            },
            en : {
                title : 'Checkers',
                alternative : 'In order to play with this game, You have to install a new web browser (recommend: firefox or chrome)',
                draw : 'Draw.',
                you_win : 'Congratulations!',
                cpu_win : 'You lose!',
                play_again : 'Play again!',
                level : 'Level:',
                you : 'YOU',
                cpu : 'CPU'
            }
        },
        color :{
            theme_logo_blue: '#b1ccdd',
            theme_black: '#050505',
            theme_white: '#ffffff',
            theme_light_black: '#191919',
            theme_logo_red: '#ff5050',
            theme_light_blue: '#d9d9d9',
            theme_a_blue:'#174f82'
        },
        settings : {
            sizeLoader : 1,
            ticPadding : 10,
            ticWidth : 4,
            ticWidthX : 4,
            animateRatio : 0.8 //it is consider move balls
        },
        score :{
            you: 0,
            cpu: 0
        },
        action :{
            rows : 8,
            cols : 8,
            coef_checker : 10,
            max_depth : 4,
            inf :    1000000,
            near_inf: 999900,
            draftsman_white : 2,
            king_white : 12,
            draftsman_black : -2,
            king_black : -12,
            human : 1,
            blank : 0,
            comp  : -1,
            who_first : 1,
            init_number_draftsman : 12,
            mapLevelToDepth: {
              1 : 2,
              2 : 4,
              3 : 6,
              4 : 8
            }
        }
      }
      return config;
    }

    return {
        getConfig : getConfig
    }

})();
