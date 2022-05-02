const fs = require('fs');
const path = require('path');

// Do not include /public in url
const publicPath = '../public';

// Declare mime types
// todo: add more
const mimeTypes = {
  '.jpg': 'image/jpg',
  '.css': 'text/css',
  '.html': 'text/html',
  '.mp4': 'video/mp4',
  '.js' : 'text/javascript',
  '.json' : 'application/json',
  '.png' : 'image/png'
}

const StaticController = (req, res) => {
  try {
    const { url } = req;

    // Add `public` to the url path
    const filePath = path.resolve(__dirname, `${publicPath}${url}`);

    // Get file extension from our file path
    const extension = path.extname(filePath)

    // Get the mime type from our mapping
    const contentType = mimeTypes[extension] || undefined

    // If file exists read the file
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath);

      res.writeHead(200, {
        'content-type': contentType,
      });

      res.end(fileContent);
    } else {
      res.writeHead(404, {
        'content-type': 'text/plain'
      });

      res.write(`Page Not Found ${req.url}`);
      res.end();
    }
  } catch (err) {
    // else page not found
    res.writeHead(404, {
      'content-type': 'text/plain',
    });
    res.end(`${err}`);
  }
}



module.exports = {
  StaticController
}
