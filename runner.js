var chart = require('./chart.js');
const fs = require('fs');

fs.readdir("./output", (err, folders) => {
  folders.forEach(folder => {
    var targetdir = "./graphs/"+folder;
    if (!fs.existsSync(targetdir)){
      fs.mkdirSync(targetdir);
    }
    var datadir = "./output/"+folder;
    fs.readdir(datadir, (err, files) => {
      files.forEach(file => {
        chart.CreateChart(datadir+"/"+file, targetdir+"/"+file+".svg", file);
        console.log(file);
      });
    });
  });
})
