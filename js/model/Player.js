var Player = function(state, id, position, baseModel) {

    this.state          = state;
    this.scene          = state.scene;
    this.model          = baseModel;
    this.skeletons      = baseModel.skeletons;
    this.animations     = baseModel.animations;

    // The number of bomb the player can use
    this.nbBomb         = 150;
    // True is the player is alive, false otherwise
    this.isAlive        = true;

    // Movement directions : left, right, top, bot
    this.mvtDirection   = [0,0,0,0];

    // The player speed
    this.speed          = 0.55;

    // The start position
    this.startposition  = position;

    // The bomb explosion distance
    this.bombDistance   = 14;

    // The player ID
    this.id = id;

    // The collision box for bonus
    this.collisionBox           = BABYLON.Mesh.CreateBox("collisionBoxPlayer"+id, 8, this.scene);
    // Keep a reference to its player to retrieve it when casting rays
    this.collisionBox.player    = this;
    this.collisionBox.isVisible = false;
    this.collisionBox.parent    = this.model;

    var _this = this;
    this.scene.registerBeforeRender(function() {
        // If the game is not pause and the player is not dead, update
        if (!_this.state.game.pause && _this.isAlive){
            _this.update();
        }
    });

    // MODEL PARAMETERS
    this.model.position = this.startposition.clone();
    this.model.isVisible = true;
//    this.model.checkCollisions = true;
    this.model.ellipsoid = new BABYLON.Vector3(4,0.5,4);
    this.model.setEnabled(true);


    /* GUI */
    this.guiBomb = $("#player"+id+"_bomb_number");
    this.guiLife = $("#player"+id+"_life");

//    this.updateGUI();

};

Player.prototype = {
    update : function() {
        this.move();
    },

    /* MODEL ANIMATIONS */
    /**
     * Run the walk animation from the player model
     */
    makeModelWalk : function() {
        if (!this.animatable) {
            // get walk frames
            var walk = this.animations['walk'];
            for (var i=0; i<this.skeletons.length; i++) {
                this.animatable = this.scene.beginAnimation(this.skeletons[i], walk.start, walk.end, true, walk.speed*this.speed);
            }
//            this.animatable = this.scene.beginAnimation(this.skeleton, 0, 30, true, this.speed);
        }
    },
    /**
     * Run the idle animation from the player model
     */
    makeModelIdle : function() {
        // get idle frames
        var idle = this.animations['idle'];
        for (var i=0; i<this.skeletons.length; i++) {
            this.scene.beginAnimation(this.skeletons[i], idle.start, idle.end, true, idle.speed);
        }
        this.animatable = null;
    },

    /**
     * Move function according to the selected direction
     */
    move : function() {
        if (this.mvtDirection[0] != 0) {
            this.model.moveWithCollisions (new BABYLON.Vector3(-this.speed, 0,0));
        }
        if (this.mvtDirection[1] != 0) {
            this.model.moveWithCollisions (new BABYLON.Vector3(this.speed, 0,0));
        }
        if (this.mvtDirection[2] != 0) {
            this.model.moveWithCollisions (new BABYLON.Vector3(0, 0,this.speed));
        }
        if (this.mvtDirection[3] != 0) {
            this.model.moveWithCollisions (new BABYLON.Vector3(0, 0,-this.speed));
        }

    },

    /**
     * Get the selected direction according to the player control, if the game is not in pause
     * @param keycode
     */
    handleKeyDown : function(keycode) {

        if (!this.state.game.pause && this.isAlive) {
            switch (keycode) {
                case this.controls.left:
                    this.makeModelWalk();
                    this.model.rotation.y = Math.PI/2;
                    this.mvtDirection[0] = 1;
                    break;
                case this.controls.right:
                    this.makeModelWalk();
                    this.model.rotation.y = -Math.PI/2;
                    this.mvtDirection[1] = 1;
                    break;
                case this.controls.top:
                    this.makeModelWalk();
                    this.model.rotation.y = Math.PI;
                    this.mvtDirection[2] = 1;
                    break;
                case this.controls.bot:
                    this.makeModelWalk();
                    this.model.rotation.y = 0;
                    this.mvtDirection[3] = 1;
                    break;
                case this.controls.bomb:
                    // Create bomb !!
                    this.makeBomb();
                    break;
            }
        }
    },

    /**
     * Remove the selected direction according to the player control
     * @param keycode
     */
    handleKeyUp : function(keycode) {
        switch (keycode) {
            case this.controls.left:
                this.mvtDirection[0] = 0;
                break;
            case this.controls.right:
                this.mvtDirection[1] = 0;
                break;
            case this.controls.top:
                this.mvtDirection[2] = 0;
                break;
            case this.controls.bot:
                this.mvtDirection[3] = 0;
                break;
        }


        // If no walk directions, remove walk animations
        // TODO REFRACTOR
        var total = 0;
        $.each(this.mvtDirection,function() {
            total += this;
        });
        if (total==0) {
            if (this.animatable) {
                this.makeModelIdle();
            }
        }
    },

    /**
     * Create a bomb at the current position of the player
     */
    makeBomb : function() {
        if (this.nbBomb > 0) {
            var bomb = new Bomb(this.state, this.bombDistance, this.model.position.clone(), this);
            this.state.bombs.push(bomb);
            this.nbBomb --;
//            this.updateGUI();
        }
    },

    updateGUI : function() {
        this.guiBomb.text(this.nbBomb);
        this.guiLife.text(this.life);
    },

    /**
     * Kill this player !
     */
    kill : function() {
        this.isAlive = false;

        // Remove the model
        this.model.dispose();

        // Check if the game is finished
        this.state.checkIfFinished();
    },

    /**
     * Assign actions to the keyboard
     * @param controls The object containing the controls to use
     */
    setupKeyboard : function(controls) {
        this.controls = controls;

        /* KEYBOARD */
        var _this = this;
        window.addEventListener("keyup", function(evt) {
            _this.handleKeyUp(evt.keyCode);
        });

        window.addEventListener("keydown", function(evt) {
            _this.handleKeyDown(evt.keyCode);
        });
    },

    /**
     * Assign basic actions on the gamepad
     * @param gamepad The gamepad used by the player
     */
    setupGamepad : function(gamepad) {
        this.gamepad    = gamepad;

        if (this.gamepad instanceof BABYLON.GenericPad) {
            this.controls   = {
                top     : 12+4,
                bot     : 13+4,
                left    : 14+4,
                right   : 15+4,
                bomb    : 4
            };
        } else {
            this.controls   = {
                top     : 0,
                bot     : 1,
                left    : 2,
                right   : 3,
                bomb    : 4
            };
        }
        var _this       = this;

        this.gamepad.onbuttondown(function(button) {
            var b = button +4;
            _this.handleKeyDown(b);
        });
        this.gamepad.onbuttonup(function(button) {
            var b = button +4;
            _this.handleKeyUp(b);
        });

        if (this.gamepad.ondpaddown) {
            // XBOX 360 PADS only
            this.gamepad.ondpaddown(function(button) {
                _this.handleKeyDown(button);
            });
            this.gamepad.ondpadup(function(button) {
                _this.handleKeyUp(button);
            });
        }
    }
}