import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { Web3Storage, File} from 'web3.storage';
import LitJsSdk from '@lit-protocol/lit-node-client';
import { v4 } from "uuid";
import * as PushAPI from "@pushprotocol/restapi";
import { ethers } from 'ethers'
// Initialize the Lit client
const litNodeClient =new LitJsSdk.LitNodeClient({
    litNetwork: 'cayenne',
  });
const signer = ethers.Wallet.createRandom();
// Function to create the Web3.storage client
function makeStorageClient() {
  return new Web3Storage({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDc0QTVkZGY1NDBEN0ZGRTQxY0I1Y2ZhNWNGNzk1NkQ4ZDhiOTUxRWEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2OTAyMTc0ODg5NDUsIm5hbWUiOiJmaGlyZmx5In0.BVDQuzdmQLQjGyE3yoMwP4eZ3VbDaZQZPoQHEFz-1ws' }); // replace with your actual token
}
// Function to connect to the LIT network
const connectToLit = async () => {
  try {
    await litNodeClient.connect();
    console.log('Connected to Lit protocol');
    console.log("NETWORK PUB KEY:", litNodeClient.networkPubKey);
  } catch (error) {
    console.error('Failed to connect to Lit protocol:', error);
  }
};
// This is the authsig for 0x75341449Dd0e8D696Ca09eD4996a637D2cF1EC57 - We need to change it.
function obtainAuthSig(){
    return {
        sig : "0xf0fa357988b08853938bca2f05876ba34b7c61f1205312cb91b5eae2562dfc78504214de2845241bddad868d2d42f006e3c355e8e5ae16df9df0e1838aa2288f1b",
        derivedVia : "web3.eth.personal.sign",
        address: "0x75341449dd0e8d696ca09ed4996a637d2cf1ec57"
        } 
}
// Function to download from upload to IPFS and decrypt the file using LIT Protocol and 
const DownloadandDecryptFile = async (url, dataToEncryptHash) => {
  try {  
    // Start the connection to the LIT network
    await connectToLit();
    const authSig = await obtainAuthSig();
    if (!authSig) {
      throw new Error('AuthSig is required for decryption');
    }
    // Specify your access control conditions here
    const accessControlConditions = [
        {
          contractAddress: "",
          standardContractType: "",
          chain: "ethereum",
          method: "eth_getBalance",
          parameters: [":userAddress", "latest"],
          returnValueTest: {
            comparator: ">=",
            value: "1000000000000", // 0.000001 ETH
          },
        },
      ];

    // Download file from IPFS
    console.log('create ipfs client');
    const ipfsClient = makeStorageClient();
    console.log('get IPFS file' + files)
    const file = await ipfsClient.fetch(url);
    console.log("fetched file", file); 
    
    const chainIdString = "ethereum" 
    const decryptBlob = await LitJsSdk.decryptToFile( {
        accessControlConditions: accessControlConditions,
        file: file,
        dataToEncryptHash: hash,
        authSig: authSig,
        chain: 'ethereum',

        
    },
    litNodeClient,
        );

    console.log('File decrypted with Lit protocol');
    const outputPath = path.join(__dirname, 'out', decryptBlob.fileName);

    // Write the decrypted file to the 'out' directory
    fs.writeFile(outputPath, decryptBlob.file, (err) => {
      if (err) {
        console.error('Failed to write decrypted file:', err);
      } else {
        console.log(`Decrypted file has been saved in 'out' directory with name: ${decryptBlob.fileName}`);
      }
    });

    
  }
  catch (error) {
        console.error('Failed to encrypt or store file:', error);
  }
}
// Function to fetch and process notifications
const fetchAndProcessNotifications = async () => {
    try {
      // Initialize PushAPI if it's not already
      // Note: It might be better to do this once outside of this function, depending on your needs
      const userAddress = await signer.getAddress()
      console.log ("polling for message for address: " + userAddress)
      const userSender = await PushAPI.PushAPI.initialize(signer, { env: 'staging' });
  
      // Fetch notifications
      const inboxNotifications = await userSender.notification.list('INBOX');
  
      // Process notifications
      for (const notification of inboxNotifications) {
        console.log("incoming message")
        // Assuming the subject contains the hash and the body contains the IPFS bafyhash
        const { subject: hash, body: bafyhash } = notification;
        console.log("hash: " + hash)
        console.log("bafyHash: " + bafyhash)
        // Now you can call your function to download, decrypt, etc.
        await DownloadandDecryptFile(bafyhash, hash); // Make sure this function is properly defined and imported
      }
    } catch (error) {
      console.error('Error fetching or processing notifications:', error);
    }
};  
// Main function to start the process
const main = async () => {
    try {
      // You might want to perform some initial setup here
  
      // Start the loop
      const loop = async () => {
        await fetchAndProcessNotifications();
        // Call this function again after 3 seconds
        setTimeout(loop, 3000);
      };
  
      loop(); // This starts the loop
    } catch (error) {
      console.error('Error in main function:', error);
    }
};  
// Start the script
main();
