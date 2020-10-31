const { exec } = require("child_process");
const os = require('os');
const readline = require("readline");
const fs = require('fs');
const solc = require('solc');
const readFilePromise = require('fs-readfile-promise');
require('dotenv').config()

function deploy_token(){
  let selection = {
    name: process.env.TOKEN_NAME,
    symbol: process.env.TOKEN_SYMBOL,
    decimals: process.env.TOKEN_PRECISION
  }
  verifyConfig(selection)
}

function verifyConfig(selection){
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
  editTokenConfig(tokenConfig)
}

async function editTokenConfig(config){
  try {
    //emty first to prepare for fresh install, we are in wToken-contract directory
    // let buffer = await readFilePromise('contracts/wToken.sol')
    // console.log(buffer.toString())
    // //write new code
    // let writeFile = await fs.writeFileSync('contracts/wToken.sol', result+config)
    console.log(`Token details successfully written...`)
    flatten()
  } catch (e) {
    console.log(e)
  }
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

module.exports.deploy_token = deploy_token
