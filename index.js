const express = require('express');
const app = express();
const port = 3000;

const solanaWeb3 = require('@solana/web3.js');
const maticWeb3 = require('maticjs').web3;


const solanaPvtKey = "";
const maticPvtKey = "";
// Import the Solana and Matic libraries
const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { MaticPOSClient } = require('@maticnetwork/maticjs');

// Define a simple endpoint that returns a greeting message
app.get('/hello', (req, res) => {
  res.send('Hello, world!');
});


function isSolanaAddress(address) {
    try {
      new solanaWeb3.PublicKey(address);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  function isMaticAddress(address) {
    return maticWeb3.utils.isAddress(address);
  }
  

// Define an endpoint that accepts a query parameter and returns a custom message
app.get('/greet', (req, res) => {
  const name = req.query.name || 'World';
  res.send(`Hello, ${name}!`);
});

// Define an endpoint for transferring Solana
app.post('/transferSolana', async (req, res) => {
  try {
    const { fromAddress, toAddress, amount } = req.body;

    // Connect to the Solana network
    const connection = new Connection('https://api.mainnet-beta.solana.com');

    // Get the public key for the sender's Solana address
    const fromPublicKey = new PublicKey(fromAddress);

    // Get the private key for the sender's Solana address
    const fromPrivateKey = Buffer.from(req.headers.privatekey, 'hex');

    // Get the public key for the recipient's Solana address
    const toPublicKey = new PublicKey(toAddress);

    // Create a new transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: toPublicKey,
        lamports: amount,
      })
    );

    // Sign the transaction using the sender's private key
    const signature = await connection.sendTransaction(transaction, [Keypair.fromSecretKey(fromPrivateKey)]);

    res.send(`Transaction successful! Signature: ${signature}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error transferring Solana');
  }
});

// Define an endpoint for transferring Matic
app.post('/transferMatic', async (req, res) => {
  try {
    const { fromAddress, toAddress, amount } = req.body;

    // Connect to the Matic network
    const maticPOSClient = new MaticPOSClient({
      network: 'mainnet',
      version: 'v1',
      parentProvider: new Web3.providers.HttpProvider('https://rpc-mainnet.matic.network'),
      maticProvider: new Web3.providers.HttpProvider('https://rpc-mumbai.matic.today'),
    });

    // Get the private key for the sender's Matic address
    const fromPrivateKey = req.headers.privatekey;

    // Transfer Matic
    const tx = await maticPOSClient.transferERC20Tokens(fromAddress, toAddress, amount, {
      from: fromPrivateKey,
    });

    res.send(`Transaction successful! Hash: ${tx.transactionHash}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error transferring Matic');
  }
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


module.exports = {
    isSolanaAddress,
    isMaticAddress,
    transferSolana,
    transferMatic
  };