// The menu gamepad is only available for the first connected gamepad.
var MenuGamepadHelper = function() {

    var _this = this;
    new BABYLON.Gamepads(
        function(g) {
            _this._connection(g)
        },
        function(g) {
            _this._disconnection(g);
        }
    );

    this.reset();
};

MenuGamepadHelper.prototype = {

    _connection : function(gamepad) {
        // set trigger on this gamepad
        var _this = this;
        gamepad.onbuttondown(function(b) {
            _this._onbuttondown(b);
        });
        // Only for XBOX360 PADS
        if (gamepad.ondpaddown) {
            gamepad.ondpaddown(function(b) {
                _this._ondpaddown(b);
            });
        }
    },

    _disconnection : function(gamepad) {
       // TODO
    },

    _callIfExists : function(func) {
        if (func) {
            func();
        }
    },

    _ondpaddown : function(button) {
        switch (button) {
            case 0 : // UP
                this._callIfExists(this.onUpCallback)
                break;
            case 1: // DOWN
                this._callIfExists(this.onDownCallback)
                break;
        }
    },

    _onbuttondown : function(button) {
        switch (button) {
            case 0 : // A
                this._callIfExists(this.onACallback)
                break;
            case 1 :// B
                this._callIfExists(this.onBCallback)
                break;
            case 12: // TOP for generic pad
                this._callIfExists(this.onUpCallback)
                break;
            case 13 : // BOT for generic pad
                this._callIfExists(this.onDownCallback)
                break;
        }

        // Call callback on any key
        this._callIfExists(this.onAnyCallback);
    },

    /**
     * Adds a callback when the A key is pressed
     * @param func
     */
    onA : function(func) {
        this.onACallback = func;
    },

    /**
     * Adds a callback when the B key is pressed
     * @param func
     */
    onB : function(func) {
        this.onBCallback = func;
    },

    /**
     * Adds a callback when the Up key of the D-pad is pressed
     * @param func
     */
    onUp : function(func) {
        this.onUpCallback = func;
    },

    /**
     * Adds a callback when the Down key of the D-pad is pressed
     * @param func
     */
    onDown : function(func) {
        this.onDownCallback = func;
    },

    /**
     * Adds a callback when any key is pressed
     * @param func
     */
    onAny : function(func) {
        this.onAnyCallback = func;
    },

    /**
     * Reset all callbacks
     */
    reset : function() {
        this.onACallback        = null;
        this.onBCallback        = null;
        this.onUpCallback       = null;
        this.onDownCallback     = null;
        this.onAnyCallback      = null;
    }
};