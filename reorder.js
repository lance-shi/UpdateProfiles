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

        profileNode.fieldPermissions.sort(compareFieldPermission);
        
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

function compareFieldPermission(a, b){
    if(a.field.toString().localeCompare(b.field) < 0) {
        return -1;
    } else if(a.field.toString().localeCompare(b.field) > 0) {
        return 1;
    } else {
        return 0;
    }
}
