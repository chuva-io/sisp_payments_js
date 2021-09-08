const fs = require('fs');

/**
 * DELETE SISP PAYMENT FORM
 * @param {String} fileDir - File path
 * @returns {Boolean} response - True for success
 */
const deleteSispPaymentFile = (fileDir) => {
  /* check if the dir exists */
  fs.existsSync(fileDir, (err) => {
    if (err) {
      console.error(err);
      throw err;
    }

    /* Delete the file */
    fs.unlink(fileDir, (error) => {
      if (error) {
        console.error(error);
        throw error;
      }
      return true;
    });
  });
};

/**
 * CREATE SISP PAYMENT FORM
 * @param {String} baseDir - Path to store file "fileName"
 * @param {String} fileName - File to store in a directory baseDir
 * @param {Document} content - Content to store inside the fileName
 * @returns {Boolean} response - True for success
 */
const createSispPaymentFile = async (baseDir, fileName, content) => {
  try {
    // check if directory exists
    if (!fs.existsSync(baseDir)) {
      // recursively create multiple directories
      await fs.promises.mkdir(baseDir, { recursive: true }, (err) => {
        if (err) {
          console.error('Error to create directory', baseDir);
          throw err;
        }
      });
    }
  }
  catch (error) {
    console.error('there was an error:', error.message);
  }

  // open the file and write the content
  await fs.open(`${baseDir}${fileName}`, 'wx', (err, desc) => {
    if (!err && desc) {
      fs.writeFile(desc, content, (error) => {
        if (error) {
          console.error(error);
          throw error;
        }
        return true;
      });
    }
  });
};

module.exports = {
  deleteSispPaymentFile,
  createSispPaymentFile
};
