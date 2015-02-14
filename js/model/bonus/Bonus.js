/**
 * A bonus is something that comes from a destroyed crate.
 * A bonus stay on the map during a time, and it dissapears afterwards
 * @param state
 * @param position
 * @param model
 * @constructor
 */
var Bonus = function(state, position, model) {

    this.state      = state;
    this.scene      = state.scene;

    this.model          = this.state.createModelFromBase(this.state.assets[model], model, 0);
    this.model.position = position;
    this.model.setEnabled(true);
    this.model.bonus    = this;

    var _this = this;
    this.scene.registerBeforeRender(function() {
        _this.model.rotation.y += 0.03;
    });

    // After 4 seconds, the bonus blinks
    var blink = new Timer(3000, this.scene, function() {
        setInterval(function() {
            if (_this.model.isEnabled()) {
                _this.model.setEnabled(false);
            } else {
                _this.model.setEnabled(true);
            }
        }, 150);
    });
    blink.start();

    // After 5 seconds, the bonus disapears
    var timer = new Timer(5000, this.scene, function() {
        _this.model.dispose();
        delete _this;
    });
    timer.start();

    // Add action when the player pass through this bonus
    this.model.actionManager = new BABYLON.ActionManager(this.scene);

    var _this = this;
    this.state.players.forEach(function(p) {
        var trigger = {trigger:BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: p.collisionBox};

        var addBonusAction = new BABYLON.ExecuteCodeAction(
            trigger, function(evt) {
                _this.addEffect(p);
            });
        _this.model.actionManager.registerAction(addBonusAction);

    })

};