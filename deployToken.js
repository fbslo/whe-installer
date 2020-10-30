const { exec } = require("child_process");
const os = require('os');
const readline = require("readline");
const fs = require('fs');
const solc = require('solc');

function deploy_token(){
  let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });
  console.log(`You are about to deploy token on Ethereum mainnet. Be careful, it will cost you transaction fees.`)
  let selection = {}
  rl.question("Enter your token name: ", function(name) {
    selection["name"] = name
    rl.question("Enter your token symbol: ", function(symbol) {
      selection["symbol"] = symbol
      rl.question("Enter your token decimal places (0-18): ", function(decimals) {
        selection["decimals"] = Number(decimals)
        console.log(`Your choices: ${JSON.stringify(selection)}`)
        rl.question("Confirm Y/N: ", function(confirm) {
          if (confirm.toLowerCase() == "y") verifyChoices(selection)
          else console.log(`Abort!`); process.exit(0);
        })
      })
    })
  });
}

function verifyChoices(selection){
  if (typeof selection.decimals != 'number' ||
      selection.decimals > 18 ||
      selection.decimals < 0
      ){
        console.log(`Please enter valid precison (0 to 18)`)
        deploy_token()
      }
  if (typeof selection.name != 'string'){
    console.log(`Please enter valid name`)
    deploy_token()
  }
  if (typeof selection.symbol != 'string'){
    console.log(`Please enter valid name`)
    deploy_token()
  } else {
    deploy_token_to_network(selection)
  }
}

function deploy_token_to_network(selection){
  let tokenConfig = `\ncontract wToken is WrappedToken, ERC20Detailed("${selection.name}", "${selection.symbol}", ${selection.decimals}) {}`
  exec("git clone https://github.com/fbslo/wToken-contract && cd wToken-contract && npm install", (error, stdout, stderr) => {
      if (error) {
          console.log(error);
      }
      if (stderr) {
          console.log(stderr);
      }
      console.log(stdout)
      //editTokenConfig(tokenConfig)
  });
}

function editTokenConfig(config){
  let tokenFile = `pragma solidity ^0.5.1;\n\nimport "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";\nimport "./WrappedToken.sol";\n`
  //emty first to prepare for fresh install, we are in wToken-contract directory
  fs.writeFileSync('contract/wToken.sol', '', function (err) {
    if (err) console.log("err", err);
  });
  //write new code
  fs.writeFileSync('contract/wToken.sol', tokenFile+config, function (err) {
    if (err) console.log("err", err);
    console.log(`Token details successfully written...`)
    flatten()
  });
}

function flatten(){
  exec("npm install truffle-flattener -g && truffle-flattener contracts/wToken.sol --output flat/wToken.sol", (error, stdout, stderr) => {
      if (error) {
          console.log(error);
      }
      if (stderr) {
          console.log(stderr);
      }
      console.log(`Source code flattened...`)
  });
}

function comile(){
  const input = {
  	language: 'Solidity',
  	sources: {
      "wToken.sol": {
        content: fs.readFileSync('./wHE-token/flat/wToken.sol', 'utf8')
      }
    },
  	settings: {
  		outputSelection: {
  			'*': {
  				'*': [ 'abi', 'evm.bytecode' ]
  			}
  		}
  	}
  }
  const compiledContracts = JSON.parse(solc.compile(JSON.stringify(input))).contracts;
  console.log(compiledContracts)
}

deploy_token()


module.exports.deploy_token = deploy_token
