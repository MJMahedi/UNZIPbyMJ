const { exec } = require('child_process');
const path = require('path');

function extractArchive(filePath, outputPath) {
  return new Promise((resolve, reject) => {

    const cmd = `7z x "${filePath}" -o"${outputPath}" -y`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        return reject(stderr || err.message);
      }
      resolve({ success: true });
    });
  });
}

module.exports = { extractArchive };