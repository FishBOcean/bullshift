var g_game: BullShift.Game;

// Main entry point into the application.
window.onload = function () {
    BullShift.MessageBus.initialize();
    BullShift.ComponentManager.initialize();

    let game = new BullShift.Game();

    //temp
    g_game = game;

    game.start();
}