const fs = require('fs');
const parseString = require('xml2js').parseString;
const xml2js = require('xml2js');

let rawConfigData = fs.readFileSync('removeConfig.json');
let configObj = JSON.parse(rawConfigData);
let devPath = configObj.targetDirectory;

let profilePath = devPath + "/profiles";
let permissionPath = devPath + "/permissionsets";
let reportPath = devPath + "/reportTypes";

fs.readdir(profilePath, function(err, files) {
	files.forEach(function(file) {
		console.log(file);
		let fileName = profilePath + "/" + file;
		let data = fs.readFileSync(fileName);

		parseString(data, function(err, result) {
			if(err) console.log(err);
			let json = result;
			let profileNode = json.Profile;

			for(let curField of configObj.removeFields) {
				if(profileNode.fieldPermissions) {
					for(let i = 0; i < profileNode.fieldPermissions.length; i++) {
	                    if(curField == profileNode.fieldPermissions[i].field) {
	                        profileNode.fieldPermissions.splice(i, 1);
	                        break;
	                    }
	                }
				}
				
			}

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
	});
});

fs.readdir(permissionPath, function(err, files) {
	files.forEach(function(file) {
		console.log(file);
		let fileName = permissionPath + "/" + file;
		let data = fs.readFileSync(fileName);

		parseString(data, function(err, result) {
			if(err) console.log(err);
			let json = result;
			let profileNode = json.PermissionSet;

			for(let curField of configObj.removeFields) {
				if(profileNode.fieldPermissions) {
					for(let i = 0; i < profileNode.fieldPermissions.length; i++) {
	                    if(curField == profileNode.fieldPermissions[i].field) {
	                        profileNode.fieldPermissions.splice(i, 1);
	                        break;
	                    }
	                }
				}
				
			}

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
	});
});