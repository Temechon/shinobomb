var Crate = function(state, size, position) {

    this.gamestate          = state;
    this.scene              = state.scene;
    this.size               = size;
    this.position           = position;

    this.model              = this.gamestate.createModelFromBase(this.gamestate.assets['crate'], "crate", 0);
    this.model.setEnabled(true);
    this.model.position     = position;

    this.model.rotationQuaternion = null;

    this.collisionBox = BABYLON.Mesh.CreateBox("collisionBoxCrate", size, this.scene);
    this.collisionBox.crate = this;
    this.collisionBox.checkCollisions = true;
    this.collisionBox.parent = this.model;
    this.collisionBox.isVisible = false;

//    this.checkCollisions    = true;
//    this.material           = material;

    this.isBlinkColor1      = false;
    this.blinkTime          = 50;
    this.blinkColor1        = BABYLON.Color3.Red();
    this.blinkColor2        = BABYLON.Color3.Black();
    this.blinkMaterialName  = "blinkMat";

    /* If true, this crate has already exploded and cannot give bonus */
    this.exploded           = false;
};


Crate.prototype.blink = function() {
    var _this = this;
    this.interval = setInterval(function() {

        if (_this.collisionBox.isVisible) {
            _this.collisionBox.isVisible = false;
        } else {
            _this.collisionBox.isVisible = true;
        }
    }, this.blinkTime);
};

/**
 * Random int between min and (max-1)
 * @param min
 * @param max
 */
Crate.randomInt = function(min, max) {
    if (min === max) {
        return (min);
    }
    var random = Math.random();
    return Math.floor(((random * (max - min)) + min));
};

/**
 * Destroy this crate. Sometimes, a bonus appears at the crate position
 */
Crate.prototype.destroy = function() {
    clearInterval(this.interval);
    // Create a bonus with 1/3 chance
    var r = Crate.randomInt(0,5);
    switch (r) {
        case 0:
            new ExplosionBonus(this.gamestate, this.position.clone());
            break;
        case 1 :
            new SpeedBonus(this.gamestate, this.position.clone());
            break;
    }

    this.model.dispose();
    delete this;
};