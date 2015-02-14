/**
 * Script for the menu where each player can choose its character.
 * The player should press ENTER on the keyboard or A on the gamepad to select a player.
 * ECHAP key on keyboard removes the keyboard player
 * B button removes the gamepad player
 */
var activate_choose_player = function() {

    $("#01_press_key").hide();
    $("#02_choose_player").show();

    buildPlayerSelect(4);

    // The number of player
    var gamepad_players     = 0; // Number of gamepad players
    var keyboard_players    = 0; // number of keyboard players
    var players             = []; // The tab containing all menuplayers
    var isReadyToPlay       = false; // True if the game can be launched. Is reset to false each time a new player enters the game

    // Returns true if all players are ready to play
    var allPlayersReady = function() {
        var res = true;
        players.forEach(function(p) {
            res &= p.isReadyToPlay;
        });

        return res;
    };

    // Run the game once players choose their characters
    var launchGame = function() {
        $(".playButton").css("display", "none");
        $(".ready").css("display", "flex");

        // make the img rumble
        $(".ready img").jrumble({
            x: 13,
            y:13,
            speed: 2
        }).trigger("startRumble");

        $(".ready img").addClass("animateWinner").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
            setTimeout(function() {

                $(".ready").css("display", "none");
                $("#00_press_key").hide();
                $("#01_home_menu").hide();
                $("#02_choose_player").hide();
                $("#renderCanvas").show();
                new Game("renderCanvas", players);
            }, 1000);
        });
    };

    var _run = function(e) {
        if (e.keyCode == 13 || e.keyCode == 32) {
            $(document).off("keydown", _run);
            launchGame();
        }
    }
    /**
     * Prepare play button
      */
     var preparePlay = function() {
        $(".playButton img")
            .addClass("selected")
            .attr("src", "img/menu/play.png");
        isReadyToPlay = true;

        // attach action on 'enter', 'space'
        $(document).keydown(_run);
        // Action on gamepad is attached since the beginning
     };
    var unpreparePlay = function() {
        $(".playButton img")
            .removeClass("selected")
            .attr("src", "img/menu/play_off.png");

        isReadyToPlay = false;
        $(document).off("keydown", _run);

    }

    /**
     * update the next character image
     * @param id
     */
    var nextImage = function(id) {
        var selector = "#player_item_"+id+" .next";
        $(selector)
            .addClass("bounce fast")
            .one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
                $(this).removeClass("bounce fast");
            })
        players[id].nextImage();
    };

    var previousImage = function(id) {
        var selector = "#player_item_"+id+" .previous";
        $(selector)
            .addClass("bounce fast")
            .one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
                $(this).removeClass("bounce fast");
            })
        players[id].previousImage();
    };

    // Function called when the player choose its character
    var chooseCharacter = function(id) {
        // add tick image
        $("#player_tick_"+id).show();
        $("#player_tick_"+id).css("animation", "hugeToSmall linear 0.15s" );
        $("#player_image_"+id).css("animation", "blink linear 0.15s" );
        players[id].ready();

        // If player number is greater than 2, launch the game
        if (players.length >= 2 && allPlayersReady()) {
           preparePlay();
//            launchGame();
        }
    };

    var unchooseCharacter = function(id) {
        // add tick with animation
        $("#player_tick_"+id).css("animation", "smallFadeOut linear 0.15s" );
        setTimeout(function() {
            $("#player_tick_"+id).hide();
        }, 140);
        players[id].isReadyToPlay = false;
        unpreparePlay();
    };


    /* KEYBOARD */
    var addFirstKeyboardPlayer = function() {
        var current_id = players.length;
        keyboard_players ++;
        players.push(new MenuPlayer(current_id, MenuPlayer.KEYBOARD1));
        $("#player_device_"+current_id).text("").append(
           $("<img>").attr("src", "img/menu/controls1.png").css("width", "290px")
        );
        attachKeyboardFPActions(current_id);
    };

    var addSecondKeyboardPlayer = function() {
        var current_id = players.length;
        keyboard_players ++;
        players.push(new MenuPlayer(current_id, MenuPlayer.KEYBOARD2));
        $("#player_device_"+current_id).text("").append(
            $("<img>").attr("src", "img/menu/controls2.png").css("width", "290px")
        );
        attachKeyboardSPActions(current_id);
    }

    $(document).keydown(function spaceEvt(evt) {
        if (keyboard_players < 2) {
            if (evt.keyCode == 32) { // space
                addFirstKeyboardPlayer();
                $(document).off("keydown", spaceEvt);
            }
        }
    });

    $(document).keydown(function enterEvt(evt) {
        if (keyboard_players < 2) {
            if (evt.keyCode == 13) { // enter
                addSecondKeyboardPlayer();
                $(document).off("keydown", enterEvt);
            }
        }
    });

    // Attach actions available on keyboard after the player press enter (or space)
    // This function is only for the first keyboard player
    var attachKeyboardFPActions = function(id)  {
        $(document).keydown(function(evt) {
            if (! players[id].isReadyToPlay) {
                switch (evt.keyCode) {
                    case 68: // D
                        nextImage(id);
                        break;
                    case 81 : //Q
                        previousImage(id);
                        break;
                    case 32 : // space
                        chooseCharacter(id);
                        break;
                }
            } else {
                if (evt.keyCode == 27) { // Echap
                    unchooseCharacter(id);
                }
            }
        })
    };
    // Only for second player
    var attachKeyboardSPActions = function(id)  {
        $(document).keydown(function(evt) {
            if (! players[id].isReadyToPlay) {
                switch (evt.keyCode) {
                    case 39: // right arrow
                        nextImage(id);
                        break;
                    case 37 : // left arrow
                        previousImage(id);
                        break;
                    case 13 : // ENTER
                        chooseCharacter(id);
                        break;
                }
            } else {
                if (evt.keyCode == 16) { // shift
                    unchooseCharacter(id);
                }
            }
        })
    };

    /* GAMEPAD */

    // Attach the starting action to this gamepad :
    // A to choose a character
    var attachStartAction = function(gp) {
        gp.onbuttondown(function(button) {
            if (button == 0 ) {
                isReadyToPlay = false;
                var current_id = players.length;
                players[current_id] = new MenuPlayer(current_id, MenuPlayer.GAMEPAD, gp);
                gamepad_players ++;
                // Set the device image
                $("#player_device_"+current_id).text("").append(
                    $("<img>").attr("src", "img/menu/controls_gamepad.png").css("width", "290px")
                );
                attachActions(current_id, gp);
            }
        });
    };

    // Attach actions to the given gamepad :
    // A to run the game if everyone is ready
    // B to unchoose character
    // right/left to switch character
    var attachActions = function(id, gp) {
        gp.onbuttondown(function(button) {
            if (button == 0 ) {
                if (isReadyToPlay) {
                    // if the game is ready to be played, run it
                    launchGame();
                } else {
                    chooseCharacter(id);
                }
            } else if (button == 1) {
                unchooseCharacter(id);
            }
            // next is for generic pads only
            else if (button == 15) {
                nextImage(id);
            } else if (button == 14) {
                previousImage(id);
            }
        });

        if (gp.ondpaddown) {
            // On DPAD action, change character image
            gp.ondpaddown(function(button) {
                // If the player is not ready, change image
                if (! players[id].isReadyToPlay) {
                    switch (button) {
                        case 3 : // RIGHT
                            nextImage(id);
                            break;
                        case 2 : // LEFT
                            previousImage(id);
                            break;
                    }
                }
            });
        } else {
            // For generic pads nothing to do here as everything is done in onbuttondown
        }
    };

    // Add a player when a gamepad is connected
    var onconnection = function(g) {
        if (players.length == 4) {
            // Nothing to do, no more than 4 players
        } else {
            attachStartAction(g);
        }
    };
    var ondisconnection = function(g) {

    };

    new BABYLON.Gamepads(onconnection, ondisconnection);

};


var buildPlayerSelect = function(nb) {

    for (var i=0; i<nb; i++) {

        var item                = $("<div>").addClass("item").attr("id", "player_item_"+i);
        var player_image        = $("<img>").addClass("player_image").attr("id", "player_image_"+i).attr("src", "img/player"+i+".jpg").attr("data-img", i);
        var player_controller   = $("<div>").addClass("player_controller");
        var img_previous        = $("<img>").addClass("animated previous")   .attr("src", "img/previous.png");
        var img_next            = $("<img>").addClass("animated next")       .attr("src", "img/next.png");
        var device              = $("<span>").addClass("indication").text("Press A / SPACE / ENTER").attr("id", "player_device_"+i).attr("width", "75px");
        var tick                = $("<img>").attr("src", "img/tick.png").addClass("player_ready").attr("id", "player_tick_"+i).attr("width", "120px");

        player_controller.append(img_previous).append(img_next);
        item.append(player_image).append(tick).append(player_controller);
        item.append(device);
        $("#wrapper").append(item);
    }

};