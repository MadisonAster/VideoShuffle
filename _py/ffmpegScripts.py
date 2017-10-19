import sys, re
import subprocess
import datetime

sys.path.append(__file__.replace('\\','/').rsplit('/',2)[0])
import fileOperations


def ffmpeg_getStream(filePath):
    #Takes: filePath as valid media path str, ffmpeg bin folder needs to be in PATH environment variable on your OS
    #Performs: calls ffmpeg on supplied filePath and gets stream info
    #Returns: dictionary of values from ffmpeg
    
    ffmpegStr = 'ffprobe "'+filePath+'" -v quiet -show_streams'
    
    proc = subprocess.Popen(ffmpegStr, stdout=subprocess.PIPE)
    streamInfo = proc.stdout.read()
    proc.stdout.close()

    streamInfo = streamInfo.split('\r\n')
    for i in reversed(range(len(streamInfo))):
        if '=' not in streamInfo[i]:
            streamInfo.pop(i)
            
    streamDict = {}
    for line in streamInfo:
        line = line.split('=',1)
        streamDict[line[0]] = line[1]
        
    return streamDict

def getItemStream(filePath):
    #Takes: filePath as valid sequence or video file path
    #Performs: call to ffmpeg_getStream
    #Returns: dictionary of values from ffmpeg
    if fileOperations.isPattern(filePath):
        first, last = fileOperations.getSequenceRange(filePath)
        filePath = fileOperations.patternFill(filePath, first)
        return ffmpeg_getStream(filePath)
    else:
        return ffmpeg_getStream(filePath)
        
def get_frame_length(filePath):
    #Takes: filePath as valid video file path
    #Performs: call to ffmpeg_getStream
    #Returns: duration of video file as int
    if fileOperations.isPattern(filePath):
        first, last = fileOperations.getSequenceRange(filePath)
        return int(last)-int(first)
    else:
        stream = ffmpeg_getStream(filePath)
        if stream['codec_time_base'] == '1/24':
            FrameRate = 24000.0/1001.0 #Correct Math for 23.976023976
            FrameRate = 23.97602746     #ffmpeg's incorrect math
        else:
            FrameRate = float(stream['codec_time_base'].split('/',1)[1])
        return int(float(stream['duration'])*FrameRate)
        
def getItemRange(item):
    #Takes: item as valid sequence pattern or video file path
    #Performs: call to get_frame_length or call to fileOperations.getSequenceRange
    #Returns: firstFrame, lastFrame as int, int
    if fileOperations.isPattern(item):
        return fileOperations.getSequenceRange(item)
    else:
        return 0, get_frame_length(item)
        
def get_image_resolution(filePath):
    stream = ffmpeg_getStream(filePath)
    return stream['width']+'x'+stream['height']
    
#def generate_Thumbnail(shotPath, tag, imagePath, date):
def generate_Thumbnail(itemPath, thumbPath, frameNumber = None, scale = '160x89'):
    #Takes: itemPath as seqPattern or filePath, thumPath as target filepath, frameNumber as int, scale as string ie 160x89
    #Performs: generates image file at thumbPath
    #Returns: Path to thumbnail
    fileOperations.touchFolder(thumbPath.rsplit('/',1)[0])
    filters = ',curves=lighter,curves=lighter,pp=al'
    if frameNumber is None:
        ffmpegStr = 'ffmpeg -v warning -i "'+itemPath+'" -qscale:v 4 -vf "[in] scale='+scale+filters+' [out]" -y "'+thumbPath+'"'
    else:
        ffmpegStr = 'ffmpeg -v warning -ss 0:0:0.'+str(frameNumber)+' -i "'+itemPath+'" -qscale:v 4 -vf "[in] scale='+scale+filters+' [out]" -vframes 1 -y "'+thumbPath+'"'
    subprocess.call(ffmpegStr)
    return thumbPath
    
def generate_Quicktime(sequencePath, frameRate, filePath, res = None):
    firstFrame, lastFrame = fileOperations.getSequenceRange(sequencePath)
    firstFrame = str(int(firstFrame))
    if res == None:
        ffmpegStr = 'ffmpeg -start_number '+firstFrame+' -r '+frameRate+' -i "'+sequencePath+'" -qscale:v 4 -vcodec mjpeg -y "'+filePath+'"'
    else:
        ffmpegStr = 'ffmpeg -start_number '+firstFrame+' -r '+frameRate+' -i "'+sequencePath+'" -qscale:v 4 -vf "[in] scale='+res+' [out]" -vcodec mjpeg -y "'+filePath+'"'
    subprocess.call(ffmpegStr)
    
def generate_Proxies(sequencePath, proxyScale, filePath):
    firstFrame, lastFrame = fileOperations.getSequenceRange(sequencePath)
    firstFrame = int(firstFrame)
    lastFrame = int(lastFrame)
    srcPadding = sequencePath[re.search("%\d\dd", sequencePath).start():re.search("%\d\dd", sequencePath).end()]
    destPadding = filePath[re.search("%\d\dd", filePath).start():re.search("%\d\dd", filePath).end()]
    srcPaddingDigits = int(sequencePath[re.search("%\d\dd", sequencePath).start()+1:re.search("%\d\dd", sequencePath).end()-1])
    destPaddingDigits = int(filePath[re.search("%\d\dd", filePath).start()+1:re.search("%\d\dd", filePath).end()-1])
    for i in range(firstFrame, lastFrame+1):
        srcPath = sequencePath.replace(srcPadding,str(i).zfill(srcPaddingDigits))
        destPath = filePath.replace(destPadding,str(i).zfill(destPaddingDigits))
        ffmpegStr = 'ffmpeg -v warning -i "'+srcPath+'" -vf "[in] scale='+proxyScale+' [out]" -y "'+destPath+'"'
        subprocess.call(ffmpegStr)
    
def checkSimilarity(path1, path2, path1frame = None, path2frame = None):
    #Takes: path1 as valid file path, path2 as valid file path, frame as video file frame int
    #Performs: ffmpeg histogram check between two images
    #Returns: True if similarity is below threshold
    return False
    
def checkSingleSimilarityAgainst(filePath, itemPath, frame = None):
    #Takes: filePath as single image path, itemPath as sequence or video file path
    #Performs: calls checkSimilarity against each image in the sequence or video
    #Returns: True if any of the calls to checkSimilarity return True
    if fileOperations.isPattern(itemPath):
        for file in fileOperations.listdir(itemPath):
            if checkSimilarity(filePath, file, path1frame = frame) is True:
                return True
        else:
            return False
    else:
        for i in range(get_frame_length(itemPath)+1):
            if checkSimilarity(filePath, itemPath, path1frame = frame, path2frame = i) is True:
                return True
        else:
            return False
            
def checkSimilarityAgainst(inputItem, itemPath):
    #Takes: inputItem as sequence or video file path, itemPath as sequence or video file path
    #Performs: calls checkSingleSimilarityAgainst against each image in the sequence or video
    #Returns: True if any of the calls to checkSingleSimilarityAgainst return True
    if fileOperations.isPattern(inputItem):
        for file in fileOperations.listdir(inputItem):
            if checkSingleSimilarityAgainst(file, itemPath) is True:
                return True
        else:
            return False
    else:
        for i in range(get_frame_length(inputItem)+1):
            if checkSingleSimilarityAgainst(inputItem, itemPath, frame = i) is True:
                return True
        else:
            return False