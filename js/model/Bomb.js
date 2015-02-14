
var Bomb = function(state, maxDistance, pos, player) {
    this.state      = state;
    this.scene      = state.scene;

    this.bomb = this.state.createModelFromBase(this.state.assets['bomb'], "bomb", 0);
    this.bomb.setEnabled(true);
    this.bomb.position = pos;
    this.player      = player;

    // True if the bomb has been exploded, false otherwise
    this.exploded           = false;

    // The squared max distance of this bomb
    this.maxDistance        = maxDistance;
    this.maxDistanceSquared = maxDistance*maxDistance;

    this.isBlinkColor1      = false;
    this.blinkTime          = 50;
    this.blinkColor1        = BABYLON.Color3.Red();
    this.blinkColor2        = BABYLON.Color3.Black();
    this.blinkMaterialName  = "shell";

    // The list of particle system for this bomb
    this.systems            = [];

    // The collision box for bonus
    this.collisionBox           = BABYLON.Mesh.CreateBox("collisionBoxBomb", 5, this.scene);
    // Keep a reference to its player to retrieve it when casting rays
    this.collisionBox.bomb      = this;
    this.collisionBox.isVisible = false;
    this.collisionBox.parent    = this.bomb;

    // When the player is not anymore on the bomb, active collision with collisionbox
    var _this = this;
    this.collisionBox.actionManager = new BABYLON.ActionManager(this.scene);
    var trigger = {trigger:BABYLON.ActionManager.OnIntersectionExitTrigger, parameter: this.player.collisionBox};
    var enableCollisionAction = new BABYLON.ExecuteCodeAction(
        trigger, function() {
            _this.collisionBox.checkCollisions = true;
        });
    this.collisionBox.actionManager.registerAction(enableCollisionAction);


    var _this = this;
    var timer = new Timer(1500, this.scene, function() {
        _this.explode();
    });
    timer.start();

    this.blink();
};

Bomb.prototype = {

    _throwRay : function(pos, dir) {
        var ray = new BABYLON.Ray(pos, dir);
        var _this = this;
        var res = this.scene.pickWithRay(ray, function(m) {

            // Don't select a bomb already exploded
            if (m.bomb && m.bomb.exploded) {
//                console.log("bomb not selected");
                return false;
            }
            // Don't select bonus
            else if (m.bonus) {
                return false;
            }
            else {
                return m.isPickable;
            }
        }, false);
        return res;
    },

    // Make the bomb explode
    explode : function() {
        // This bomb has exploded
        this.exploded = true;

        var pos = this.bomb.position.clone();

//        var b = BABYLON.Mesh.CreateBox("b", 1, this.scene);
//        b.position = pos.clone();
//        b.position.y += 5;

        // Throw rays in 4 directions
        var dirs = [
            new BABYLON.Vector3(1,0,0),
            new BABYLON.Vector3(-1,0,0),
            new BABYLON.Vector3(0,0,1),
            new BABYLON.Vector3(0,0,-1)
        ];

        // Array containing all objects to destroy
        var toDestroy = [];

        var _this = this;
        dirs.forEach(function(dir) {
            // Throw a ray for the current direction
            var ray = _this._throwRay(pos, dir);
            var miniExplosion = true;
            // If the ray hit and the hit distance is within the bomb range
            if (ray.hit && ray.distance <= _this.maxDistance) {

//                console.log(ray.pickedMesh);
                var pm = ray.pickedMesh;
                // CRATE ??
                if (pm.crate) {
                    // Make the crate blink
                    pm.crate.blink();
                    // Destroy this crate
                    if (toDestroy.indexOf(pm.crate) == -1) {
                        toDestroy.push(pm.crate);
                    }

                }

                // PLAYER ??
                else if (pm.player) {
                    // This player is dead
//                    console.log("PLAYER KILLED", pm.player);
                    pm.player.kill();
                }

                // BOMB ??
                else if (pm.bomb) {
                    // Make this bomb explode too if it has not already exploded
                    if (! pm.bomb.exploded) {
                        pm.bomb.explode();
                    }
                }

                if (!miniExplosion) {
                    _this.systems.push(_this.startExplosion(dir, _this.maxDistanceSquared));
                } else {
                    // Explode until the explosion hit an object
                    _this.systems.push(_this.startExplosion(dir, ray.distance*ray.distance));
                }

            } else {
                // If no hit, make an explosion of the bomb range
                _this.systems.push(_this.startExplosion(dir, _this.maxDistanceSquared));
            }
        });

        var t = new Timer(1000, this.scene, function() {
            // Remove the bomb
            clearInterval(_this.interval);
            _this.dispose();

            // Destroy all hit object after 1 second
            toDestroy.forEach(function(crate) {
                crate.destroy();
            });
        });
        t.start();
    },

    /**
     * Removes the bomb and all particle system associated
     */
    dispose : function() {
        this.systems.forEach(function(s) {
            s.dispose();
        });
        this.bomb.dispose();
        delete this;
    },

    startExplosion : function(d, distanceSquared) {
        var maxPart = 30;
        if (this.maxDistance > 14) {
            maxPart = (this.maxDistance-14)/10*30;
        }
        var ps = new BABYLON.ParticleSystem("particles", maxPart, this.scene);
        ps.particleTexture = new BABYLON.Texture("img/bomb.png", this.scene);

        // custom update
        ps.updateFunction = function(particles) {
            for (var index = 0; index < particles.length; index++) {
                var particle = particles[index];
                particle.age += this._scaledUpdateSpeed;

                // get distance to the emitter
                var ds = this.emitter.subtract(particle.position).lengthSquared();
                if (ds >= distanceSquared) {
                    particle.age = 999;
                }

                if (particle.age >= particle.lifeTime) {
                    particles.splice(index, 1);
                    this._stockParticles.push(particle);
                    index--;
                    continue;
                } else {
                    particle.colorStep.scaleToRef(this._scaledUpdateSpeed, this._scaledColorStep);
                    particle.color.addInPlace(this._scaledColorStep);

                    if (particle.color.a < 0)
                        particle.color.a = 0;

                    particle.angle += particle.angularSpeed * this._scaledUpdateSpeed;

                    particle.direction.scaleToRef(this._scaledUpdateSpeed, this._scaledDirection);
                    particle.position.addInPlace(this._scaledDirection);

                    this.gravity.scaleToRef(this._scaledUpdateSpeed, this._scaledGravity);
                    particle.direction.addInPlace(this._scaledGravity);
                }
            }
        };

        // Where the particles come from
        ps.emitter = this.bomb.position.clone();
        ps.minEmitBox = new BABYLON.Vector3(0,0,0);
        ps.maxEmitBox = new BABYLON.Vector3(0,0,0);

        // Colors
//        ps.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
//        ps.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
//        ps.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

        // Size
        ps.minSize = 5;
        ps.maxSize = 10;

        // Life time
        ps.minLifeTime = ps.maxLifeTime = 80;
        ps.emitRate = 10;//maxPart/2;
        ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        ps.gravity = new BABYLON.Vector3(0, 0, 0);

        ps.direction1 = new BABYLON.Vector3(1* d.x, 0, 1* d.z);
        ps.direction2 = new BABYLON.Vector3(1* d.x, 0, 1* d.z);

        ps.minAngularSpeed = 0;
        ps.maxAngularSpeed = Math.PI;

        // Speed
        ps.minEmitPower = 1;
        ps.maxEmitPower = 5;
        ps.updateSpeed = 0.45;

        // Start the particle system
        ps.start();
        return ps;
    },

    /**
     * Make the bomb blink (change color) every this.blinkTime seconds.
     * The bomb color blink is a member of the class.
     */
    blink : function() {
        var _this = this;
        this.interval = setInterval(function() {

            if (_this.isBlinkColor1) {
                _this.scene.getMaterialByName(_this.blinkMaterialName).diffuseColor = _this.blinkColor2;
            } else {
                _this.scene.getMaterialByName(_this.blinkMaterialName).diffuseColor = _this.blinkColor1;
            }
            _this.isBlinkColor1 = !_this.isBlinkColor1;
        }, this.blinkTime);
    }
}