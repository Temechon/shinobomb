var State = function(game) {
    // The game object
    this.game    = game;

    // The game engine
    this.engine  = game.engine;

    // Contains all loaded assets needed for this state
    this.assets  = [];

    // The state scene
    this.scene   = null;

    // True if the state is ready to be played or not.
    this.isReady = false;

};

State.prototype = {

    /**
     * The function used to create the scene for this state
     */
    run : function() {},

    /**
     * Creates the scene for this state : physics (if any), camera and lights
     * @returns {BABYLON.Scene}
     * @private
     */
    _initScene : function() {
        return null;
    },

    /**
     * Init the game by positionning the assets in the scene, enabe interactions...
     * @private
     */
    _initGame : function() {}

};