/**
 * The state used for player to select their colors
 * @param game
 * @constructor
 */
var GameState = function(game) {
    State.call(this, game);

    this.assets         = [];

    // Contains all menu players (MenuPlayer)
    this.menuPlayers    = game.menuPlayers;

    // Contains all player (Player)
    this.players        = [];

    // Contains all bombs
    this.bombs          = [];
    // Contains all crates (destructibles box)
    this.crates         = [];

    // false if the camera should move to see the whole board, true otherwise
    this.isCameraSet = false;

    var _this = this;
    window.addEventListener("resize", function() {
        _this.engine.resize();
        _this.isCameraSet = false;
    });

};


GameState.prototype = Object.create(State.prototype);
GameState.prototype.constructor = GameState;

GameState.prototype = {


    _initScene : function() {

        var scene = new BABYLON.Scene(this.engine);

        // Camera attached to the canvas
        var camera= new BABYLON.FreeCamera("cam", new BABYLON.Vector3(-112, 189, -200), scene);
        camera.rotation = new BABYLON.Vector3(0.58, 0.39, 0);
//        camera.attachControl(this.engine.getRenderingCanvas());

        // Hemispheric light to light the scene
        var h = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0,1,0), scene);
        h.intensity = 0.9;

        // Background layer
        new BABYLON.Layer("background","assets/background/sky.jpg", scene, true);

        return scene;
    },

    /**
     * Run the current state
     */
    run : function() {

        this.scene = this._initScene();

        // The loader
        var _this = this;
        var loader =  new BABYLON.AssetsManager(this.scene);
        loader.loadingUIBackgroundColor = "#2c2b29";

        var meshTask = loader.addMeshTask("ninja1", "", "./assets/ninja1/", "ninja.babylon");
        meshTask.onSuccess = function(t) {
            var anims = [];
            anims['walk']   = {start:45,    end:85,     speed:4};
            anims['idle']   = {start:0,     end:39,     speed:1};
            _this._initMesh(t, anims);

            // dirty fix
            for (var i=0; i<t.loadedMeshes.length; i++ ){
                var mesh = t.loadedMeshes[i];
                mesh.rotationQuaternion = null;
                mesh.rotation.x = -Math.PI/2;
            }
        }

        var ninja2 = loader.addMeshTask("ninja2", "", "./assets/ninja2/", "ninja2.babylon");
        ninja2.onSuccess = function(t) {
            var anims = [];
            anims['walk']   = {start:0, end:30,    speed:2};
            anims['idle']   = {start:0, end:1,     speed:4};
            _this._initMesh(t, anims);
        }

        var ninja3 = loader.addMeshTask("ninja3", "", "./assets/ninja3/", "ninja3.babylon");
        ninja3.onSuccess = function(t) {
            var anims = [];
            anims['walk']   = {start:0, end:30,    speed:2};
            anims['idle']   = {start:0, end:1,     speed:4};;
            _this._initMesh(t, anims);
        }

        var ninja4 = loader.addMeshTask("ninja4", "", "./assets/ninja4/", "ninja4.babylon");
        ninja4.onSuccess = function(t) {
            var anims = [];
            anims['walk']   = {start:45,    end:85,     speed:4};
            anims['idle']   = {start:0,     end:39,     speed:1};

            // dirty fix
            for (var i=0; i<t.loadedMeshes.length; i++ ){
                var mesh = t.loadedMeshes[i];
                mesh.rotationQuaternion = null;
                mesh.rotation.x = -Math.PI/2;
            }

            _this._initMesh(t, anims);
        }

        var dojotask = loader.addMeshTask("dojo", "", "./assets/dojo_jb/", "dojo.babylon");
        dojotask.onSuccess = function(task) {

            for (var i=0; i<task.loadedMeshes.length; i++ ){
                var mesh = task.loadedMeshes[i];
                if (mesh.material) {
                    // Remove ambient texture created by 3DSmax exporter
                    mesh.material.ambientTexture = null;
                }
            }
        };

        var bombTask = loader.addMeshTask("bomb", "", "./assets/bomb/", "bomb.babylon");
        bombTask.onSuccess = function(t) {
            _this._initMesh(t);
        };

        var crateTask = loader.addMeshTask("crate", "", "./assets/crate/", "japanese_box.babylon");
        crateTask.onSuccess = function(t) {
            _this._initMesh(t);
        };

        var dynamiteTask = loader.addMeshTask("dynamite", "", "./assets/dynamite/", "dynamite.babylon");
        dynamiteTask.onSuccess = function(t) {
            _this._initMesh(t);
        };

        var speedTask = loader.addMeshTask("speed", "", "./assets/bonus/", "geta.babylon");
        speedTask.onSuccess = function(t) {
            _this._initMesh(t);
        };

        loader.onFinish = function (tasks) {

            // Init the game
            _this._initGame();

            // The state is ready to be played
            _this.isReady = true;

            _this.engine.runRenderLoop(function () {
                _this.scene.render();
            });
        };

        loader.load();
    },

    /**
     * Initialize a mesh once it has been loaded. Store it in the asset array and set it not visible.
     * @param task
     * @private
     */
    _initMesh : function(task, animations) {
        for (var i=0; i<task.loadedMeshes.length; i++ ){
            var mesh = task.loadedMeshes[i];
            mesh.isPickable = false;
            mesh.setEnabled(false);
            this.scene.stopAnimation(mesh);
        }
        this.assets[task.name] = {meshes:task.loadedMeshes, animations:animations};
    },

    /**
     * Create a player model from its base loaded model.
     * Only one mesh is returned, parent from the whole model.
     * @param meshes
     * @param id
     * @private
     */
    createModelFromBase : function(obj, name, id) {
        var parent = new BABYLON.Mesh(name+"-"+id, this.scene);
        parent.skeletons = [];

        var meshes = obj.meshes;
        for (var i=0; i<meshes.length; i++ ){
            var newmesh = meshes[i].createInstance(meshes[i].name+"-"+id);
            newmesh.isPickable = false;
            // Clone animations if any
            if (meshes[i].skeleton) {
                newmesh.skeleton = meshes[i].skeleton.clone();
                parent.skeletons.push(newmesh.skeleton);
            }
            newmesh.parent = parent;
        }
        parent.isPickable = false;
        parent.animations = obj.animations;
        return parent;
    },


    _initGame : function() {

        // The game is paused at start
        this.game.pause = true;

        // Create the board
        var board = new Board(this);

        // Check if the whole board is visible
        var _this  = this;
//        this.scene.registerBeforeRender(function() {
//            if (!_this.isCameraSet) {
//                if (! board.bot.isCompletelyInFrustum(_this.scene.activeCamera)) {
//                    _this.scene.activeCamera.position.y += 1;
//                    _this.scene.activeCamera.position.z -= 0.5;
//                } else {
//                    _this.isCameraSet = true;
//                }
//            }
//        })

        // Create players
        for (var p=0; p<this.menuPlayers.length; p++){
            var mp              = this.menuPlayers[p];
            // Get the charecter chosen
            var name            = Game.CHARACTERS[mp.characterChosen];

            // Create model
            var model           = this.createModelFromBase(this.assets[name], "player", p);
            var player          = new Player(this, p, board.startingPositions[p], model);

            if (mp.device == MenuPlayer.GAMEPAD) {
                player.setupGamepad(mp.gamepad);
            } else {
                player.setupKeyboard(Game.CONTROLS[mp.device])
            }
            this.players.push(player);
        }

        // Execute starting animation when the scene is ready
        this.scene.executeWhenReady(function() {

            var cam = _this.scene.activeCamera;
            BABYLON.Animation.CreateAndStartAnimation("camAnimPos", cam, "position", 60, 100,
                cam.position, new BABYLON.Vector3(0,135,-101), BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            var anima2 = BABYLON.Animation.CreateAndStartAnimation("camAnimRot", cam, "rotation", 60, 100,
                cam.rotation, new BABYLON.Vector3(0.927,0,0), BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

            // Display 'FIGHT' when the animation is over after 1second
            anima2.onAnimationEnd = function() {
                setTimeout(function() {

                    // Display 'GO'
                    $(".go").css("display", "flex");
                    $(".go img")
                        .jrumble({x: 13,y:13,speed: 2})
                        .trigger("startRumble")
                        .addClass("animateWinner").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
                            setTimeout(function() {
                                $(".go").css("display", "none");
                                _this.game.pause = false;
                            }, 750);
                    });
                }, 1000);
            };
        })
    },

    /**
     * Check if the game is finished (only one player is standing)
     * Returns true if only one player is standing.
     */
    checkIfFinished : function() {

        var alives = [];
        this.players.forEach(function(p) {
            if (p.isAlive) {
                alives.push(p);
            }
        });
        if (alives.length == 1) {
            // Pause the game
            this.game.pause = true;
            this.game.displayWinner(alives[0].id);
            return true;
        }
    }
};
