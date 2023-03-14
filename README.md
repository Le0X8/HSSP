# HSSP

Parse and edit HSSP files.

More about the HSSP format: [Official GitHub](https://github.com/Le0X8/HSSP)

---
## Usage

```js
const Hssp = require('hssp'); 
const fs = require('fs');

const editor = new Hssp(); // Create a new editor

editor.importFromHSSP(fs.readFileSync('./path/to.hssp')); // Import data from a HSSP file
editor.importFromHSSP(fs.readFileSync('./path/to/password-secured.hssp'), 'Pass1234'); // Import data from a HSSP file with a password

editor.removeFile(editor.fileList.length - 2); // Delete the last file from the HSSP file list
editor.addFile('main.html', fs.readFileSync('./path/to/main.html'), true); // Add a file to the package, but as the "Main" or "Index" file. It's the most important file of the package.
editor.addFile('image.png', fs.readFileSync('./path/to/image.png')); // Add a file to the package

editor.setPassword('MySecretPassword'); // Set a password

fs.writeFileSync('./path/to/new.hssp', editor.toBuffer()); // Get binary data from the editor and save to file
```
