/**
 * Script for the first menu of the game : the user must press a key to select
 * a new game.
 * The key press can be keyboard or gamepad
 */
$(document).ready(function() {

    /* INIT THE PAGE */
    // Hide render canvas
    $("#renderCanvas").hide();
    // Hide player select menu
    $("#02_choose_player").hide();



    // Make the title rumble after the incoming animation
    $("#01_press_key").jrumble({
        x: 13,
        y:13,
        speed: 0
    }).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {

        $("#01_press_key").trigger("startRumble");
        $("#press_key").trigger("startRumble");
        setTimeout(function() {
            $("#01_press_key").trigger("stopRumble");
            $("#press_key").trigger("stopRumble");
        }, 230);

    });
    // Function called when a key is pressed
    var press_key_function = function() {
        $("#00_press_key").hide();
        m.reset();
        $(document).off("keydown");
        activate_choose_player();
    };

    /* KEYBOARD */
    $(document).keydown(press_key_function);

    /* GAMEPAD */
    var m = new MenuGamepadHelper();
    m.onAny(press_key_function);

});
