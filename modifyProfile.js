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
                else if(curChange.metadataType === "fieldPermissions")
                {
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
   