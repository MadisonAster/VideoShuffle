# Video Shuffle

This is an automatic video clip player that plays through videos provided to it in an array.

**[View demo](http://thomas-mcvay.info/DemoReel)**

## Transitions

The starting point for this code, and the video transition behavior is all from the code this library is originally forked from [here](https://github.com/povdocs/video-transitions)

## Get started in 5 steps:
 
1. Prepare your media, all video files should be mp4 format, and have a jpg thumbnail with the same name. All audio files should be mp3. Place them in ./_Assets/VSVideo and ./_Assets/VSAudio

2. Run DemoReelIngest.py (dependent on ffmpeg) or create your own backend script to load filenames and durations. (Javascript can't get video durations until after videos load, we need the durations ahead of time for buffering)

3. simply add the following lines from the example files:
    <script type='text/javascript' src='./_js/Seriously.js/seriously.js'></script>
    <script type='text/javascript' src='./_js/Seriously.js/effects/seriously.directionblur.js'></script>
    <script type='text/javascript' src='./_js/Seriously.js/effects/seriously.blend.js'></script>
    <script type='text/javascript' src='./_js/Seriously.js/effects/seriously.tvglitch.js'></script>
    <script type='text/javascript' src='./_js/Seriously.js/effects/seriously.linear-transfer.js'></script>
    <script type='text/javascript' src='./_js/Seriously.js/effects/seriously.blur.js'></script>
    <script type='text/javascript' src='./_js/Seriously.js/effects/seriously.exposure.js'></script>
    <script type='text/javascript' src='./_js/VideoShuffle.js'></script>
    <script type='text/javascript' src='./_js/VSAudio.js'></script>
    <script type='text/javascript' src='./_js/VSVideo.js'></script>
    
4. Create a div with 'VideoShuffleWrapper' as the id:
    <div id='VideoShuffleWrapper' style='position:absolute;width:100%;height:auto;max-height:100%;top:50%;transform:translate(0%, -50%);'/>
    
5. Initialize the library in your html, or in your onload functions
    <script>
        ShufflePlayer(vSources, aSources, vSourceDurations, aSourceDurations, false, true, false);
    </script>
    
Bonus points: Set up a cron job for the python script, periodically add clips to it, and enjoy never having to edit a demo reel again!