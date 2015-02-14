/**
 * Script for the home menu of the game.
 * Up/down          : switch menu
 * A button/Enter   : Choose menu
 */
var activate_home_menu = function() {

    $("#01_home_menu").show();

    var menus = [
        $("#newgame"), // new game
        $("#controls") // controls
    ];

    // The selected menu
    var current_menu = -1;

    // The function to call to preselect a menu
    var preselect_menu = function() {
        current_menu = (current_menu+1) % 2;
        // reset background color
        for (var i=0; i<menus.length; i++) {
            if (i == current_menu) {
                menus[i].addClass("selected");
            } else {
                menus[i].removeClass( "selected");
            }
        }
    };

    // Function called when the up key is pressed
    var choose_menu = function() {
        if (current_menu == 0) {
            // new game
            $("#01_home_menu").hide();
            // reset gamepad and keyboard
            m.reset();
            $(document).off("keydown");
            // run next screen
            activate_choose_player();
        } else {
            // controls
        }
    };

    // Preselect first menu
    preselect_menu();

    /* KEYBOARD */
    $(document).keydown(function(evt) {
        switch (evt.keyCode) {
            case 38 : // TOP arrow
            case 40 : // BOT arrow
                preselect_menu();
                break;
            case 13 : // enter
            case 32 : // space
                choose_menu();
                break;
        }
    });

    /* GAMEPAD */
    var m = new MenuGamepadHelper();
    m.onUp(preselect_menu);
    m.onDown(preselect_menu);
    m.onA(choose_menu);

};