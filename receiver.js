import chokidar from 'chokidar';
import fs from 'fs';
import { Web3Storage, File} from 'web3.storage';
import LitJsSdk from '@lit-protocol/lit-node-client';
import { v4 } from "uuid";
import * as PushAPI from "@pushprotocol/restapi";
import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers'
import https from 'https';
import path from 'path'

// Initialize the Lit client
const litNodeClient =new LitJsSdk.LitNodeClient({
    litNetwork: 'cayenne',
  });
const signer = new ethers.Wallet('0dd54109a9cf2631c649cd5a3ba42c887f8c69eeb7bbaacb742ca68a8bd41573');

// Create the client with a `Signer` from your application
const xmtp = await Client.create(signer, {env: 'production'})

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
// This is the authsig for 0x75341449Dd0e8D696Ca09eD4996a637D2cF1EC57 - We need to change it.
function obtainAuthSig(){
  return {
    address: "0x34df838f26565ebf832b7d7c1094d081679e8fe1",
    derivedVia: "web3.eth.personal.sign",
    sig: "0x7b3a647ba936dd8e28fadcc73f1042f826a3bb3842c7ae84d98e4a928b56946320421d19d827831f747be12f47b0de43465a6acba2465332161a4849703889f01c",
    signedMessage: "localhost:3000 wants you to sign in with your Ethereum account:\n0x34df838F26565EbF832B7d7c1094D081679E8fe1\n\n\nURI: http://localhost:3000/\nVersion: 1\nChain ID: 1\nNonce: r4EmH7FP7oYGtsOSq\nIssued At: 2023-10-21T02:47:27.194Z\nExpiration Time: 2023-10-28T02:47:21.873Z",
  } 
}
    // Start the connection to the LIT network
    await connectToLit();
    const authSig = await obtainAuthSig();
    if (!authSig) {
      throw new Error('AuthSig is required for decryption');
    }
function httpsRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (resp) => {
      let data = '';

      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received.
      resp.on('end', () => {
        resolve(data);
      });

    }).on("error", (err) => {
      reject(err);
    });
  });
}

// Usage
// Function to download from upload to IPFS and decrypt the file using LIT Protocol and 
const DownloadandDecryptFile = async (url, hash) => {
  try {  

    // Specify your access control conditions here
    const accessControlConditions = [{
      chain: "ethereum",
      conditionType: "evmBasic",
      contractAddress: "",
      method: "",
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=', 
        value: '0x34df838f26565ebf832b7d7c1094d081679e8fe1'
      },
    standardContractType: ""
    }];
    // Download file from IPFS
    console.log('create ipfs client');
    const ipfsClient = makeStorageClient();
    console.log('get IPFS file at cid:' + url)
    const data = await ipfsClient.get(url);
    console.log(`Got a response! [${data.status}] ${data.statusText}`)
    if (!data.status==200) {
      console.log (`failed to get ${url} - [${data.status}] ${data.statusText}`)
      return;
    }
  
    // unpack File objects from the response
    const files = await data.files()
    for (const file of files) {
      console.log(`${file.cid} --  ${file.size}`)
      // Each `file` object contains `name` and `content` properties
      const fileName = file.name;     
      const dWebLinkURL = 'https://' + url + '.ipfs.dweb.link/' + fileName;
      console.log(dWebLinkURL)      
      // Example usage:      
      const response = await httpsRequest(dWebLinkURL)
      console.log("fetched document:" + response);
      if(response.includes('failed to resolve')){
        console.log("failed to resolve") 
        return;
      }     
      const chainIdString = "ethereum" 
      console.log("decrypting: " + fileName)
      const dc_AuthSig = authSig
      console.log(dc_AuthSig)
      const decryptBlob = await LitJsSdk.decryptToFile( {
          ciphertext: response,          
          dataToEncryptHash: hash,
          accessControlConditions: accessControlConditions,
          chain: chainIdString ,
          authSig: dc_AuthSig,
      },
      litNodeClient,
      );
      const decryptString = await LitJsSdk.decryptToString( {
        ciphertext: response,          
        dataToEncryptHash: hash,
        accessControlConditions: accessControlConditions,
        chain: chainIdString ,
        authSig: dc_AuthSig,
    },
    litNodeClient,
    );
      console.log('File decrypted with Lit protocol');
      console.log(decryptString )

      const outputPath = './out/' + fileName ;
      // Write the decrypted file to the 'out' directory
      fs.writeFile(outputPath, decryptBlob, (err) => {
        if (err) {
          console.error('Failed to write decrypted file:', err);
        } else {
          console.log(`Decrypted file has been saved in 'out' directory with name: ${fileName}`);
        }
      }); 
      
    }
       
  }
  catch (error) {
        console.log('Failed to encrypt or store file:', error);
  }
}
function readFileContents(file) {
  return new Promise((resolve, reject) => {
    var output = fs.readFileSync(file)
    console.log(output)
  });
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
        const { title: hash, body: bafyhash } = notification;
        console.log("hash: " + hash)
        console.log("bafyHash: " + bafyhash)
        // Now you can call your function to download, decrypt, etc.
        await DownloadandDecryptFile(bafyhash, hash); // Make sure this function is properly defined and imported
      }
    } catch (error) {
      console.error('Error fetching or processing notifications:', error);
    }
};  
const listenAndProcessXmTpMessages = async () => {
  console.log("connecting to XMTP Stream")
  const conversation = await xmtp.conversations.newConversation(
    '0x75341449dd0e8d696ca09ed4996a637d2cf1ec57'
  )
  console.log("conversation started")
  // Load all messages in the conversation
  const messages = await conversation.messages()
  for (let i = 0;i<messages.length; i++) {
    console.log(`[${messages[i].senderAddress}]: ${messages[i].content}`)
    const hash = messages[i].content.split(",")[1]
    const bafyhash = messages[i].content.split(",")[0]
    console.log("hash: " + hash)
    console.log("bafyHash: " + bafyhash)
    if (bafyhash != 'gm'){ //ignore certain messages
    // Now you can call your function to download, decrypt, etc.
      await DownloadandDecryptFile(bafyhash, hash); // Make sure this function is properly defined and imported
    }
  }
}
// Main function to start the process
const main = async () => {
    try {
      // You might want to perform some initial setup here  
      // Start the loop
      listenAndProcessXmTpMessages ()
      /*
      const loop = async () => {
        await fetchAndProcessNotifications();
        // Call this function again after 3 seconds
        setTimeout(loop, 3000);
      };  
      loop(); // This starts the loop
      */
    } catch (error) {
      console.error('Error in main function:', error);
    }
};  
// Start the script
main();