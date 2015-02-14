var ExplosionBonus = function(state, position) {
    Bonus.call(this, state, position, "dynamite");

};

ExplosionBonus.prototype = Object.create(Bonus.prototype);
ExplosionBonus.prototype.constructor = ExplosionBonus;

ExplosionBonus.prototype = {

    /**
     * Add the bonus effect to the given player
     * @param player
     */
    addEffect : function(player) {
        player.bombDistance += 10;
        console.log("Now player bomb distance is "+player.bombDistance);
        this.model.dispose();
        delete this;
    }
}