const router = require("express").Router();
const { readdirSync } = require('fs-extra');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
var listmodule = [];
try {
    var i, j;
    let srcPath = path.join(__dirname, "/module/");
    const hosting = readdirSync(srcPath).filter((file) => file.endsWith(".js"));
    for (i of hosting) {
        var { index, name } = require(srcPath + i);
        router.get(name, index);
	    logger.load(i);
        listmodule.push(i.replace(".js", ""));
    }

    const getDirs = readdirSync(srcPath).filter((file) => !file.endsWith(".js") && !file.endsWith(".json"));
    for (var dir of getDirs) {
        fileName = readdirSync(path.join(__dirname, '/module/' + dir + '/')).filter((file) => file.endsWith(".js"));
        for (j of fileName) {
            var { index, name } = require(path.join(__dirname, '/module/' + dir + '/') + j);
            router.get(name, index);
		logger.load(j);
        listmodule.push(j.replace(".js", ""));
        }
    }
} catch (e) { console.log(e); }
const jsonData = JSON.stringify(listmodule);
fs.writeFile('module-list.json', jsonData, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
});


module.exports = router;