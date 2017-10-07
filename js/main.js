function ShufflePlayer(vSources){
    this.videoFormats = [
    'mp4'
    ];
    this.videoSources = [
    'tiger',
    'girl',
    'vader',
    'koch',
    'olympia',
    'danceforme',
    ];
    this.videos = [];
    this.audioSources = [
        'girl',
    ];
    this.audios = [];

    this.videoWidth = 1280;
    this.videoHeight = 720;

    this.seriously;
    this.target;
    
    //state
    this.selectedIndex = -1;
    this.transition;
    this.activeTransition = 'flash';
    this.transitionStart = 0;
    this.previousVideo;
    this.nextVideo;
    this.playing = false;
    
    this.canvas = document.getElementById('canvas');
    this.controls = document.getElementById('controls');
    this.bigbutton = document.getElementById('bigbutton');
    this.infobutton = document.getElementById('infobutton');
    this.info = document.getElementById('info');
    
    this.easeInOut = function(t) {
        //Timing function for smoothly animated transitions.
        //Linear timing is too abrupt at edges.
        if (t < 0.5) {
            return 0.5 * Math.pow(t * 2, 2);
        };
        return -0.5 * (Math.pow(Math.abs(t * 2 - 2), 2) - 2);
    };
    
    this.debounce = function(func, wait) {
        //Keeps a function from running too frequently in case it's too slow.
        //We use it for resizing, which takes too long to be run every time
        //the event fires when the user is dragging to resize the window.
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
        var width = Math.min(this.videoWidth, window.innerWidth);
        var height = Math.min(this.videoHeight, window.innerHeight);

        if (width / height < 16 / 9) {
            height = width * 9 / 16;
        };

        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';

        // If it's a big enough screen and we have a retina display, let's take advantage.
        // We assume that the GPU will be able to handle it
        if (window.screen.width * window.devicePixelRatio > this.videoWidth) {
            width *= window.devicePixelRatio;
            height *= window.devicePixelRatio;
        };

        this.canvas.width = width;
        this.canvas.height = height;
        for (i = 0; i < this.videos.length; i++) {
            this.videos[i].reformat.width = width;
            this.videos[i].reformat.height = height;
        };
    }, 30, true);

    this.transitions = {
        //Each transition has its own callback functions:
        // init - set up the required effect nodes
        // start - attach the effect nodes to the video sources being transitioned
        // draw - runs every frame of the transition
        whip: {
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
    
                that.transformFrom = transformFrom;
                that.transformTo = transformTo;
                that.blur = blur;
            },
            start: function (that, fromNode, toNode) {
                //todo: alternate direction of whip-pan
                that.transformFrom.source = fromNode;
                that.transformTo.source = toNode;
    
                return that.blur;
            },
            draw: function (that, amount) {
                //that.blur.amount = 1 - 2 * Math.abs(amount - 0.5);
                amount = that.easeInOut(amount);
                that.transformFrom.translateX = that.transformFrom.width * amount;
                that.transformTo.translateX = -that.transformTo.width * (1 - amount);
                that.blur.amount = Math.min(1, 1.2 * (1 - 2 * Math.abs(amount - 0.5)) + 0.2);
            }
        },
        flash: {
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
    
                that.blur = blur;
                that.exposure = exposure;
                that.blend = blend;
            },
            start: function (that, fromNode, toNode) {
                that.blend.bottom = fromNode;
                that.blend.top = toNode;
                that.blend.opacity = 0;
    
                return that.blur;
            },
            draw: function (that, amount) {
                that.blend.opacity = Math.min(1, Math.max(0, 1 - 8 * (0.5 - amount)));
    
                amount = 1 - 2 * Math.abs(amount - 0.5);
                that.blur.amount = 0.8 * amount;
                that.exposure.exposure = 6 * amount;
            }
        },
        channel: {
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
    
                that.tvglitch = tvglitch;
            },
            start: function (that, fromNode, toNode) {
                that.tvglitch.source = toNode;
                return that.tvglitch;
            },
            draw: function (that, amount) {
                var factor = 0;
                var key;
                var prop;
                var tvProps = that.tvProps;
                var tvglitch = that.tvglitch;
    
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
    
    this.initSeriously = function() {
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
            reformat.source = this.videos[i].element;
            reformat.mode = 'cover';
            this.videos[i].reformat = reformat;
        };
    };
    this.updateButtonState = function() {
        this.bigbutton.className = this.playing ? 'playing' : 'paused';
    };
    this.play = function() {
        if (this.nextVideo) {
            this.nextVideo.play();
            this.playing = !this.nextVideo.paused;
        };
        this.updateButtonState();
    };
    this.pause = function() {
        var i;
        this.playing = false;
        for (i = 0; i < this.videos.length; i++) {
            this.videos[i].element.pause();
        };
        this.updateButtonState();
    };
    this.togglePlay = function(that) {
        if (that.playing) {
            that.pause();
        } else {
            that.play();
        };
    };
    this.switchVideo = function(that, index) {
        if (!that.seriously || that.selectedIndex === index || index >= that.videos.length) {
            //no change, nothing to do here
            return;
        };
        if (that.selectedIndex >= 0) {
            that.transitionStart = Date.now();
            that.previousVideo = that.videos[that.selectedIndex].element;
            that.target.source = that.transition.start(that, that.videos[that.selectedIndex].reformat, that.videos[index].reformat);
        } else {
            that.target.source = that.videos[index].reformat;
        };
        
        that.selectedIndex = index;
        that.nextVideo = that.videos[that.selectedIndex].element;
        if (that.playing) {
            that.nextVideo.play();
        };
    };
    this.draw = function(that) {
        //Runs repeatedly as long as the web page is visible, approximately every 16 milliseconds.
        //Only does work while the transition is running, handles timing of the animation
        //and volume cross-fade.
        var progress;
        if (that.transitionStart) {
            progress = Math.max(Date.now() - that.transitionStart, 0) / that.transition.duration;
                if (progress >= 1) {
                that.transitionStart = 0;
                that.target.source = that.videos[that.selectedIndex].reformat;
                if (that.previousVideo) {
                    that.previousVideo.pause();
                };
            } else {
                if (that.transition.volume !== false) {
                    if (that.previousVideo) {
                        that.previousVideo.volume = Math.min(1, Math.max(0, 1 - progress));
                    };
                    that.nextVideo.volume = Math.min(1, Math.max(0, progress));
                } else {
                    that.previousVideo.volume = 0;
                    that.nextVideo.volume = 1;
                };
                    that.transition.draw(that, progress);
            };
        };
    };
    this.start = function() {
        var i;
        
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
        this.play();
    };
    this.loadedmeta = function(that) {
        that.start();
    };
    this.infoClick = function(that) {
        if (that.info.className) {
            that.info.className = '';
        } else {
            that.info.className = 'open';
        };
    };
    this.loadVideos = function() {
        var i;
        var format;
        var type;
        var vid;
        var maxDim;
        var size = 'hd';
        
        vid = document.createElement('video');
        
        //Make our best guess about the appropriate video size
        maxDim = Math.max(screen.width, screen.height);
        if (window.matchMedia('handheld').matches || maxDim < 1280) {
            if (maxDim * (window.devicePixelRatio || 1) < 960) {
                size = 'small';
                this.videoWidth = 640;
                this.videoHeight = 360;
            } else {
                size = 'mid';
                this.videoWidth = 960;
                this.videoHeight = 540;
            };
        };
        
        for (i = 0; i < this.videoFormats.length; i++) {
            type = 'video/' + this.videoFormats[i];
            if (vid.canPlayType && vid.canPlayType(type)) {
                format = this.videoFormats[i];
                break;
            };
        };
        
        if (!format) {
            //todo: display some kind of error
            console.log('Unable to play any video types');
            return;
        };
        
        for (i = 0; i < this.videoSources.length; i++) {
            var video = document.createElement('video');
            var button;
            
            video.type = type;
            video.src = 'video/'+this.videoSources[i]+'.'+format;
            video.crossOrigin = 'anonymous';
            video.preload = 'auto';
            video.id = 'video' + i;
            video.loop = true;
            video.controls = true; //for debugging
            
            video.addEventListener('loadedmetadata', this.loadedmeta.bind(null, this), false);
            video.load();
            document.body.appendChild(video);

            button = document.createElement('span');
            button.style.backgroundImage = 'url(images/'+this.videoSources[i]+'.jpg)';
            button.style.backgroundSize = 'contain';
            button.style.backgroundRepeat = 'no-repeat';
            button.addEventListener('click', this.switchVideo.bind(null, this, i), false);
            this.controls.appendChild(button);
            
            this.videos.push({
                element: video,
                button: button,
                reformat: null
            });
        };
        this.updateButtonState();
    };
    this.visibilityChange = function(that) {
        //Pause the video when this browser tab is in the background or minimized.
        //Resume when it comes back in focus, but only if the user didn't pause manually.
        if (document.hidden || document.mozHidden || document.msHidden || document.webkitHidden) {
            that.videos[that.selectedIndex].element.pause();
        } else if (that.playing) {
            that.videos[that.selectedIndex].element.play();
        };
    };
    this.transitionClick = function(that, transitionName) {
        console.log(transitionName);
        that.transitions[that.activeTransition].button.className = '';
        that.activeTransition = transitionName;
        that.transition = that.transitions[that.activeTransition];
        that.transitions[transitionName].button.className = 'active';
    };
    this.transition = this.transitions[this.activeTransition];
    this.loadVideos();
    
    for (i = 0; i < Object.keys(this.transitions).length; i++) {
        t = Object.keys(this.transitions)[i];
        
        var button = document.getElementById(t);
        this.transitions[t].button = button;
        button.addEventListener('click', this.transitionClick.bind(null, this, t), false);
    };

    document.getElementById(this.activeTransition).className = 'active';
    
    document.addEventListener('visibilitychange', this.visibilityChange.bind(null, this), false);
    document.addEventListener('mozvisibilitychange', this.visibilityChange.bind(null, this), false);
    document.addEventListener('msvisibilitychange', this.visibilityChange.bind(null, this), false);
    document.addEventListener('webkitvisibilitychange', this.visibilityChange.bind(null, this), false);
    
    window.addEventListener('orientationchange', this.resize);
    window.addEventListener('resize', this.resize);
    
    this.canvas.addEventListener('click', this.togglePlay.bind(null, this), false);
    this.bigbutton.addEventListener('click', this.togglePlay.bind(null, this), false);
    window.addEventListener('keyup', function(evt) {
        //User can press the space bar to toggle pause/play
        if (evt.which === 32) {
            this.togglePlay(this);
        }
    }, true);
    
    this.infobutton.addEventListener('click', this.infoClick.bind(null, this), false);
};


var ss = ShufflePlayer([]);














