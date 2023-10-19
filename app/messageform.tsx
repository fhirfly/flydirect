///<reference path="../node_modules/@types/fhir/index.d.ts"/>
import React, { useState } from 'react';
const LitJsSdk = require('@lit-protocol/lit-node-client-nodejs');
const { ethers } = require("ethers");
import Bundle = fhir4b.Bundle;
import Communication = fhir4b.Communication;
import MessageHeader = fhir4b.MessageHeader;
import Person = fhir4b.Person;
import Signature = fhir4b.Signature;
import { v4 } from "uuid";
import { makeStorageClient } from "../hooks/useIpfs";


// Import additional utilities/libraries as needed for the Lit Protocol.

interface FormState {
  recipient: string;
  subject: string;
  body: string;
}

const MessageForm: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
    recipient: '',
    subject: '',
    body: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const actualSender: Person = {
        resourceType: 'Person',
        id: 'sender-person',
        identifier: [
            {
              system: 'https://www.w3.org/ns/did',
              value: senderDID,
            },
        ]

    }
    // Construct the MessageHeader and Communication resources.
    const messageHeader: MessageHeader = {
      resourceType: 'MessageHeader',
      // ... other properties,
      sender: {reference: '#sender-person'},
      source: {endpoint: 'did:health:1234'},
      destination: [{
        endpoint: 'did:health:12345',
        receiver: {reference: '#receiver-person'},
      }],
      // ... other properties as per FHIR spec.
    };

    const communication: Communication = {
      resourceType: 'Communication',
      status: 'completed',
      topic: { text: formData.subject },
      payload: [{ contentString: formData.body }],
      // ... other properties as per FHIR spec.
    };

    // Serialize the resources. This step may vary based on the specifics of your implementation.
    const serializedMessageHeader = JSON.stringify(messageHeader);
    const serializedCommunication = JSON.stringify(communication);
    const serializedMessage = serializedMessageHeader + serializedCommunication

    // Sign the serialized data using the Lit Protocol. 
    // The actual implementation will depend on the Lit Protocol's specifics, which would likely be an asynchronous operation.
    const litNodeClient = new LitJsSdk.LitNodeClientNodeJs();
    await litNodeClient.connect();

    // Initialize the signer
    const wallet = new ethers.Wallet('<Your private key>');//TODO where does the private key come from?
    const address = ethers.utils.getAddress(await wallet.getAddress());

      // Sign the message and format the authSig
    const signature = await wallet.signMessage(serializedMessage);

    const authSig = {
        sig: signature,
        derivedVia: 'web3.eth.personal.sign',
        signedMessage: serializedMessage,
        address: address,
    };

    console.log(authSig);
   
    const base64Sig = window.btoa(JSON.stringify(authSig)); // Encode

    // Construct the FHIR Signature objects.
    const messageFhirSignature: Signature = {
      // ... populate according to the Lit signature and FHIR spec,
      when: new Date().toISOString(), // The time the signature was created.
      type: [
            {
              system: 'urn:iso-astm:E1762-95:2013',
              code: '1.2.840.10065.1.12.1.1',
              display: 'Authors Signature'
            }
          ],
      who: {
        reference: '#sender-person'
      },
      onBehalfOf: {
        reference: '#receiver-person'
      },

      targetFormat: 'application/fhir+json',
      sigFormat: 'application/signature+json',
      data: base64Sig, // The actual signature content, base64 encoded.
    };

    const uuid = v4();
 
    // Construct the Bundle with the signed resources.
    const bundle: Bundle = {
      resourceType: 'Bundle',
      id: uuid,
      type: 'message',
      signature: messageFhirSignature,

      // ... other properties,
      entry: [
        {
          fullUrl: 'urn:uuid:message-header-id',
          resource: messageHeader,
        },
        {
          fullUrl: 'urn:uuid:communication-id',
          resource: communication,
        },
      ],
    };

    console.log('Prepared and signed FHIR Bundle', bundle);

    console.log("downloaded file");
    const blob = new Blob([JSON.stringify(bundle)], { type: "application/json" });
    console.log("created blob");
    const chainIdString = '5';
    const encBlob = await litNodeClient.encryptFile(blob, chainIdString, authSig);
    console.log("executed encytption with lit:" + encBlob);
    const encFile = encBlob.encryptedFile;
    if (encFile != null) {
      const files = [new File([blob], "plain-utf8.txt)"), new File([encFile], "Patient/" + uuid)];

      //Upload File to IPFS
      const client = makeStorageClient();
      const cid = await client.put(files);
      console.log(cid)
      const uri = "https://" + cid + ".ipfs.dweb.link/Patient/" + uuid;
      console.log(uri)
      //create new did registry entry
      console.log("stored files with cid:", cid);
      console.log("uri:", uri);

  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="recipient">Recipient(s) DID:</label>
        <input
          type="text"
          id="recipient"
          name="recipient"
          value={formData.recipient}
          onChange={handleInputChange}
          required
          placeholder="did:health:02123xreceiver"
        />
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

      <button type="submit">Send Message</button>
    </form>
  );
};

export default MessageForm;
