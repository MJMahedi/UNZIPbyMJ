const { spawn } = require('child_process');

function extractArchive(filePath, outputPath) {
  return new Promise((resolve, reject) => {

    const p = spawn('7zz', [
      'x',
      filePath,
      `-o${outputPath}`,
      '-y'
    ]);

    let err = '';

    p.stderr.on('data', d => err += d.toString());

    p.on('close', code => {
      if (code === 0) resolve(true);
      else reject(new Error(err));
    });

  });
}

function createArchive(outputFile, inputPath) {
  return new Promise((resolve, reject) => {

    const p = spawn('7zz', [
      'a',
      outputFile,
      inputPath
    ]);

    let err = '';

    p.stderr.on('data', d => err += d.toString());

    p.on('close', code => {
      if (code === 0) resolve(true);
      else reject(new Error(err));
    });

  });
}

module.exports = {
  extractArchive,
  createArchive
};