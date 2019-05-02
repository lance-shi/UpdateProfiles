const fs = require('fs');
const parseString = require('xml2js').parseString;
const xml2js = require('xml2js');

let rawConfigData = fs.readFileSync('config.json');
let configObj = JSON.parse(rawConfigData);
let profilePath = configObj.targetDirectory;
let possibleProfiles = configObj.possibleProfiles;

for(let currentProfile of possibleProfiles) 
{
    let fileName = profilePath + '/' + currentProfile + '.profile-meta.xml';
    let data = fs.readFileSync(fileName);
    console.log('profile name is: ' + currentProfile);

    parseString(data, function(err, result) {
        if(err) console.log(err);
        
        console.log("result is: " + result);
        let json = result;
        let profileNode = json.Profile;

        for(let curChange of configObj.profileChanges) 
        {
            if(curChange.profiles.includes(currentProfile)) 
            {
                let newNode = {};
                if(curChange.metadataType === "classAccesses")
                {
                    if(curChange.operation === "add") 
                    {
                        newNode.apexClass = curChange.metadataName;
                        newNode.enabled = curChange.enabled;
                        let nodeInserted = false;

                        for(let i = 0; i < profileNode.classAccesses.length; i++) 
                        {
                            if(newNode.apexClass.localeCompare(profileNode.classAccesses[i].apexClass) < 0)
                            {
                                profileNode.classAccesses.splice(i, 0, newNode);
                                nodeInserted = true;
                                break;
                            }
                        }

                        if(!nodeInserted)
                        {
                            profileNode.classAccesses.append(newNode);
                        }
                    }
                    else if(curChange.operation === "remove") 
                    {
                        let removeNode = {};
                        removeNode.apexClass = curChange.metadataName;
                        for(let i = 0; i < profileNode.classAccesses.length; i++) 
                        {
                            if(removeNode.apexClass == profileNode.classAccesses[i].apexClass)
                            {
                                profileNode.classAccesses.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
                else if(curChange.metadataType === "fieldPermissions")
                {
                    if(curChange.operation === "add") {
                        newNode.editable = curChange.editable;
                        newNode.field = curChange.metadataName;
                        newNode.readable = curChange.readable;
                        let nodeInserted = false;

                        for(let i = 0; i < profileNode.fieldPermissions.length; i++) 
                        {
                            if(newNode.field.localeCompare(profileNode.fieldPermissions[i].field) < 0)
                            {
                                profileNode.fieldPermissions.splice(i, 0, newNode);
                                nodeInserted = true;
                                break;
                            }
                        }

                        if(!nodeInserted)
                        {
                            profileNode.fieldPermissions.append(newNode);
                        }
                    }
                    else if(curChange.operation === "remove") {
                        let removeNode = {};
                        removeNode.field = curChange.metadataName;
                        for(let i = 0; i < profileNode.fieldPermissions.length; i++) 
                        {
                            if(removeNode.field == profileNode.fieldPermissions[i].field)
                            {
                                profileNode.fieldPermissions.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
                else if(curChange.metadataType === "objectPermissions")
                {
                    newNode.allowCreate = curChange.allowCreate;
                    newNode.allowDelete = curChange.allowDelete;
                    newNode.allowEdit = curChange.allowEdit;
                    newNode.allowRead = curChange.allowRead;
                    newNode.modifyAllRecords = curChange.modifyAllRecords;
                    newNode["object"] = curChange.metadataName;
                    newNode.viewAllRecords = curChange.viewAllRecords;
                    let nodeInserted = false;

                    for(let i = 0; i < profileNode.objectPermissions.length; i++) 
                    {
                        if(newNode["object"].localeCompare(profileNode.objectPermissions[i]["object"]) < 0)
                        {
                            profileNode.objectPermissions.splice(i, 0, newNode);
                            nodeInserted = true;
                            break;
                        }
                    }

                    if(!nodeInserted)
                    {
                        profileNode.objectPermissions.append(newNode);
                    }
                }
            }
        }
        
        // create a new builder object and then convert
        // our json back to xml.
        var builder = new xml2js.Builder({ 
            "renderOpts" : { 'pretty': true, 'indent': '    ', 'newline': '\n' },
            "xmldec" : { 'version': '1.0', 'encoding': 'UTF-8'}
        });
        var xml = builder.buildObject(json);
        
        fs.writeFile(fileName, xml, function(err, data){
            if (err) console.log(err);
            
            console.log("successfully written our update xml to file");
        })
                  
    }); 
}
   