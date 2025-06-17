/* Sound handlers added by Dr James Freeman who was sad such a great reverse was a silent movie  */

var audio = new preloadAudio();

// Ammount to increase/decrease volume with buttons
const VOLUME_STEP_SIZE = 10;

let globalVolume = 100;

function audioTrack(url, volume) {
    var audio = new Audio(url);
    this.baseVolume = volume !== undefined ? volume : 100;

    if (volume)
        audio.volume = volume * (globalVolume / 100);

    audio.load();
    var looping = false;
    this.play = function(noResetTime) {
        playSound(noResetTime);
    };
    this.startLoop = function(noResetTime) {
        if (looping) return;
        audio.addEventListener('ended', audioLoop);
        audioLoop(noResetTime);
        looping = true;
    };
    this.stopLoop = function(noResetTime) {
        try{ audio.removeEventListener('ended', audioLoop) } catch (e) {};
        audio.pause();
        if (!noResetTime) audio.currentTime = 0;
        looping = false;
    };
    this.isPlaying = function() {
        return !audio.paused;
    };
    this.isPaused = function() {
        return audio.paused;
    }; 
    this.stop = this.stopLoop;

    function audioLoop(noResetTime) {
        playSound(noResetTime);
    }
    function playSound(noResetTime) {
        // for really rapid sound repeat set noResetTime
        if(!audio.paused) {
            audio.pause();
            if (!noResetTime ) audio.currentTime = 0;
        }
        try{
            audio.volume
            var playPromise = audio.play();
            if(playPromise) {
                playPromise.then(function(){}).catch(function(err){});
            }
        } 
        catch(err){ console.error(err) }
    }
    this.updateVolume = function(volume) {
        if(typeof volume !== "number")
            throw new Error("Volume must be a number");

        if(volume < -100 || volume > 100)
            throw new Error("Volume must be a number between -100 and 100 inclusive");

        audio.volume = Math.max(0.0, Math.min(1.0, this.baseVolume * (volume / 100)));
    }
    this.mute = function() {
        audio.muted = true;
    }
    this.unmute = function() {
        audio.muted = false;
    }
    this.toggleMute = function() {
        audio.muted = !audio.muted;
    }
}

/**
"Getting it Done" by Kevin MacLeod (incompetech.com)
"Robobozo" by Kevin MacLeod (incompetech.com)
"Spazzmatica" Kevin MacLeod (incompetech.com)
"Pixel Peeker Polka" Kevin MacLeod (incompetech.com)
"Bit Shift" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/
 */

function preloadAudio() {
    this.coffeeBreakMusic  = new audioTrack('sounds/coffee-break-music.mp3');
    this.die               = new audioTrack('sounds/robobozo-death.mp3');
    this.ghostReturnToHome = new audioTrack('sounds/enemy_return.mp3');
    this.eatingEnemy       = new audioTrack('sounds/spazzmatica-powerup.mp3');
    this.ghostTurnToBlue   = new audioTrack('sounds/spazzmatica-running-2.mp3');
    this.eatingBonus       = new audioTrack('sounds/pixel-peeker-polka-bonus.mp3');
    this.enemyMove         = new audioTrack('sounds/chase_2.mp3');
    this.win               = new audioTrack('sounds/win.mp3');
    this.eating            = new audioTrack('sounds/tubie-tubie-8.mp3');
    this.startMusic        = new audioTrack('sounds/bit-shift-clip.mp3');
    this.mainMenuMusic     = new audioTrack('sounds/getting-it-done.mp3');

    this.tracks = [
        this.coffeeBreakMusic, this.die, this.ghostReturnToHome, this.eatingEnemy, 
        this.ghostTurnToBlue, this.eatingBonus, this.enemyMove, this.win,
        this.eating, this.startMusic, this.mainMenuMusic 
    ];

    this.ghostReset = function(noResetTime) {
        for (var s in this) {
            if (s == 'silence' || s == 'ghostReset' ) return;
            if (s.match(/^ghost/) && this[s].hasOwnProperty("stopLoop")) this[s].stopLoop(noResetTime);
        }
    }

    this.silence = function(noResetTime) {
        for (var s in this) {
            if ((s == 'silence' || s == 'ghostReset') || !this[s].hasOwnProperty("stopLoop")) return;
            this[s].stopLoop(noResetTime);
        }
    }

    this.isPlaying = function() {
        return this.tracks
            .map((track) => track.isPlaying())
            .reduce((acc, current) => acc || current, false);
    }
    
    this.setVolume = (volume) => {
        if(typeof volume !== "number")
            throw new Error("Volume must be a number");

        if(volume < -100 || volume > 100)
            throw new Error("Volume must be a number between -100 and 100 inclusive");

        globalVolume = Math.max(0, Math.min(100, volume));
        this.tracks.forEach((track) => track.updateVolume(volume));
    }

    this.changeVolume = (stepSize) => {
        console.log(stepSize);

        if(typeof stepSize !== "number")
            throw new Error("Volume step size must be a number");

        if(stepSize < -100 || stepSize > 100)
            throw new Error("Volume Step size must be a number between -100 and 100 inclusive");

        this.setVolume(Math.max(-100, Math.min(100, globalVolume + stepSize)));
    }

    this.volumeUp = (stepSize) => {
        if(stepSize !== undefined && typeof stepSize !== "number")
            throw new Error("If specifying a volume step size, it must be a number");

        if(stepSize !== undefined && (stepSize < 0 || stepSize > 100))
            throw new Error("Volume Step size must be a number between 0 and 100 inclusive");

        this.changeVolume(Math.min(100, (stepSize !== undefined) ? stepSize : VOLUME_STEP_SIZE));
    }

    this.volumeDown = (stepSize) => {
        if(stepSize !== undefined && typeof stepSize !== "number")
            throw new Error("If specifying a volume step size, it must be a number");

        if(stepSize !== undefined && (stepSize < 0 || stepSize >= 100))
            throw new Error("Volume Step size must be a number between 0 and 100 inclusive");

        this.changeVolume(Math.max(-100, (stepSize !== undefined) ? -stepSize : -VOLUME_STEP_SIZE));
    }

    this.mute = function() {
        this.tracks.forEach((track) => track.mute());
    }

    this.unmute = function() {
        this.tracks.forEach((track) => track.unmute());
    }

    this.toggleMute = function() {
        this.tracks.forEach((track) => track.toggleMute());
    }
}
