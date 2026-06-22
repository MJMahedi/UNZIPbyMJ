
// ---------------- EXTRACT ----------------
const { spawn } = require('child_process');

function extractArchive(filePath, outputPath, progressCb) {
  return new Promise((resolve, reject) => {

    const p = spawn('7zz', [
      'x',
      filePath,
      `-o${outputPath}`,
      '-y'
    ]);

    let lastPercent = 0;
    let errorText = '';

    p.stdout.setEncoding('utf8');
    p.stderr.setEncoding('utf8');

    // ✅ REAL TIME PARSING
    p.stdout.on('data', (data) => {
      const text = data.toString();

      // 🔥 match percentage from output
      const match = text.match(/(\d+)%/);

      if (match) {
        const percent = parseInt(match[1]);

        if (percent > lastPercent) {
          lastPercent = percent;
          progressCb?.(percent, `Extracting... ${percent}%`);
        }
      } else {
        progressCb?.(lastPercent, 'Processing...');
      }
    });

    p.stderr.on('data', (data) => {
      errorText += data.toString();
    });

    p.on('error', (err) => {
      reject(err);
    });

    p.on('close', (code) => {
      if (code === 0) {
        progressCb?.(100, "Done");
        resolve(true);
      } else {
        reject(new Error(errorText || "Extraction failed"));
      }
    });

  });
}



// ---------------- CREATE ARCHIVE ----------------
function createArchive(outputFile, inputPath, progressCb) {
  return new Promise((resolve, reject) => {

    const p = spawn('7zz', [
      'a',
      outputFile,
      inputPath
    ]);

    let err = '';

    p.stdout.on('data', () => {
      progressCb?.(50, "Compressing...");
    });

    p.stderr.on('data', d => err += d.toString());

    p.on('close', code => {
      if (code === 0) resolve(true);
      else reject(new Error(err || "Create failed"));
    });

  });
}

module.exports = {
  extractArchive,
  createArchive
};