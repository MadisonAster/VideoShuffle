String.prototype.rsplit = function(sep, maxsplit) {
    var split = this.split(sep);
    return maxsplit ? [ split.slice(0, -maxsplit).join(sep) ].concat(split.slice(-maxsplit)) : split;
};

function FisherYatesShuffle(array) {
    //Takes: array
    //Performs: copies array and shuffles it using Fisher Yates algorithm
    //Returns: shuffled copy of array
    
  var m = array.length, t, i;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  };
  return array;
};

function ShufflePlayer(vSources, aSources, vSourceDurations, aSourceDurations, autostart, shufflevideosources, shuffleaudiosources){
    //Takes:
    //Performs:
    //Returns:
    
    this.videoSources = vSources;
    this.vSourceDurations = vSourceDurations;
    this.audioSources = aSources;
    this.aSourceDurations = aSourceDurations;
    this.videos = [];
    this.audios = [];
    this.autostart = autostart;
    this.shufflevideosources = shufflevideosources;
    this.shuffleaudiosources = shuffleaudiosources;

    this.videoWidth = 1280;
    this.videoHeight = 720;
    this.activeTransition = 'flash';
    
    this.vswrapper = document.getElementById('VideoShuffleWrapper');
    this.vswrapper.innerHTML = "\
        <canvas id='VideoShuffleCanvas'></canvas>\
        <div id='VideoShuffleControls' class='KeepOpen'>\
            <div id='VideoShufflePlayButton' class='VideoShuffleControlsButton paused'>\
                <svg viewBox='10 10 20.007 20.007' id='vsplay'>\
                    <path d='M27.204,19.191l-10.473-6.108c-0.954-0.557-1.724-0.112-1.719,0.992l0.054,12.124\
                    c0.005,1.104,0.784,1.553,1.741,1l10.393-6C28.156,20.647,28.158,19.748,27.204,19.191z'/>\
                </svg>\
                <svg viewBox='10 10 20.007 20.007' id='vspause'>\
                    <path d='M16.004,14.004c-1.104,0-2,0.895-2,2v7.999c0,1.104,0.896,2,2,2s2-0.896,2-2v-7.999\
                    C18.004,14.898,17.108,14.004,16.004,14.004z M24.004,14.004c-1.104,0-2,0.895-2,2v7.999\
                    c0,1.104,0.896,2.001,2,2.001s2-0.896,2-2.001v-7.999C26.004,14.898,25.108,14.004,24.004,14.004z'/>\
                </svg>\
            </div>\
            <div id='VideoShuffleMusicButton' class='VideoShuffleControlsButton'>\
                <svg viewBox='-30 -30 519.164 519.164'>\
                    <path d='M159.582,75.459v285.32c-14.274-10.374-32.573-16.616-52.5-16.616c-45.491,0-82.5,32.523-82.5,72.5s37.009,72.5,82.5,72.5\
                    s82.5-32.523,82.5-72.5V168.942l245-60.615v184.416c-14.274-10.374-32.573-16.616-52.5-16.616c-45.491,0-82.5,32.523-82.5,72.5\
                    s37.009,72.5,82.5,72.5s82.5-32.523,82.5-72.5V0L159.582,75.459z'/>\
                </svg>\
            </div>\
            <div id='VideoShuffleThumbnails'></div>\
            <div id='VideoShuffleFullscreenButton' class='VideoShuffleControlsButton'>\
                <svg viewBox='0 0 24 24'>\
                    <path d='M24 9h-2v-5h-7v-2h9v7zm-9 13v-2h7v-5h2v7h-9zm-15-7h2v5h7v2h-9v-7zm9-13v2h-7v5h-2v-7h9zm11 4h-16v12h16v-12z'/>\
                </svg>\
            </div>\
        </div>\
        <div id='VideoShuffleInfo'>\
            <svg version='1.1' id='VideoShuffleInfoButton' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'\
                width='112px' height='112px' viewBox='0 0 112 112' enable-background='new 0 0 112 112' xml:space='preserve'>\
                    <path d='M60.361,28.418c-0.563-0.434-1.214-0.742-1.97-0.915c-0.741-0.172-1.544-0.261-2.389-0.261\
                    c-0.851,0-1.652,0.089-2.414,0.261c-0.76,0.173-1.422,0.481-1.987,0.915c-0.56,0.435-1.003,1.012-1.33,1.723\
                    c-0.327,0.714-0.485,1.604-0.485,2.679c0,1.05,0.164,1.932,0.485,2.655c0.327,0.724,0.767,1.312,1.33,1.745\
                    c0.565,0.435,1.228,0.751,1.987,0.934c0.761,0.187,1.563,0.28,2.414,0.28c0.845,0,1.646-0.095,2.389-0.28\
                    c0.756-0.183,1.404-0.504,1.97-0.934c0.56-0.434,1.013-1.018,1.349-1.745c0.336-0.72,0.504-1.605,0.504-2.655\
                    c0-1.073-0.168-1.969-0.504-2.679C61.374,29.43,60.921,28.852,60.361,28.418z'/>\
                    <rect x='50.271' y='42.912' width='11.419' height='41.846'/>\
                    <path d='M56,0C25.074,0,0,25.074,0,56s25.074,56,56,56s56-25.074,56-56S86.926,0,56,0z M56,102.666\
                    C30.227,102.666,9.333,81.773,9.333,56C9.333,30.226,30.227,9.333,56,9.333S102.666,30.226,102.666,56\
                    C102.666,81.773,81.773,102.666,56,102.666z' />\
            </svg>\
            <article>\
                <h2>Video Shuffle</h2>\
                <p>A javascript video player that plays video clips as if they're edited together</p>\
                <p>Code by <a href='http://www.thomas-mcvay.info'>Madison Aster</a> available on <a href='http://github.com/MadisonAster/VideoShuffle'>GitHub</a>.</p>\
            </article>\
        </div>\
        <div id='VideoShuffleMusic'>\
            <input id='VideoShuffleVolumeSlider' type='range' min='0' max='100' value='100'>\
            <div id='VideoShuffleVolumeButton' class='high'>\
                <svg id='vsvolume-mute' viewBox='0 0 461.55 461.55'>\
                    <path d='M345.525,229.5c0-45.9-25.5-84.15-63.75-102v56.1l63.75,63.75C345.525,239.7,345.525,234.6,345.525,229.5z M409.275,229.5\
                    c0,22.95-5.1,45.9-12.75,66.3l38.25,38.25c17.85-30.6,25.5-68.85,25.5-107.1c0-109.65-76.5-201.45-178.5-224.4V56.1\
                    C355.725,81.6,409.275,147.9,409.275,229.5z M34.425,0L1.275,33.15L121.125,153H1.275v153h102l127.5,127.5V262.65L340.425,372.3\
                    c-17.851,12.75-35.7,22.95-58.65,30.601v53.55c35.7-7.65,66.3-22.95,94.35-45.9l51,51l33.15-33.149l-229.5-229.5L34.425,0z\
                    M230.775,25.5l-53.55,53.55l53.55,53.55V25.5z'/>\
                </svg>\
                <svg id='vsvolume-high' viewBox='0 0 459 459'>\
                    <path d='M0,153v153h102l127.5,127.5v-408L102,153H0z M344.25,229.5c0-45.9-25.5-84.15-63.75-102v204\
                    C318.75,313.65,344.25,275.4,344.25,229.5z M280.5,5.1v53.55C354.45,81.6,408,147.899,408,229.5S354.45,377.4,280.5,400.35V453.9\
                    C382.5,430.949,459,339.15,459,229.5C459,119.85,382.5,28.049,280.5,5.1z'/>\
                </svg>\
                <svg id='vsvolume-low' viewBox='0 0 341.333 341.333'>\
                    <polygon points='26.667,106.667 26.667,234.667 112,234.667 218.667,341.333 218.667,0 112,106.667 '/>\
                    <path d='M261.333,84.8v171.84c31.573-15.787,53.333-48.32,53.333-85.973S292.907,100.48,261.333,84.8z'/>\
                </svg>\
            </div>\
        </div>\
        <div id='VideoShuffleBigButton'>\
            <svg x='0px' y='0px' width='40.007px' height='40.007px' viewBox='0 0 40.007 40.007' style='enable-background:new 0 0 40.007 40.007;' xml:space='preserve' id='play'>\
                <path d='M37.324,10.004c-5.522-9.566-17.755-12.844-27.32-7.32C0.438,8.206-2.84,20.438,2.684,30.004\
                c5.522,9.565,17.754,12.843,27.32,7.32C39.569,31.801,42.848,19.569,37.324,10.004z M28.004,33.859\
                c-7.652,4.419-17.438,1.797-21.856-5.856c-4.419-7.652-1.796-17.438,5.856-21.855c7.652-4.419,17.438-1.797,21.856,5.856\
                C38.278,19.656,35.656,29.441,28.004,33.859z M27.204,19.191l-10.473-6.108c-0.954-0.557-1.724-0.112-1.719,0.992l0.054,12.124\
                c0.005,1.104,0.784,1.553,1.741,1l10.393-6C28.156,20.647,28.158,19.748,27.204,19.191z'/>\
			</svg>\
        </div>\
        ";
    
    this.canvas = document.getElementById('VideoShuffleCanvas');
    this.controls = document.getElementById('VideoShuffleControls');
    this.thumbs = document.getElementById('VideoShuffleThumbnails');
    this.MusicMenu = document.getElementById('VideoShuffleMusic');
    this.playbutton = document.getElementById('VideoShufflePlayButton');
    this.bigbutton = document.getElementById('VideoShuffleBigButton');
    this.fullscreenbutton = document.getElementById('VideoShuffleFullscreenButton');
    this.volumeslider = document.getElementById('VideoShuffleVolumeSlider');
    this.volumebutton = document.getElementById('VideoShuffleVolumeButton');
    this.infobutton = document.getElementById('VideoShuffleInfoButton');
    this.info = document.getElementById('VideoShuffleInfo');
    this.musicbutton = document.getElementById('VideoShuffleMusicButton');
    this.music = document.getElementById('VideoShuffleMusic');
    ///////////////////////////////////////////////////////
    //Main Code
    this.easeInOut = function(t) {
        //Takes: t as float value,
        //       should be called during each draw event for the animation,
        //Performs: Timing function for smoothly animated transitions,
        //          Linear timing is too abrupt at edges.
        //Returns: adjusted float value
        if (t < 0.5) {
            return 0.5 * Math.pow(t * 2, 2);
        };
        return -0.5 * (Math.pow(Math.abs(t * 2 - 2), 2) - 2);
    };
    this.initSeriously = function() {
        //Takes: this.transitions must be defined,
        //       this.videos must be defined,
        //       can only be called after metadata for one of the videos has loaded,
        //Performs: initializes seriously.js,
        //Returns:
        
        var key;
        this.seriously = new window.Seriously();
        this.target = this.seriously.target(this.canvas);
    
        for (key in this.transitions) {
            if (this.transitions.hasOwnProperty(key)) {
                this.transitions[key].init(this);
            };
        };
        for (i = 0; i < this.videos.length; i++) {
            
            var reformat = this.seriously.transform('reformat');
            reformat.width = this.canvas.width;
            reformat.height = this.canvas.height;
            reformat.mode = 'cover';
            if (this.videos[i].element.getAttribute('src') == this.videos[i].element.getAttribute('zsrc')) {
                reformat.source = this.videos[i].element;
            };
            this.videos[i].reformat = reformat;
            
        };
    };
    this.updateButtonState = function() {
        //Takes:
        //Performs: if playing, changes play button to pause button,
        //          if not playing, changes pause button to play button,
        //Returns:
        
        if(this.playing){
            this.playbutton.classList.add('playing');
            this.playbutton.classList.remove('paused');
        } else {
            this.playbutton.classList.add('paused');
            this.playbutton.classList.remove('playing');
        };
    };
    this.play = function() {
        //Takes:
        //Performs: sets start time for audio and video
        //          starts or resumes playback on nextVideo
        //          calls updateButtonState to change from play button to pause button
        //Returns:
        
        this.VideoStartTime = Date.now();
        this.AudioStartTime = Date.now();
        if (this.nextVideo) {
            this.nextVideo.play();
            this.playing = !this.nextVideo.paused;
        };
        if (this.nextAudio) {
            this.nextAudio.play();
        };
        this.updateButtonState();
    };
    this.pause = function() {
        //Takes:
        //Performs: sets pause time for audio and video
        //          pauses all videos and audios (we could be in the middle of a transition, so 2 might be playing at once)
        //          calls updateButtonState to change from pause button to play button
        //Returns:
        
        this.playing = false;
        this.VideoPausePoint = (Date.now()-this.VideoStartTime)+this.VideoPausePoint;
        this.AudioPausePoint = (Date.now()-this.AudioStartTime)+this.AudioPausePoint;
        for (i = 0; i < this.videos.length; i++) {
            this.videos[i].element.pause();
        };
        for (i = 0; i < this.audios.length; i++) {
            this.audios[i].element.pause();
        };
        this.updateButtonState();
    };
    this.random = function(min,max) {
        //Takes: min and max as ints
        //Performs:
        //Returns: random int between min and max
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    this.switchVideo = function(that, index) {
        //Takes: this as that, index as int index from this.videos
        //Performs: changes the active video index,
        //          swaps ysrc for zsrc on selected index, index+1, and index-1, sets ysrc for all others
        //          changes the button states,
        //          sets scroll position for thumbs container,
        //          resets pause points and start time for video,
        //          begins playback the selected index if this.playing
        //Returns:
        
        if (!that.seriously || that.ActiveVideoIndex === index || index >= that.videos.length) {
            //no change, nothing to do here
            return;
        };
        i = this.random(0, Object.keys(this.transitions).length-1);
        transitionName = Object.keys(this.transitions)[i];
        that.transitionClick(that, transitionName);
        
        if (that.ActiveVideoIndex >= 0) {
            that.videos[that.ActiveVideoIndex].button.classList.remove('active');
            that.transitionStart = Date.now();
            that.previousVideo = that.videos[that.ActiveVideoIndex].element;
            that.target.source = that.transition.start(that, that.videos[that.ActiveVideoIndex].reformat, that.videos[index].reformat);
        } else {
            that.target.source = that.videos[index].reformat;
        };
        
        that.ActiveVideoIndex = index;
        for (i = 0; i < this.videos.length; i++) {
            if (i >= that.ActiveVideoIndex-1 && i <= that.ActiveVideoIndex+1 || i == 0 && that.ActiveVideoIndex+1 == that.videos.length) {
                if(that.videos[i].element.getAttribute('src') == that.videos[i].element.getAttribute('ysrc')){
                    that.videos[i].element.pause();
                    that.videos[i].element.setAttribute('src', that.videos[i].element.getAttribute('zsrc'));
                    that.videos[i].element.load();
                    that.videos[i].reformat.source = that.videos[i].element;
                };
            } else {
                if(that.videos[i].element.getAttribute('src') == that.videos[i].element.getAttribute('zsrc')){
                    that.videos[i].element.pause();
                    that.videos[i].element.setAttribute('src', that.videos[i].element.getAttribute('ysrc'));
                };
            };
        };
        that.nextVideo = that.videos[that.ActiveVideoIndex].element;
        that.nextVideo.pause();
        that.nextVideo.currentTime = 0;
        that.VideoPausePoint = 0;
        that.videos[that.ActiveVideoIndex].button.classList.add('active');
        that.thumbs.scrollLeft = (that.ActiveVideoIndex-5)*(that.thumbs.offsetWidth * 0.09388888);
        
        if (that.playing) {
            that.VideoStartTime = Date.now();
            that.nextVideo.play();
        };
    };
    this.switchAudio = function(that, index) {
        //Takes: this as that, index as int index from this.audios
        //Performs: changes the active audio index,
        //          changes the button states,
        //          sets audio volume to current volume,
        //          resets pause points and start time for audio
        //Returns:
        
        if (!that.seriously || that.ActiveAudioIndex === index || index >= that.audios.length) {
            return;
        };
        if (that.ActiveAudioIndex >= 0) {
            that.audios[that.ActiveAudioIndex].button.className = '';
            
            that.previousAudio = that.audios[that.ActiveAudioIndex].element;
            that.previousAudio.pause();
        };
        that.audios[index].button.className = 'active';
        
        
        
        that.ActiveAudioIndex = index;
        that.nextAudio = that.audios[that.ActiveAudioIndex].element;
        that.nextAudio.pause();
        that.nextAudio.currentTime = 0;
        that.AudioPausePoint = 0;
        that.nextAudio.volume = this.audioVolume;
        if (that.playing) {
            that.AudioStartTime = Date.now();
            that.nextAudio.play();
        };
        
    };
    this.draw = function(that) {
        //Takes:
        //Performs: Runs repeatedly as long as the web page is visible, approximately every 16 milliseconds.
        //          calls switchVideo and switchAudio when playtime exceeds duration and pause time.
        //Returns:
        
        //
        PlayVideoDelta = Date.now()-that.VideoStartTime;
        VideoKey = that.videos[that.ActiveVideoIndex].element.key;
        VideoDuration = that.videos[that.ActiveVideoIndex].element.vduration;
        
        PlayAudioDelta = Date.now()-that.AudioStartTime;
        AudioKey = that.audios[that.ActiveAudioIndex].element.key;
        AudioDuration = that.audios[that.ActiveAudioIndex].element.aduration;
        
        if (that.playing && PlayVideoDelta >= VideoDuration-that.VideoPausePoint){
            that.switchVideo(that, (that.ActiveVideoIndex+1) % that.videos.length);
        };
        if (that.playing && PlayAudioDelta >= AudioDuration-that.AudioPausePoint){
            that.switchAudio(that, (that.ActiveAudioIndex+1) % that.audios.length);
        };
        if (that.transitionStart) {
            TransitionProgress = Math.max(Date.now() - that.transitionStart, 0) / that.transition.duration;
                if (TransitionProgress >= 1) {
                that.transitionStart = 0;
                that.target.source = that.videos[that.ActiveVideoIndex].reformat;
                if (that.previousVideo) {
                    that.previousVideo.pause();
                };
            } else {
                if (that.transition.volume !== false) {
                    if (that.previousVideo) {
                        that.previousVideo.volume = Math.min(1, Math.max(0, 1 - TransitionProgress));
                    };
                    that.nextVideo.volume = Math.min(1, Math.max(0, TransitionProgress));
                } else {
                    that.previousVideo.volume = 0;
                    that.nextVideo.volume = 1;
                };
                    that.transition.draw(that, TransitionProgress);
            };
        };
    };
    this.start = function() {
        //Takes: needs to be bound to loadedmetadata event on videos, 
        //       initSeriously can only be called after metadata for one of the videos has loaded,
        //Performs: initSeriously,
        //          resize,
        //          select video index 0,
        //          select audio index 0,
        //          begins playback if autostart is true,
        //Returns:
        
        if (this.seriously) {
            return;
        };
    
        for (i = 0; i < this.videos.length; i++) {
            if (!this.videos[i].element.readyState) {
                return;
            };
        };
        
        this.initSeriously();
        this.resize();
        this.seriously.go(this.draw.bind(null, this));
        this.switchVideo(this, 0);
        this.switchAudio(this, 0);
        if (this.autostart) {
            this.play();
        };
    };
    this.loadedmeta = function(that) {
        //Takes:
        //Performs: binding function that calls start. binding start directly was causing problems for some reason? Oh well, mysteries of the code.
        //Returns:
        
        that.start();
    };
    this.loadVideos = function() {
        //Takes:
        //Performs: shuffles this.videoSources if appropriate,
        //          loads this.videos from this.videoSources,
        //          creates thumbnail buttons,
        //Returns:
        
        if (this.shufflevideosources) {
            this.videoSources = FisherYatesShuffle(this.videoSources);
        };
        for (i = 0; i < this.videoSources.length; i++) {
            var video = document.createElement('video');
            var button = document.createElement('span');
            
            video.key = this.videoSources[i];
            video.index = this.videoSources[i];
            video.vduration = this.vSourceDurations[this.videoSources[i]];
            video.type = 'video/mp4';
            
            if (i == 0) {
                video.src = this.videoSources[i];
            } else {
                video.src = './_js/PlaceHolderVideo_1920.mp4';
            };
            video.setAttribute('ysrc', './_js/PlaceHolderVideo_1920.mp4');
            video.setAttribute('zsrc', this.videoSources[i]);
            
            video.crossOrigin = 'anonymous';
            video.preload = 'auto';
            video.id = 'video' + i;
            video.loop = false;
            video.muted = true;
            video.controls = true; //for debugging
            video.addEventListener('loadedmetadata', this.loadedmeta.bind(null, this), false);
            video.style.display = 'none';
            video.load();
            document.body.appendChild(video);
            
            button.style.backgroundImage = 'url('+this.videoSources[i].replace('.mp4', '.jpg')+')';
            button.style.backgroundSize = 'cover';
            button.style.backgroundRepeat = 'no-repeat';
            button.addEventListener('click', this.switchVideo.bind(null, this, i), false);
            this.thumbs.appendChild(button);
            
            this.videos.push({
                element: video,
                button: button,
                reformat: null
            });
        };
    };
    this.loadAudios = function() {
        //Takes:
        //Performs: shuffles this.audioSources if appropriate,
        //          loads this.audios from this.audioSources,
        //          creates audio buttons,
        //Returns:
        
        if (this.shuffleaudiosources) {
            this.audioSources = FisherYatesShuffle(this.audioSources);
        };
        this.audioVolume = 1.0;
        for (i = 0; i < this.audioSources.length; i++) {
            var audio = document.createElement('audio');
            var button = document.createElement('span');
            
            audio.volume = this.audioVolume;
            audio.aduration = this.aSourceDurations[this.audioSources[i]];
            audio.src = this.audioSources[i];
            audio.load();
            document.body.appendChild(audio);
            
            button.addEventListener('click', this.switchAudio.bind(null, this, i), false);
            button.innerHTML = this.audioSources[i].rsplit('.',1)[0].rsplit('/',1)[1];
            this.MusicMenu.appendChild(button);
            
            this.audios.push({
                element: audio,
                button: button,
            });
        };
    };
    ///////////////////////////////////////////////////////
    
    
    ///////////////////////////////////////////////////////
    //Initialize
    this.transitions = {
        //Each transition has its own callback functions:
        // init - set up the required effect nodes
        // start - attach the effect nodes to the video sources being transitioned
        // draw - runs every frame of the transition
        whip: {
            name: 'whip',
            title: 'Whip Pan',
            duration: 250,
            transformFrom: null,
            transformTo: null,
            blur: null,
            init: function (that) {
                var blur = that.seriously.effect('directionblur'),
                blend = that.seriously.effect('blend'),
                transformFrom = that.seriously.transform('2d'),
                transformTo = that.seriously.transform('2d');
    
                blend.bottom = transformFrom;
                blend.top = transformTo;
                blur.source = blend;
    
                this.transformFrom = transformFrom;
                this.transformTo = transformTo;
                this.blur = blur;
            },
            start: function (that, fromNode, toNode) {
                //todo: alternate direction of whip-pan
                this.transformFrom.source = fromNode;
                this.transformTo.source = toNode;
    
                return this.blur;
            },
            draw: function (that, amount) {
                //that.blur.amount = 1 - 2 * Math.abs(amount - 0.5);
                amount = that.easeInOut(amount);
                this.transformFrom.translateX = this.transformFrom.width * amount;
                this.transformTo.translateX = -this.transformTo.width * (1 - amount);
                this.blur.amount = Math.min(1, 1.2 * (1 - 2 * Math.abs(amount - 0.5)) + 0.2);
            }
        },
        flash: {
            name: 'flash',
            title: 'Flash',
            duration: 500,
            linear: null,
            blur: null,
            select: null,
            init: function (that) {
                var blur = that.seriously.effect('blur'),
                exposure = that.seriously.effect('exposure'),
    
                blend = that.seriously.effect('blend');
                blur.source = exposure;
                exposure.source = blend;
    
                this.blur = blur;
                this.exposure = exposure;
                this.blend = blend;
            },
            start: function (that, fromNode, toNode) {
                this.blend.bottom = fromNode;
                this.blend.top = toNode;
                this.blend.opacity = 0;
    
                return this.blur;
            },
            draw: function (that, amount) {
                this.blend.opacity = Math.min(1, Math.max(0, 1 - 8 * (0.5 - amount)));
    
                amount = 1 - 2 * Math.abs(amount - 0.5);
                this.blur.amount = 0.8 * amount;
                this.exposure.exposure = 6 * amount;
            }
        },
        channel: {
            name: 'channel',
            title: 'Channel Change',
            duration: 300,
            volume: false,
            tvProps: {
                distortion: [0.02, 0.2],
                lineSync: [0.03, 0.2],
                verticalSync: [0, 1],
                bars: [0.4, 0.6]
            },
            tvglitch: null,
            init: function (that) {
                var tvglitch = that.seriously.effect('tvglitch');
    
                tvglitch.distortion = 0.02;
                tvglitch.verticalSync = 0;
                tvglitch.scanlines = 0.22;
                tvglitch.lineSync = 0.03;
                tvglitch.frameSharpness = 10.67;
                tvglitch.frameLimit = 0.3644;
                tvglitch.bars = 0.4;
    
                this.tvglitch = tvglitch;
            },
            start: function (that, fromNode, toNode) {
                this.tvglitch.source = toNode;
                return this.tvglitch;
            },
            draw: function (that, amount) {
                var factor = 0;
                var key;
                var prop;
                var tvProps = this.tvProps;
                var tvglitch = this.tvglitch;
    
                factor = 1 - amount;
                factor = Math.max(factor, 0);
                factor = Math.min(factor, 1);
                factor = Math.pow(factor, 2);
    
                for (key in tvProps) {
                    if (tvProps.hasOwnProperty(key)) {
                        prop = tvProps[key];
                        tvglitch[key] = prop[0] + factor * (prop[1] - prop[0]);
                    };
                };
                tvglitch.time = Date.now();
            }
        }
    };
    this.transition = this.transitions[this.activeTransition];
    this.loadVideos();
    this.loadAudios();
    this.controls.classList.remove('KeepOpen');
    ///////////////////////////////////////////////////////
    
    
    ///////////////////////////////////////////////////////
    //Resize Behavior
    this.goFullScreen = function(that){
        //Takes:
        //Performs: toggles fullscreen via requestFullScreen() and cancelFullScreen()
        //Returns:
        
        if ((document.fullScreenElement && document.fullScreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
            if(that.vswrapper.requestFullScreen){
                that.vswrapper.requestFullScreen();
            } else if(vswrapper.webkitRequestFullScreen){
                that.vswrapper.webkitRequestFullScreen();
            } else if(that.vswrapper.mozRequestFullScreen){
                that.vswrapper.mozRequestFullScreen();
            };
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();  
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();  
            }; 
        };
    };
    this.debounce = function(func, wait) {
        //Takes: func as callable function argument, wait as int time
        //Performs: Keeps a function from running too frequently in case it's too slow.
        //          We use it for resizing, which takes too long to be run every time
        //          the event fires when the user is dragging to resize the window.
        //Returns: timeout function
        var timeout;
        var lastRun = 0;
        return function() {
            var context = this, args = arguments;
            if (Date.now() - lastRun >= wait) {
                lastRun = Date.now();
                func.apply(context, args);
            } else {
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    timeout = null;
                    func.apply(context, args);
                    lastRun = Date.now();
                }, wait);
            };
        };
    };
    this.resize = this.debounce(function () {
        //Takes:
        //Performs: resizes canvas based on the wrapper width
        //Returns:
        
        var width = this.vswrapper.offsetWidth;
        console.log('resize fired '+width);
        if (width == 0) {
            return;
        };
        var height = width / (16/9);
        
        this.vswrapper.style.height = height;
        if (width/height <= 16/9) {
            height = width / (16/9);
        } else {
            width = height * (16/9);
        };
        
        this.canvas.width = width;
        this.canvas.height = height;
        for (i = 0; i < this.videos.length; i++) {
            if (this.videos[i].reformat != null) {
                this.videos[i].reformat.width = width;
                this.videos[i].reformat.height = height;
            };
        };
    }, 30, true);
    window.addEventListener('orientationchange', this.resize);
    window.addEventListener('resize', this.resize);
    
    this.fullscreenbutton.addEventListener('click', this.goFullScreen.bind(null, this), false);
    ///////////////////////////////////////////////////////
    
    
    ///////////////////////////////////////////////////////
    //PlayButton
    this.togglePlay = function(that) {
        //Takes:
        //Performs: toggles playback
        //Returns:
        if (that.playing) {
            that.pause();
        } else {
            that.play();
        };
        that.bigbutton.style.display = 'none';
    };
    this.spacebar = function(evt) {
        //Takes: evt as event object
        //Performs: calls toggle play if spacebar key is detected
        //Returns:
        if (evt.which === 32) {
            this.togglePlay(this);
        };
    };
    this.canvas.addEventListener('click', this.togglePlay.bind(null, this), false);
    this.playbutton.addEventListener('click', this.togglePlay.bind(null, this), false);
    this.bigbutton.addEventListener('click', this.togglePlay.bind(null, this), false);
    window.addEventListener('keyup', this.spacebar.bind(this));
    ///////////////////////////////////////////////////////
    
    
    ///////////////////////////////////////////////////////
    //Transition Buttons
    this.transitionClick = function(that, transitionName) {
        //Takes: that as this, transitionName as str
        //Performs: changes video transition
        //Returns:
        that.activeTransition = transitionName;
        that.transition = that.transitions[that.activeTransition];
    };
    ///////////////////////////////////////////////////////
    
    
    ///////////////////////////////////////////////////////
    //Sleep Mode
    this.visibilityChange = function(that) {
        //Takes: that as this
        //Performs: pauses playback if window or tab is set to background
        //Returns:
        if (that.videos[that.ActiveVideoIndex] != null){
            if (document.hidden || document.mozHidden || document.msHidden || document.webkitHidden) {
                that.videos[that.ActiveVideoIndex].element.pause();
            } else if (that.playing) {
                that.videos[that.ActiveVideoIndex].element.play();
            };
        };
    };
    document.addEventListener('visibilitychange', this.visibilityChange.bind(null, this), false);
    document.addEventListener('mozvisibilitychange', this.visibilityChange.bind(null, this), false);
    document.addEventListener('msvisibilitychange', this.visibilityChange.bind(null, this), false);
    document.addEventListener('webkitvisibilitychange', this.visibilityChange.bind(null, this), false);
    ///////////////////////////////////////////////////////
    
    
    ///////////////////////////////////////////////////////
    //InfoButton
    this.infoClick = function(that) {
        //Takes: that as this
        //Performs: displays info div
        //Returns:
        if (that.info.className) {
            that.info.className = '';
        } else {
            that.info.className = 'open';
        };
    };
    this.infobutton.addEventListener('click', this.infoClick.bind(null, this), false);
    ///////////////////////////////////////////////////////
    
    ///////////////////////////////////////////////////////
    //MusicButton
    this.musicClick = function(that) {
        //Takes: that as this
        //Performs: displays music menu
        //Returns:
        if (that.music.className) {
            that.music.className = '';
            that.controls.classList.remove('KeepOpen');
        } else {
            that.music.className = 'open';
            that.controls.classList.add('KeepOpen');
        };
    };
    this.musicbutton.addEventListener('click', this.musicClick.bind(null, this), false);
    
    this.VolumeChange = function(that) {
        //Takes: that as this
        //Performs: sets volume based on volume slider
        //Returns:
        
        volume = that.volumeslider.value/100.0;
        that.SetVolume(that, volume, false);
    };
    this.SetVolume = function(that, volume, setSlider){
        //Takes: that as this, volume as float 0.0 to 0.1, setSlider as bool
        //Performs: sets volume to provided value,
        //          changes slider postition to match value if setSlider is true
        //Returns:
        
        that.audioVolume = volume;
        that.nextAudio.volume = volume;
        if(setSlider){
            that.volumeslider.value = volume*100.0;
        };
    };
    this.VolumeClick = function(that) {
        //Takes: that as this
        //Performs: toggles volume between 0.0 0.5 and 1.0,
        //          changes displayed volume svg to match mode
        //Returns:
        if(that.volumebutton.className == 'muted'){
            that.volumebutton.classList.add('low');
            that.volumebutton.classList.remove('muted');
            that.SetVolume(that, 0.5, true)
        } else if (that.volumebutton.className == 'low'){
            that.volumebutton.classList.add('high');
            that.volumebutton.classList.remove('low');
            that.SetVolume(that, 1.0, true);
        } else if (that.volumebutton.className == 'high'){
            that.volumebutton.classList.add('muted');
            that.volumebutton.classList.remove('high');
            that.SetVolume(that, 0, true);
        };
    };
    this.volumeslider.addEventListener('input', this.VolumeChange.bind(null, this), false);
    this.volumebutton.addEventListener('click', this.VolumeClick.bind(null, this), false);
    ///////////////////////////////////////////////////////
    
    return this;
};
