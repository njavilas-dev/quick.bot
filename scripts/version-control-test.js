const fs = require('fs')
const path = require('path')

function copyFiles(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true })
  }

  const files = fs.readdirSync(source)

  files.forEach((file) => {
    const srcFile = path.join(source, file)
    const destFile = path.join(destination, file)

    if (fs.lstatSync(srcFile).isDirectory()) {
      copyFiles(srcFile, destFile)
    } else {
      fs.copyFileSync(srcFile, destFile)
    }
  })
}

function backupFolder(sourceDir, targetDir) {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  const dateString = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`
  const backupDir = path.join(targetDir, dateString)

  copyFiles(sourceDir, backupDir)
  console.log(`Backup completed in: ${backupDir}`)
}

const sourceDirectory = `${process.cwd()}/../../tests`
const targetDirectory = `${process.cwd()}/../../logs/tests`

backupFolder(sourceDirectory, targetDirectory)
