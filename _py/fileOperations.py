import sys, os, shutil, re

def mirrorFolder(templateFolder, targetFolder):
    #Takes: Str, Str   as valid paths
    #for each templateFolde not found to exist in target folder, makes an empty folder
    #Returns: True if successful, False if there was an error
    try:
        for path, dirs, files in os.walk(templateFolder):
            touchFolder(targetFolder+path.split(templateFolder,1)[-1])
        return True
    except:
        return False
def touchFolder(path):
    #Takes: Str   as valid path
    #Creates folder at location, and any necessary parent folders along the way
    #Returns: True if successful, False if there was an error
    if os.access(path,os.F_OK):
        return True
    else:
        try:
            #print('making empty directory: '+path)
            os.makedirs(path)
            return touchFolder(path)
        except:
            print('Error Creating empty directory: '+path)
            return False
            
def copyFile(templateFile, targetFile):
    #Takes: Str, Str   as valid paths
    #Copies file at templateFile to path at targetFile
    #Returns: True if successful, False if there was an error
    
    targetFile = targetFile.replace('\\','/')
    if not os.access(targetFile.rsplit('/',1)[0], os.W_OK):
        touchFolder(targetFile.rsplit('/',1)[0])
        
    if os.access(targetFile, os.F_OK):
        print('File already exists!: '+targetFile)
        return False
    else:
        try:
            print ('Copying File to: '+targetFile)
            shutil.copyfile(templateFile, targetFile)
            return True
        except:
            print ('File Path not writeable: '+targetFile)
            return False
            
def copyFolder(templateFolder, targetFolder):
    #Takes: Str, Str   as valid paths
    #Copies file at templateFolder to path at targetFolder
    #Returns: True if successful, False if there was an error
    try:
        print ('Copying Folder to: '+targetFolder)
        shutil.copytree(templateFolder, targetFolder)
        return True
    except:
        print ('File Path not a valid directory: '+targetFolder)
        return False
        
def copyItem(ItemPath, targetPath, repad = None, forceFnToRight = False, _FRAMEDELIMITER = '.'):
    #Takes: ItemPath as valid path or pattern, targetPath as valid path or pattern
    #Copies file at templateFolder to path at targetPath
    #Returns: True if successful, False if there was an error
    IllegalCharReplacement = {
    ' ' : '_',
    }
    result = False
    ItemPath = ItemPath.replace('\\','/')
    if targetPath.rsplit('.',1)[-1] == 'EXT':
        targetPath = targetPath.rsplit('.',1)[0]+'.'+ItemPath.rsplit('.',1)[-1]
    targetingFolder = True
    if targetPath.rsplit('.',1)[-1] == ItemPath.rsplit('.',1)[-1]:
        targetingFolder = False
    if exists(ItemPath):
        if os.path.isfile(ItemPath):
            if targetingFolder is True:
                result = copyFile(ItemPath, targetPath+'/'+ItemPath.rsplit('/',1)[1])
            else:
                result = copyFile(ItemPath, targetPath)
        elif os.path.isdir(ItemPath):
            result = copyFolder(ItemPath, targetPath)
        else:   #Its a sequence pattern.
            targetPattern = ItemPath
            InputMatchObject = re.search("%\d\dd", ItemPath)
            InputFrameStart, InputFrameEnd = InputMatchObject.start(), InputMatchObject.end()+int(InputMatchObject.group().strip('%').rstrip('d'))-4
            if forceFnToRight is True:
                seqName = targetPattern.rsplit('.',1)[0]
                tempMatchObject = re.search("%\d\dd", seqName)
                resultSeqName = seqName[:tempMatchObject.start()]+seqName[tempMatchObject.end():]
                if resultSeqName[-1] != _FRAMEDELIMITER:
                    resultSeqName += _FRAMEDELIMITER
                targetPattern = resultSeqName+tempMatchObject.group()+'.'+targetPattern.rsplit('.',1)[1]
            TargetMatchObject = re.search("%\d\dd", targetPattern)
            for file in os.listdir(ItemPath.rsplit('/',1)[0]):
                if patternMatch(ItemPath, ItemPath.rsplit('/',1)[0]+'/'+file):
                    frameNumber = ItemPath.rsplit('/',1)[0]+'/'+file
                    frameNumber = frameNumber[InputFrameStart:InputFrameEnd]
                    if targetingFolder is True:
                        if repad != None:
                            newFile = targetPattern.rsplit('/',1)[1].replace(TargetMatchObject.group(), frameNumber.zfill(repad))
                        else:
                            newFile = targetPattern.rsplit('/',1)[1].replace(TargetMatchObject.group(), frameNumber)
                        
                        for char in IllegalCharReplacement:
                            newFile = newFile.replace(char, IllegalCharReplacement[char])
                        fileResult = copyFile(ItemPath.rsplit('/',1)[0]+'/'+file, targetPath+'/'+newFile)
                    else:
                        repad = int(targetPath[re.search("%\d\dd", targetPath).start()+1:re.search("%\d\dd", targetPath).end()-1])
                        fileResult = copyFile(ItemPath.rsplit('/',1)[0]+'/'+file, re.sub("%\d\dd", frameNumber.zfill(repad), targetPath))
                    if fileResult is True:  
                        result = True
    return result
    
def exists(ItemPath):
    ItemPath = ItemPath.replace('\\','/')
    ItemFolder = ItemPath.rsplit('/',1)[0]
    if os.path.exists(ItemPath):
        return True
    elif os.path.exists(ItemFolder):
        for file in os.listdir(ItemFolder):
            if patternMatch(ItemPath, ItemFolder+'/'+file):
                return True
    else:
        return False
        
def move(src, dest):
    return shutil.move(src, dest)
        
def touchFile(path):
    #Takes: Str   as valid path
    #Creates empty file at path
    #Returns: True if successful, False if there was an error
    if os.access(path,os.F_OK):
        return True
    else:
        folder = path.rsplit('/',1)[0]
        if not os.access(folder,os.F_OK):
            touchFolder(folder)
        try:
            print('making empty file: '+path)
            with open(path, 'a'):
                os.utime(path, None)
            return touchFolder(path)
        except:
            print('Error Creating empty file: '+path)
            return False
            
def getShotFolders(showDirectory):
    #Takes: Str   as valid path
    #Creates empty file at path
    #Returns: List of shotFolders in directory in sc###/sh#### format
    shotNames = []
    for a in os.listdir(showDirectory+'/VFX'):
        if a[0] != '_' and os.path.isdir(showDirectory+'/VFX/'+a):
            for b in os.listdir(showDirectory+'/VFX/'+a):
                if os.path.isdir(showDirectory+'/VFX/'+a+'/'+b):
                    shotNames.append(a+'/'+b)
    return shotNames
    
def writeFile(filePath, fileText):
    #Takes: filePath as valid path, fileText as str
    #Performs: Writes text to specified file.
    #Returns:
    touchFile(filePath)
    fileHandle = open(filePath, 'w')
    fileHandle.write(fileText)
    fileHandle.close()

def isWriteable(filePath):
    #Takes: filePath as valid path, fileText as str
    #Performs: 
    #Returns: True if W_OK for closest existing folder, else False
    #TODO find replacement for os.W_OK, function does not return false when folders are read only
    filePath = filePath.replace('\\','/')
    folderList = filePath.split('/')
    testingPath = ''
    for a in folderList:
        testingPath += a+'/'
        if os.access(existingPath, os.F_OK):
            existingPath = testingPath
        else:
            break
    if os.access(existingPath,os.W_OK):
        return True
    else:
        return False
        
def popExtraneous(folders):
    for i in reversed(range(len(folders))):
        if 'quicktime' in folders[i].lower():
            folders.pop(i)
        elif folders[i].lower() in ['thumbs.db', '.ds_store', 'desktop.ini']:
            folders.pop(i)
    folders.sort()
    return folders
    
def listdir(folderPath):
    #Takes: folderPath as either a folderpath or sequence pattern
    #Performs: os.listdir
    #Returns: list of fully qualified paths for each matching file found, sans system files such as Thumbs.db
    folderPath = folderPath.replace('\\','/')
    if isPattern(folderPath):
        returnList = []
        for item in os.listdir(folderPath.rsplit('/',1)[0]):
            if patternMatch(folderPath, folderPath.rsplit('/',1)[0]+'/'+item):
                returnList.append(folderPath.rsplit('/',1)[0]+'/'+item)
        return returnList
    else:
        items = os.listdir(folderPath)
        items = popExtraneous(items)
        returnList = []
        for item in items:
            returnList.append(folderPath+'/'+item)
        return returnList

def getSequences(folderPath, frameDelimiter):
    #Takes:
    #Performs:
    #Returns:
    if isPattern(folderPath):
        return folderPath
    elif os.path.isfile(folderPath):
        return []
    itemList = listdir(folderPath)
    for i in reversed(range(len(itemList))):
        if os.path.isfile(itemList[i]) is False:
            itemList.pop(i)
    for i in range(len(itemList)):
        framePaddidng = str(len(itemList[i].rsplit('/',1)[1].rsplit('.',1)[0].rsplit(frameDelimiter,1)[1])).zfill(2)
        extension = itemList[i].rsplit('/',1)[1].rsplit('.',1)[1]
        name = itemList[i].rsplit('/',1)[1].rsplit('.',1)[0].rsplit(frameDelimiter,1)[0]
        itemList[i] = folderPath+'/'+name+frameDelimiter+'%'+framePaddidng+'d.'+extension
    
    itemList = list(set(itemList))
    return itemList
    
def getDifferenceList(stringA, stringB):
    #Takes: Two strings 
    #Performs: compares the two strings to see if there is a minor numerical difference between the two.
    #Returns: a list of sequential indexes that correspond to the padded numerical sequence number from each string, or an empty list if the differences did not meet those criteria
    
    if len(stringA) != len(stringB):
        return []

    #Create a list of indexes for any character differences
    returnList = []
    for i in range(len(stringA)):
        if stringA[i] != stringB[i]:
            if stringA[i].isdigit() and stringB[i].isdigit():
                returnList.append(i)
            else:
                return []
    
    #Get any digits that may have matched immediately before the first index
    returnList.sort()
    for i in reversed(range(len(stringA))[:returnList[0]]):
        if stringA[i].isdigit() and stringB[i].isdigit():
            returnList.append(i)
        elif stringA[i].isdigit() or stringB[i].isdigit():
            return []
        else:
            break
    
    #Get any digits that may have matched immediately after the last index
    returnList.sort()
    for i in range(len(stringA))[returnList[-1]+1:]:
        if stringA[i].isdigit() and stringB[i].isdigit():
            returnList.append(i)
        elif stringA[i].isdigit() or stringB[i].isdigit():
            return []
        else:
            break
    
    #Make sure index list is sequential, if not return []
    #returnList.sort()
    #for i in range(len(returnList)):
    #    if returnList[0]+i == returnList[i]:
    #        continue
    #    else:
    #        returnList = []
    #        break
    return returnList
    
def collapseList(itemList):
    #Takes: list of strs
    #Performs: replaces filesequences with a sequence pattern, while leaving single files alone
    #Returns: list of strs
    
    exceptionTypes = [
    'mov',
    'avi',
    'mpg',
    'mp4',
    'mkv',
    ]
    
    itemList = popExtraneous(itemList)
    itemList.sort(key = len)
    for a in range(len(itemList)):
        if a+1 > len(itemList):
            break
        SequencePattern = itemList[a]
        popList = []
        if itemList[a].rsplit('.',1)[-1] not in exceptionTypes:
            for b in range(len(itemList))[a+1:]:
                difList = getDifferenceList(itemList[a], itemList[b])
                if len(difList) != 0:
                    digitPattern = '%'+str(difList[-1]-difList[0]+1).zfill(2)+'d'
                    NewSequencePattern = itemList[a][:difList[0]]+digitPattern+itemList[a][difList[-1]+1:]
                    if SequencePattern == itemList[a]:
                        SequencePattern = NewSequencePattern
                    elif NewSequencePattern != SequencePattern:
                        break
                    popList.append(b)
                else:
                    break
        itemList[a] = SequencePattern
        for b in reversed(popList):
            itemList.pop(b)
    return itemList
    
def getSequenceRange(sequencePath):
    sequencePath = sequencePath.replace('\\','/')
    itemList = listdir(sequencePath.rsplit('/',1)[0])
    
    for i in reversed(range(len(itemList))):
        if patternMatch(sequencePath, itemList[i]) != True:
            itemList.pop(i)
    
    itemList.sort()
    startPattern = sequencePath.rsplit('%',1)[0]
    endPattern = sequencePath.rsplit('%',1)[1].split('d',1)[1]
    firstFrame = itemList[0][len(startPattern):-len(endPattern)]
    lastFrame = itemList[-1][len(startPattern):-len(endPattern)]
    return firstFrame, lastFrame
    
def isPattern(ItemPath):
    if exists(ItemPath):
        if os.path.isfile(ItemPath):
            return False
        elif os.path.isdir(ItemPath):
            return False
        else:
            return True
    return None
    
def patternMatch(pattern, string):
    if pattern == string:
        return True
    if re.search("%\d\dd", pattern) == None:
        if pattern != string:
            return False
    startPattern = pattern.rsplit('%',1)[0]
    patternDigits =  int(pattern.rsplit('%',1)[1].split('d',1)[0])
    endPattern = pattern.rsplit('%',1)[1].split('d',1)[1]
    
    if string[:len(startPattern)] != startPattern:
        return False
    if string[-len(endPattern):] != endPattern:
        return False
    if len(string[len(startPattern):-len(endPattern)]) != patternDigits:
        return False
    if string[len(startPattern):-len(endPattern)].isdigit() is not True:
        return False
    return True
    
def patternFill(pattern, frame):
    splitList = re.split("(#*)", pattern[::-1], maxsplit=1)[::-1]
    for a in range(len(splitList)):
        splitList[a] = splitList[a][::-1]
    if len(splitList) != 1:
        forePattern = splitList[0]
        frameDigits = len(splitList[1])
        aftPattern = splitList[2]
    else:
        forePattern = pattern.rsplit('%',1)[0]
        frameDigits = int(pattern.rsplit('%',1)[-1].split('d',1)[0])
        aftPattern = pattern.rsplit('%',1)[-1].split('d',1)[-1]
    
    frame = str(frame).zfill(frameDigits)
    return forePattern+frame+aftPattern
    