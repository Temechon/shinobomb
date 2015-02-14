var MenuPlayer = function(id, devicetype, gamepad) {

    this.id                 = id;                               // The player id
    this.device             = devicetype;                       // The type of device used to play
    this.isReadyToPlay      = false;                            // Did the player chose a character ?
    this.characterChosen    = 0;                                // The choose character
    this.player_image       = $("#player_image_"+id);           // The HTML element of the character image
    this.gamepad            = gamepad || null;                  // The player gamepad is using it (BABYLON.Gamepad)
};

MenuPlayer.GAMEPAD      = "gamepad";
MenuPlayer.KEYBOARD1    = "keyboard1";
MenuPlayer.KEYBOARD2    = "keyboard2";
MenuPlayer.NB_IMG       = 4;

MenuPlayer.prototype = {

    /**
     * Function displaying the next character image for a player ID
     */
    nextImage : function() {
        var img_id = parseInt(this.player_image.attr('data-img'));
        img_id = (img_id+1)%MenuPlayer.NB_IMG;
        this.player_image.attr("src", "img/player"+img_id+".jpg").attr("data-img", img_id);
    },

    /**
     * Function displaying the previous charcter image for a player ID
     */
    previousImage : function() {
        var img_id = parseInt(this.player_image.attr('data-img'));
        img_id = img_id-1 < 0 ? MenuPlayer.NB_IMG-1 : img_id-1;
        this.player_image.attr("src", "img/player"+img_id+".jpg").attr("data-img", img_id);
    },

    ready : function() {
        this.isReadyToPlay = true;
        this.characterChosen = parseInt(this.player_image.attr('data-img'));
    }

};