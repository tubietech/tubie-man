//////////////////////////////////////////////////////////////////////////////////////
// Entry Point

window.addEventListener("load", function() {
    loadHighScores();
    initRenderer();
    atlas.create();
    initSwipe();
	initGamepad();
	var anchor = window.location.hash.substring(1);
	switchState(preNewGameState)
    executive.init();
});
