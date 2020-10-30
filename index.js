const { exec } = require("child_process");
const os = require('os');
const readline = require("readline");
const fs = require('fs');

const BACKEND_REPO_NAME = 'https://github.com/fbslo/whe-backend'
const FRONTEND_REPO_NAME = 'https://github.com/fbslo/whe-frontend'

const installDependencies = require("./installDependencies.js")
const deployToken = require("./deployToken.js")

main()

async function main(){
  console.log("-".repeat(process.stdout.columns))
  console.log(`Wrapped Hive Engine Tokens\nInstaller 1.0\nCopyright: @fbslo, 2020`)
  console.log("-".repeat(process.stdout.columns))
  askDisclaimer()
    .then((result) => {
      if (process.argv[2] == 'install') install()
      if (process.argv[2] == 'start') start()
      if (process.argv[2] == 'logs') logs()
      if (process.argv[2] == 'deploy_token') deployToken.deploy_token()
      else console.log(`Please provide valid command [install/deploy_token/start/logs]`); process.exit(0);
    })
}

function askDisclaimer(){
  return new Promise((resolve, reject) => {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("Do you accept [Y/N]? ", function(disclaimer) {
      if (disclaimer.toLowerCase() != 'y') process.exit(0);
      resolve();
    })
  })
}

function install(){
  storeInstallInfo(0)
  if (os.type() != 'Linux') console.log(`[!] Your operating system is ${os.type()}. It is recommended to use Ubuntu 18.04.`)
  installDependencies.isNodeInstalled()
    .then((result) => {
      if (result.includes("is not recognized") || result.includes("not found") || result.includes("not installed")) return installDependencies.installNode()
    })
    .then(async (result) => {
      let node = await installDependencies.isNodeInstalled()
      if (node.includes("is not recognized") || node.includes("not found") || node.includes("not installed")) console.log(`Something went wrong installing NodeJS.`)
      else askAboutInstallation()
    })
}

function askAboutInstallation(){
  let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });
  console.log(`Please select more details about intallation.`)
  console.log(`[1] - Backend\n[2] - Frontend\n[3] - Frontend & Backend`)
  rl.question("What would you like to install? ", function(name) {
      switch (name){
        case '1':
          installBackend()
          storeInstallInfo(1)
          break;
        case '2':
          installFrontend()
          storeInstallInfo(2)
          break;
        case '3':
          installBoth()
          storeInstallInfo(3)
          break;
        default:
          console.log(`Please select valid option!`)
          askAboutInstallation()
          break;
      }
  });

  rl.on("close", function() {
      console.log("\nBYE BYE !!!");
      process.exit(0);
  });
}

function installBackend(){
  exec(`git clone ${BACKEND_REPO_NAME} && cd ${BACKEND_REPO_NAME.split('/').slice(-1)[0]} && npm install && mv .env.demo .env` , (error, stdout, stderr) => {
      if (error) {
          console.log(error)
      }
      if (stderr) {
          console.log(stderr)
      }
      console.log(`Backend installed. Please modify config (.env) file and start the app using: node index.js start`)
      process.exit(0);
  });
}

function installFrontend(){
  exec(`git clone ${FRONTEND_REPO_NAME} && cd ${FRONTEND_REPO_NAME.split('/').slice(-1)[0]} && npm install && mv .env.demo .env` , (error, stdout, stderr) => {
      if (error) {
          console.log(error)
      }
      if (stderr) {
          console.log(stderr)
      }
      console.log(`Frontend installed. Please modify config (.env) file and start the app using: node index.js start`)
      process.exit(0);
  });
}

function installBoth(){
  exec(`git clone ${FRONTEND_REPO_NAME} && cd ${FRONTEND_REPO_NAME.split('/').slice(-1)[0]} && npm install && mv .env.demo .env && cd .. &&
        git clone ${BACKEND_REPO_NAME} && cd ${BACKEND_REPO_NAME.split('/').slice(-1)[0]} && npm install && mv .env.demo .env  ` , (error, stdout, stderr) => {
      if (error) {
          console.log(error)
      }
      if (stderr) {
          console.log(stderr)
      }
      console.log(`Frontend & Backend installed. Please modify config (.env) in both directories and start the app using: node index.js start`)
      process.exit(0);
  });
}

function storeInstallInfo(install_info){
  let info = {
    selection: install_info
  }
  //empty first
  fs.writeFile('install_details.json', '', function (err) {
    if (err) return console.log(err);
  });
  fs.writeFile('install_details.json', JSON.stringify(info), function (err) {
    if (err) return console.log(err);
  });
}

function start(){
  fs.readFile('install_details.json', (err, result) => {
    if (err) console.log(err);
    result = JSON.parse(result);
    if (result.selection == 1) { //backend
      exec(`sudo pm2 start ${BACKEND_REPO_NAME.split('/').slice(-1)[0]}/index.js --name backend`, (error, stdout, stderr) => { console.log(error, stdout, stderr) })
    } else if (result.selection == 2){ //frontend
      exec(`sudo pm2 start ${FRONTEND_REPO_NAME.split('/').slice(-1)[0]}/index.js --name frontend`, (error, stdout, stderr) => { console.log(error, stdout, stderr) })
    } else if (result.selection == 3){ //both
      exec(`sudo pm2 start ${BACKEND_REPO_NAME.split('/').slice(-1)[0]}/index.js --name backend &&
            sudo pm2 start ${FRONTEND_REPO_NAME.split('/').slice(-1)[0]}/index.js --name frontend`, (error, stdout, stderr) => { console.log(error, stdout, stderr) })
    } else {
      console.log(`Please install app first: node index.js install`)
    }
  });
}

function logs(){
  fs.readFile('install_details.json', (err, result) => {
    try {
      if (err) console.log(err);
      result = JSON.parse(result);
      if (result.selection == 1) { //backend
        exec(`sudo pm2 logs backend`, (error, stdout, stderr) => { console.log(error, stdout, stderr) })
      } else if (result.selection == 2){ //frontend
        exec(`sudo pm2 logs frontend`, (error, stdout, stderr) => { console.log(error, stdout, stderr) })
      } else if (result.selection == 3){ //both
        exec(`sudo pm2 logs`, (error, stdout, stderr) => { console.log(error, stdout, stderr) })
      } else {
        console.log(`Please install app first: node index.js install`)
      }
    } catch (e) {
      if (e.message == 'Unexpected end of JSON input') console.log(`Please install app first: node index.js install`)
    }
  });
}
