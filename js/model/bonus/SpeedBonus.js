var SpeedBonus = function(state, position) {
    Bonus.call(this, state, position, "speed");

};

SpeedBonus.prototype = Object.create(Bonus.prototype);
SpeedBonus.prototype.constructor = SpeedBonus;

SpeedBonus.prototype = {

    /**
     * Add the bonus effect to the given player
     * @param player
     */
    addEffect : function(player) {
        player.speed += 0.15;
        this.model.dispose();
        delete this;
    }
}