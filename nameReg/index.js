const {Universal} = require('@aeternity/aepp-sdk');

const output = document.getElementById('output')
let registerBtn = document.getElementById( "registerBtn");
//let publicKey = document.getElementById('publicKey').value;
//let privateKey = document.getElementById('privateKey').value;
//let nameSpace = document.getElementById('nameSpace').value;

//function inputs() { 

//}

const main = async (name) => {
  let publicKey = document.getElementById('publicKey').value;
  let privateKey = document.getElementById('privateKey').value;
//  let nameSpace = document.getElementById('nameSpace').value;
  const client = await Universal({
    url: 'https://sdk-testnet.aepps.com', //replace with https://sdk-mainnet.aepps.com for mainnet
    internalUrl: 'https://sdk-testnet.aepps.com', //replace with https://sdk-mainnet.aepps.com for mainnet
    keypair: {
        publicKey: publicKey,
        secretKey: privateKey
    },
    networkId: 'ae_uat', //replace with ae_mainnet for mainnet
    nativeMode: true
  });

  const preclaim = await client.aensPreclaim(name);
  console.log(preclaim);
  output.innerText = preclaim;

  const claim = await client.aensClaim(name, preclaim.salt, preclaim.height);
  console.log(claim);
  output.innerText = claim;

  const update = await client.aensUpdate(claim.id, publicKey);
  console.log(update);
  output.innerText = update;
};

registerBtn.addEventListener('click', function(){
  let nameSpace = document.getElementById('nameSpace').value;
  main(nameSpace);
});