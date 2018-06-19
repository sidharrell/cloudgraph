// wrapper for the more generic charting script to handle our use case
var chart = require('./chart.js');
const fs = require('fs');

// for everything that is found in the 'output' folder, process it through the charting script
fs.readdir("./output", (err, folders) => {
  folders.forEach(folder => {
    var targetdir = "./graphs/"+folder;
    if (!fs.existsSync(targetdir)){
      fs.mkdirSync(targetdir);
    }
    var datadir = "./output/"+folder;
    fs.readdir(datadir, (err, files) => {
      files.forEach(file => {
          if (!file.endsWith("meta")) { 
            chart.CreateChart(datadir+"/"+file, targetdir+"/"+file+".svg", datadir+"/"+file+".meta");
            //console.log(file);
          }
      });
    });
  });
})
