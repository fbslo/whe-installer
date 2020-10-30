const { exec } = require("child_process");
const os = require('os');
const readline = require("readline");
const fs = require('fs');

function isNodeInstalled(){
  return new Promise((resolve, reject) => {
    exec("node -v", (error, stdout, stderr) => {
        if (error) {
            resolve(error);
        }
        if (stderr) {
            resolve(stderr);
        }
        resolve(stdout)
    });
  })
}

function installNode(){
  return new Promise((resolve, reject) => {
    exec(`sudo apt update && sudo apt install nodejs && sudo apt install npm && sudo apt install git && npm install pm2@latest -g`, (error, stdout, stderr) => {
        if (error) {
            resolve(error);
        }
        if (stderr) {
            resolve(stderr);
        }
        resolve(stdout)
    });
  })
}

module.exports.isNodeInstalled = isNodeInstalled
module.exports.installNode = installNode
