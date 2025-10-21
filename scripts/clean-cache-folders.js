const fs = require('fs');
const path = require('path');

const deleteFolderRecursive = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const currentPath = path.join(folderPath, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        deleteFolderRecursive(currentPath);
      } else {
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
};

const pathsToClean = [
  path.resolve(process.cwd(), 'node_modules'),
  path.resolve(process.cwd(), 'bun.lockb'),
  path.resolve(process.cwd(), 'bun.lock'),
];

const directoriesToSearch = [
  path.resolve(process.cwd(), 'apps'),
  path.resolve(process.cwd(), 'packages'),
];

directoriesToSearch.forEach((baseDir) => {
  if (fs.existsSync(baseDir)) {
    fs.readdirSync(baseDir).forEach((subDir) => {
      const subDirPath = path.join(baseDir, subDir);

      if (!fs.lstatSync(subDirPath).isDirectory()) return;

      const pathsToDelete = [
        path.join(subDirPath, 'node_modules'),
        path.join(subDirPath, 'dist'),
        path.join(subDirPath, '.next'),
        path.join(subDirPath, '.turbo'),
      ];

      pathsToDelete.forEach((p) => {
        if (fs.existsSync(p)) {
          deleteFolderRecursive(p);
        }
      });

      fs.readdirSync(subDirPath).forEach((innerDir) => {
        const innerDirPath = path.join(subDirPath, innerDir);
        if (!fs.lstatSync(innerDirPath).isDirectory()) return;

        const innerDirNodeModules = path.join(innerDirPath, 'node_modules');
        const innerDirDir = path.join(innerDirPath, 'dir');
        const innerDirNext = path.join(innerDirPath, '.next');

        if (fs.existsSync(innerDirNodeModules)) {
          deleteFolderRecursive(innerDirNodeModules);
        }

        if (fs.existsSync(innerDirDir)) {
          deleteFolderRecursive(innerDirDir);
        }

        if (fs.existsSync(innerDirNext)) {
          deleteFolderRecursive(innerDirNext);
        }
      });
    });
  }
});

pathsToClean.forEach((p) => {
  if (fs.existsSync(p)) {
    if (fs.lstatSync(p).isDirectory()) {
      deleteFolderRecursive(p);
    } else {
      fs.unlinkSync(p);
    }
  }
});
