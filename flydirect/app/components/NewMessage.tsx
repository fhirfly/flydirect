// /<reference path="../node_modules/@types/fhir/index.d.ts"/>
import React, { useState } from "react";
import Bundle = fhir4b.Bundle;
import Communication = fhir4b.Communication;
import MessageHeader = fhir4b.MessageHeader;
import Person = fhir4b.Person;
import Signature = fhir4b.Signature;
import { v4 } from "uuid";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import * as PushAPI from "@pushprotocol/restapi";
import { ethers } from 'ethers'
import { Client } from '@xmtp/xmtp-js'
import { makeStorageClient } from "../hooks/useIpfs";
import ShareModal from "lit-share-modal-v3";
//import { PushAPI } from '@pushprotocol/restapi'

interface FormState {
  recipient: string;
  subject: string;
  body: string;
}

function NewMessage(props: any) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [accessControlConditions, setAccessControlConditions] = useState([]);


  const onUnifiedAccessControlConditionsSelected = (shareModalOutput: any) => {
    // do things with share modal output
    setAccessControlConditions(shareModalOutput);
  
  };

  const [formData, setFormData] = useState<FormState>({
    recipient: "",
    subject: "",
    body: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  async function sendXMTP(uri: string, hash: string, address: string){
  // Create the client with a `Signer` from your application
const signer = null;
  const xmtp = await Client.create(signer, {env: 'production'})
  console.log("sending xmtp")
  const conversation = await xmtp.conversations.newConversation(
  address
  )
  console.log("conversation started")
  await conversation.send(uri + ',' + hash);
  console.log("message sent via XMTP")
  }
  
async function sendPush(uri: any, hash: string, address: string){
  // Creating a random signer from a wallet, ideally this is the wallet you will connect
const signer = null;
  const userAddress = await signer.getAddress()
  console.log ("sending message from address: " + userAddress)
  // Initialize wallet user, pass 'prod' instead of 'staging' for mainnet apps
  console.log("logging");
  const userSender = await PushAPI.PushAPI.initialize(signer, { env: 'staging' })
  console.log("attempting send via Push Protocol")
  const targetedNotif = await userSender.channel.send([address], {
    notification: {
      title: hash,
      body: uri,
    },
  })
 }
async function uploadFiletoIPFS(uuid: string, files: string | File[] ){
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


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const senderDID = "1234";
    const actualSender: Person = {
      resourceType: "Person",
      id: "sender-person",
      identifier: [
        {
          system: "https://www.w3.org/ns/did",
          value: senderDID,
        },
      ],
    };

  const currentAccessControlConditions = accessControlConditions;
  console.log(currentAccessControlConditions)
  const recipientDID = "1234";
      const actualRecipient: Person = {
        resourceType: "Person",
        id: "recipient-person",
        identifier: [
          {
            system: "https://www.w3.org/ns/did",
            value: recipientDID,
          },
        ],
      };
      // Construct the MessageHeader and Communication resources.
      const messageHeader: MessageHeader = {
        resourceType: "MessageHeader",
        contained: [actualSender, actualRecipient],
        sender: { reference: "#sender-person" },
        source: { endpoint: "did:health:1234" },
        destination: [
          {
            endpoint: "did:health:12345",
            receiver: { reference: "#receiver-person" },
          },
        ],
        // ... other properties as per FHIR spec.
      };

      const communication: Communication = {
        resourceType: "Communication",
        status: "completed",
        topic: { text: formData.subject },
        payload: [{ contentString: formData.body }],
        // ... other properties as per FHIR spec.
      };

      // Serialize the resources. This step may vary based on the specifics of your implementation.
      const serializedMessageHeader = JSON.stringify(messageHeader);
      const serializedCommunication = JSON.stringify(communication);
      const serializedMessage = serializedMessageHeader + serializedCommunication;

      //const base64Sig = window.btoa(JSON.stringify(authSig)); // Encode
      const base64Sig = "1234";
      // Construct the FHIR Signature objects.
      const messageFhirSignature: Signature = {
        // ... populate according to the Lit signature and FHIR spec,
        when: new Date().toISOString(), // The time the signature was created.
        type: [
          {
            system: "urn:iso-astm:E1762-95:2013",
            code: "1.2.840.10065.1.12.1.1",
            display: "Authors Signature",
          },
        ],
        who: {
          reference: "#sender-person",
        },
        onBehalfOf: {
          reference: "#receiver-person",
        },

        targetFormat: "application/fhir+json",
        sigFormat: "application/signature+json",
        data: base64Sig, // The actual signature content, base64 encoded.
      };

      const uuid = v4();

      // Construct the Bundle with the signed resources.
      const bundle: Bundle = {
        resourceType: "Bundle",
        id: uuid,
        type: "message",
        signature: messageFhirSignature,

        // ... other properties,
        entry: [
          {
            fullUrl: "urn:uuid:message-header-id",
            resource: messageHeader,
          },
          {
            fullUrl: "urn:uuid:communication-id",
            resource: communication,
          },
        ],
      };

      console.log("Prepared and signed FHIR Bundle", bundle);

      const blob = new Blob([JSON.stringify(bundle)], {
        type: "application/json",
      });

      console.log("created blob");
      const chainIdString = "ethereum" 
      const encBlob = await LitJsSdk.encryptFile( {
        accessControlConditions,
        authSig,
        chain: 'ethereum',
        file: blob,
        },
        LitNodeClient,
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
          await sendXMTP(uri, hash, currentAccessControlConditions.entries.toString());  
          try{
            await sendPush(uri, hash, currentAccessControlConditions.entries.toString());
          }
          catch(e){console.log(e)}
        }
        catch(e){console.log(e)}
      }
  };

  async function getAddressfromDID(did: any) {
    return ""; //Need to figure this out.
  }

  return (
    // console.log("SIGNATURE", authSig.sig),
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="recipient">Recipient(s) DID:</label>
        {<button onClick={() => setShowShareModal(true)}>
          Set Recipient(s)
        </button>}
      </div>

      <div>
        <label htmlFor="subject">Subject:</label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label htmlFor="body">Message Body:</label>
        <textarea
          id="body"
          name="body"
          value={formData.body}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
          {showShareModal && (
            <div className={"lit-share-modal"}>
              <ShareModal
                onClose={() => {
                  setShowShareModal(false);
                }}
                onUnifiedAccessControlConditionsSelected={
                  onUnifiedAccessControlConditionsSelected
                }
              />
            </div>
          )}
        </div> 

      <button type="submit">Send Message</button>
    </form>
  );
}

export default NewMessage;
