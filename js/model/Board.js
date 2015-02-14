/**
 * The default map
 * @param state The game state
 * @constructor
 */
var Board = function(state) {
    this.state      = state;
    this.scene      = state.scene;

    this.boxSize    = 10;
    this.nbBoxWidth = 19;
    this.nbBoxHeight = 11;

    this.width      = this.nbBoxWidth * this.boxSize;
    this.height     = this.nbBoxHeight * this.boxSize;

//    var board0 = BABYLON.Mesh.CreateGround("ground", 400, 400, 1, this.scene);
//    board0.position.y = -0.5;
//    board0.position.z = 100;
//    var mat = new BABYLON.StandardMaterial("mat", this.scene);
//    mat.diffuseTexture = new BABYLON.Texture("img/background.jpg", this.scene);
//    board0.material = mat;
//
//    var board = BABYLON.Mesh.CreateGround("ground", this.width,this.height, 1, this.scene);
//    var mat = new BABYLON.StandardMaterial("mat", this.scene);
//    mat.diffuseTexture = new BABYLON.Texture("img/sand1.jpg", this.scene);
//    mat.diffuseTexture.uScale = 10;
//    mat.diffuseTexture.vScale = 10;
//    mat.specularColor = BABYLON.Color3.Black();
//    board.material = mat;


    var mat2 = new BABYLON.StandardMaterial("box", this.scene);
    mat2.diffuseTexture = new BABYLON.Texture("img/box.jpg", this.scene);
    mat2.specularColor = BABYLON.Color3.Black();
    mat2.diffuseTexture.uScale = 20;

    var top = BABYLON.Mesh.CreateBox("top", 1, this.scene);
    top.scaling = new BABYLON.Vector3(this.width,this.boxSize,1);
    top.position.y = 4;
    top.position.z = this.height/2 + 0.5;
    top.material = mat2;
    top.checkCollisions = true;

    var bot = top.clone("bot");
    bot.id = "bot";
    bot.position.z = -this.height/2 - 0.5;
    bot.checkCollisions = true;
    this.bot = bot;

    var side = BABYLON.Mesh.CreateBox("right", 1, this.scene);
    side.scaling = new BABYLON.Vector3(1,10,this.height);
    side.position.y = 4;
    side.position.x = this.width/2 + 0.5;
    side.material = mat2;
    side.checkCollisions = true;

    var side2 = side.clone("left");
    side2.id = "left";
    side2.position.x = -this.width/2 - 0.5;


    // Starting position of players
    var bot     = 0,
        top     = this.nbBoxHeight -1,
        right   = this.nbBoxWidth -1,
        left    = 0;

    var l = -this.width/2+this.boxSize /2 ;
    var b = -this.height/2+this.boxSize /2 ;

    this.startingPositions = [
        new BABYLON.Vector3(left * this.boxSize+l,    2,       bot * this.boxSize+b),
        new BABYLON.Vector3(right * this.boxSize+l,   2,       bot * this.boxSize+b),
        new BABYLON.Vector3(left * this.boxSize+l,    2,       top * this.boxSize+b),
        new BABYLON.Vector3(right * this.boxSize+l,   2,       top * this.boxSize+b)
    ];

    // Position
    this.nothingPositions = [
        new BABYLON.Vector2(left, bot),
        new BABYLON.Vector2(left, bot+1),
        new BABYLON.Vector2(left+1, bot),

        new BABYLON.Vector2(right,bot),
        new BABYLON.Vector2(right,bot+1),
        new BABYLON.Vector2(right-1,bot),

        new BABYLON.Vector2(left,top),
        new BABYLON.Vector2(left,top-1),
        new BABYLON.Vector2(left+1,top),

        new BABYLON.Vector2(right, top),
        new BABYLON.Vector2(right, top-1),
        new BABYLON.Vector2(right-1, top)
    ];

    this.setBoxes();
};

Board.prototype = {
    setBoxes : function() {
        var bs          = this.boxSize;
        var hbs         = bs / 2;   // half box size

        var randomNumber = function (min, max) {
            if (min === max) {
                return (min);
            }
            var random = Math.random();
            return ((random * (max - min)) + min);
        };

        /* The blink mat */
        var blink = new BABYLON.StandardMaterial("blinkMat", this.scene);
//        blink.diffuseTexture = new BABYLON.Texture("assets/crate/japanese_box.jpg", this.scene);
        blink.specularColor = BABYLON.Color3.Black();

        var boxMat = new BABYLON.StandardMaterial("boxMat", this.scene);
        boxMat.diffuseTexture = new BABYLON.Texture("assets/box/japanese_stone01.jpg", this.scene);
        boxMat.bumpTexture = new BABYLON.Texture("assets/box/japanese_stone01_NORM.jpg", this.scene);
//        box   Mat.specularTexture = new BABYLON.Texture("assets/box/japanese_stone01_SPEC.jpg", this.scene);

        boxMat.specularColor = BABYLON.Color3.Black();


        var bb = BABYLON.Mesh.CreateBox("indestructible", bs, this.scene);
        bb.material = boxMat;
        bb.position = new BABYLON.Vector3(-200, -200,-200);
        bb.setEnabled(false);

        var _this = this;

        for (var j=0; j<this.width; j+=bs) {
            for (var i=0; i<this.height; i+=bs) {

                // Set up a crate or a box if the current position is not a starting position
                var isNothingPosition = $.grep(_this.nothingPositions, function(p) {
                    var current = new BABYLON.Vector2(j / _this.boxSize, i / _this.boxSize);
                    return current.equals(p);
                });
                if (isNothingPosition.length != 0) {
                    // Nothing to do
                } else {
//                    if (j-this.width/2+hbs == 0 && i-this.height/2+hbs == 0) {
//                        var b = bb.createInstance("indestructible");
//                        b.position = new BABYLON.Vector3(
//                            j-this.width/2+hbs,
//                            hbs-1,
//                            i-this.height/2+hbs);
//                        b.checkCollisions = true;
//
//                    } else {
                        if ((i/bs) % 2 == 0 && (j/bs) %2 == 0){
                            // INDESTRUCTIBLE
                            var b = bb.createInstance("indestructible");

                            b.position = new BABYLON.Vector3(
                                j-this.width/2+hbs,
                                hbs-1,
                                i-this.height/2+hbs);
                            b.checkCollisions = true;
    //                        b.material = boxMat;
                        } else if (Math.floor(randomNumber(0,2))%2 == 0) {
                            // DESTRUCTIBLE
                            var p = new BABYLON.Vector3(
                                j-this.width/2+hbs,
                                hbs-1,
                                i-this.height/2+hbs);

                            var b = new Crate(this.state,  bs, p);
                            _this.state.crates.push(b);
                        }
//                    }
                }
            }
        }
    }
}

