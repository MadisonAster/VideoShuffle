import fileOperations
import ffmpegScripts
from pprint import pprint
from pprint import pformat

VideoFolder = '../_Assets/VSVideo'
VideoJS = '../_js/VSVideo.js'
vSources = []
vSourceDurations = {}
for filename in fileOperations.listdir(VideoFolder):
    if filename.rsplit('.',1)[-1] == 'mp4':
        streamDict = ffmpegScripts.ffmpeg_getStream(filename)
        vSources.append(filename[1:])
        vSourceDurations[filename[1:]] = float(streamDict['duration'])*1000
s_vSources = 'vSources = '+pformat(vSources).replace('[','[\n').replace(']','\n]')+';'
s_vSourceDurations = 'vSourceDurations = '+pformat(vSourceDurations).replace('{','{\n').replace('}','\n}')+';'
vFileText = s_vSources+'\n'+s_vSourceDurations
with open(VideoJS, 'w') as file:
    file.write(vFileText)

AudioFolder = '../_Assets/VSAudio'
AudioJS = '../_js/VSAudio.js'
aSources = []
aSourceDurations = {}
for filename in fileOperations.listdir(AudioFolder):
    if filename.rsplit('.',1)[-1] == 'mp3':
        streamDict = ffmpegScripts.ffmpeg_getStream(filename)
        aSources.append(filename[1:])
        aSourceDurations[filename[1:]] = float(streamDict['duration'])*1000
s_aSources = 'aSources = '+pformat(aSources).replace('[','[\n').replace(']','\n]')+';'
s_aSourceDurations = 'aSourceDurations = '+pformat(aSourceDurations).replace('{','{\n').replace('}','\n}')+';'
aFileText = s_aSources+'\n'+s_aSourceDurations
with open(AudioJS, 'w') as file:
    file.write(aFileText)
