var VERSION = 1.0,
    AUTHOR = "temechon@pixelcodr.com";

Game = function(canvasId, menuplayers) {

    var canvas          = document.getElementById(canvasId);
    this.engine         = new BABYLON.Engine(canvas, true);

    this.currentStateId = -1;
    this.currentState   = null;
    this.menuPlayers    = menuplayers;
    // False if the players can move, false otherwise.
    this.pause          = false;

    // True if the game started
    this.started        = true;

    this.runNextState();
};

/**
 * The games states.
 */
Game.STATES = [
    { // The game state
        title:"Game",
        create:function(game) {
            return new GameState(game);
        }
    }
];

Game.CHARACTERS = [
    "ninja2",
    "ninja1",
    "ninja3",
    "ninja4"
];

/* Game controls for keyboard players */
Game.CONTROLS = [];
Game.CONTROLS[MenuPlayer.KEYBOARD1] = {
    left:81, // Q
    right:68, // D
    top:90, // Z
    bot:83, // S
    bomb:32 // space
};
Game.CONTROLS[MenuPlayer.KEYBOARD2] = {
    left:37, // left arrow
    right:39, // right arrow
    top:38, // top arrow
    bot:40, // bot arrow
    bomb:13 // enter
};



Game.prototype = {

    runNextState : function() {
        // Get next state
        this.currentStateId++;

        // The starting state of the game
        this.currentState = Game.STATES[this.currentStateId].create(this);

        // Create the starting scene
        this.currentState.run();

    },

    /**
     * Display the winner
     * @param id
     */
    displayWinner : function(id) {
        var src = "img/";
        switch (id) {
            case 0:
                src += "p1_win.png";
                break;
            case 1:
                src += "p2_win.png";
                break;
            case 2:
                src += "p3_win.png";
                break;
            case 3:
                src += "p4_win.png";
                break;
        }

        // Update the image
        $(".winner img").attr("src", src);

        $(".winner").css("display", "flex");
        $(".winner img").addClass("animateWinner");
    }
};


/**
 * Draw axis on the scene
 * @param scene The scene where the axis will be displayed
 * @param size The size of each axis.
 */
var axis = function(scene, size) {
        //X axis
        var x = BABYLON.Mesh.CreateCylinder("x", size, 0.1, 0.1, 6, scene, false);
        x.material = new BABYLON.StandardMaterial("xColor", scene);
        x.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        x.position = new BABYLON.Vector3(size/2, 0, 0);
        x.rotation.z = Math.PI / 2;

        //Y axis
        var y = BABYLON.Mesh.CreateCylinder("y", size, 0.1, 0.1, 6, scene, false);
        y.material = new BABYLON.StandardMaterial("yColor", scene);
        y.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
        y.position = new BABYLON.Vector3(0, size / 2, 0);

        //Z axis
        var z = BABYLON.Mesh.CreateCylinder("z", size, 0.1, 0.1, 6, scene, false);
        z.material = new BABYLON.StandardMaterial("zColor", scene);
        z.material.diffuseColor = new BABYLON.Color3(0, 0, 1);
        z.position = new BABYLON.Vector3(0, 0, size/2);
        z.rotation.x = Math.PI / 2;
};