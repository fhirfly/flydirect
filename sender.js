import chokidar from 'chokidar';
import fs from 'fs';
import { Web3Storage, File} from 'web3.storage';
import LitJsSdk from '@lit-protocol/lit-node-client';
import { v4 } from "uuid";
import * as PushAPI from "@pushprotocol/restapi";
import { ethers } from 'ethers'
import { Client } from '@xmtp/xmtp-js'
import path from 'path'
// Initialize the Lit client
const litNodeClient =new LitJsSdk.LitNodeClient({
    litNetwork: 'cayenne',
});
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
// This is the authsig for 0x75341449Dd0e8D696Ca09eD4996a637D2cF1EC57
function obtainAuthSig(){
    return {
        sig : "0xf0fa357988b08853938bca2f05876ba34b7c61f1205312cb91b5eae2562dfc78504214de2845241bddad868d2d42f006e3c355e8e5ae16df9df0e1838aa2288f1b",
        derivedVia : "web3.eth.personal.sign",
        address: "0x75341449dd0e8d696ca09ed4996a637d2cf1ec57"
        } 
}
// Start the connection to the LIT network
await connectToLit();

const authSig = await obtainAuthSig();
if (!authSig) {
  throw new Error('AuthSig is required for encryption');
}
// Function to encrypt the file using LIT Protocol and upload to IPFS
const encryptAndUploadFile = async (filePath, uuid) => {
  try {
    
    // Read the file's content
    const fileFHIR = fs.readFileSync(filePath, 'utf8'); // or 'binary' if the file is not a text file
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
    const blob = new Blob([fileFHIR], { type: "application/json" });
    console.log("created blob");
    const chainIdString = "ethereum" 
    const encBlob = await LitJsSdk.encryptFile( {
      accessControlConditions,
      authSig,
      chain: chainIdString,
      file: blob,
      },
      litNodeClient,
    );
    const hash = encBlob.dataToEncryptHash;
    console.log("executed encytption with lit:" + hash);
    const encFile = encBlob.ciphertext;
    console.log('File encrypted with Lit protocol:' + encFile );
    if (encFile != null) {
      // Prepare files to upload to IPFS
      const uuid = v4();
      const files = [new File([encFile], "Bundle/" + uuid)];      
      const uri = await uploadFiletoIPFS(uuid, files);
      //Send PushNotification via Push Protocol
      try{
        await sendXMTP(uri, hash);  
        try{
          await sendPush(uri, hash);
        }
        catch(e){console.log(e)}
      }
      catch(e){console.log(e)}
    }
  } catch (error) {
    console.error('Failed to encrypt or store file:', error);
  }
};
async function uploadFiletoIPFS(uuid, files ){
  // Upload file to IPFS
  console.log('create ipfs client');
  const ipfsClient = makeStorageClient();
  console.log('put IPFS file' + files)
  const cid = await ipfsClient.put(files);
  console.log("stored files with cid:", cid);
  const uri = "https://" + cid + ".ipfs.dweb.link/Bundle/" + uuid;
  console.log("uri:", uri);
  return cid;

}
async function sendXMTP(uri, hash){
  // Create the client with a `Signer` from your application
  const signer = ethers.Wallet.fromMnemonic('keen clay bargain fame mixture cover age tiny detect effort estate hotel')
  const xmtp = await Client.create(signer, {env: 'production'})
  console.log("sending xmtp")
  const conversation = await xmtp.conversations.newConversation(
    '0x34df838F26565EbF832B7d7c1094D081679E8fe1'
  )
  console.log("conversation started")
  await conversation.send(uri + ',' + hash);
  console.log("message sent via XMTP")
}
async function sendPush(uri, hash){
  // Creating a random signer from a wallet, ideally this is the wallet you will connect
  const signer = ethers.Wallet.fromMnemonic('keen clay bargain fame mixture cover age tiny detect effort estate hotel')
  const userAddress = await signer.getAddress()
  console.log ("sending message from address: " + userAddress)
  // Initialize wallet user, pass 'prod' instead of 'staging' for mainnet apps
  console.log("logging");
  const userSender = await PushAPI.PushAPI.initialize(signer, { env: 'staging' })
  console.log("attempting send via Push Protocol")
  const targetedNotif = await userSender.channel.send(['0x34df838F26565EbF832B7d7c1094D081679E8fe1'], {
    notification: {
      title: hash,
      body: uri,
    },
  })
  console.log(targetedNotif)
}
// Directory to watch
const DIRECTORY_TO_WATCH = './in'; // replace with your actual directory
// File watcher setup
const watcher = chokidar.watch(DIRECTORY_TO_WATCH, { ignored: /^\./, persistent: true });
watcher
  .on('add', async (filePath) => {
    console.log('File', filePath, 'has been added');
    const uuid = path.basename(filePath); // or generate a UUID in another way if needed
    await encryptAndUploadFile(filePath, uuid);
  });
console.log(`Watching for file changes on ${DIRECTORY_TO_WATCH}`);