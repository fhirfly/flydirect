// /<reference path="../node_modules/@types/fhir/index.d.ts"/>
import React, { useState } from "react";
import Bundle = fhir4b.Bundle;
import Communication = fhir4b.Communication;
import MessageHeader = fhir4b.MessageHeader;
import Person = fhir4b.Person;
import Signature = fhir4b.Signature;
import { v4 } from "uuid";
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
  };
  const currentAccessControlConditions = accessControlConditions;
  const recipientDID = "1234";
  //     const actualRecipient: Person = {
  //       resourceType: "Person",
  //       id: "recipient-person",
  //       identifier: [
  //         {
  //           system: "https://www.w3.org/ns/did",
  //           value: recipientDID,
  //         },
  //       ],
  //     };
  //     // Construct the MessageHeader and Communication resources.
  //     const messageHeader: MessageHeader = {
  //       resourceType: "MessageHeader",
  //       contained: [actualSender, actualRecipient],
  //       sender: { reference: "#sender-person" },
  //       source: { endpoint: "did:health:1234" },
  //       destination: [
  //         {
  //           endpoint: "did:health:12345",
  //           receiver: { reference: "#receiver-person" },
  //         },
  //       ],
  //       // ... other properties as per FHIR spec.
  //     };

  //     const communication: Communication = {
  //       resourceType: "Communication",
  //       status: "completed",
  //       topic: { text: formData.subject },
  //       payload: [{ contentString: formData.body }],
  //       // ... other properties as per FHIR spec.
  //     };

  //     // Serialize the resources. This step may vary based on the specifics of your implementation.
  //     const serializedMessageHeader = JSON.stringify(messageHeader);
  //     const serializedCommunication = JSON.stringify(communication);
  //     const serializedMessage = serializedMessageHeader + serializedCommunication;

  //     //const base64Sig = window.btoa(JSON.stringify(authSig)); // Encode
  //     const base64Sig = "1234";
  //     // Construct the FHIR Signature objects.
  //     const messageFhirSignature: Signature = {
  //       // ... populate according to the Lit signature and FHIR spec,
  //       when: new Date().toISOString(), // The time the signature was created.
  //       type: [
  //         {
  //           system: "urn:iso-astm:E1762-95:2013",
  //           code: "1.2.840.10065.1.12.1.1",
  //           display: "Authors Signature",
  //         },
  //       ],
  //       who: {
  //         reference: "#sender-person",
  //       },
  //       onBehalfOf: {
  //         reference: "#receiver-person",
  //       },

  //       targetFormat: "application/fhir+json",
  //       sigFormat: "application/signature+json",
  //       data: base64Sig, // The actual signature content, base64 encoded.
  //     };

  //     const uuid = v4();

  //     // Construct the Bundle with the signed resources.
  //     const bundle: Bundle = {
  //       resourceType: "Bundle",
  //       id: uuid,
  //       type: "message",
  //       signature: messageFhirSignature,

  //       // ... other properties,
  //       entry: [
  //         {
  //           fullUrl: "urn:uuid:message-header-id",
  //           resource: messageHeader,
  //         },
  //         {
  //           fullUrl: "urn:uuid:communication-id",
  //           resource: communication,
  //         },
  //       ],
  //     };

  //     console.log("Prepared and signed FHIR Bundle", bundle);

  //     const blob = new Blob([JSON.stringify(bundle)], {
  //       type: "application/json",
  //     });
  //     console.log("created blob");
  //     const chainIdString = "5";
  //     /*const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
  //       {
  //         currentAccessControlConditions,
  //         authSig,
  //         chain: 'ethereum',
  //         dataToEncrypt: blob,
  //       },
  //       client,
  //     );
  // */

  //     //console.log("executed encytption with lit:" + encBlob);
  //     //const encFile = encBlob.encryptedFile;
  //     const encFile = null;
  //     if (encFile != null) {
  //       const files = [
  //         new File([blob], "plain-utf8.txt)"),
  //         new File([encFile], "Patient/" + uuid),
  //       ];

  //       //Upload File to IPFS
  //       const client = makeStorageClient();
  //       const cid = await client.put(files);
  //       console.log(cid);
  //       const uri = "https://" + cid + ".ipfs.dweb.link/Patient/" + uuid;
  //       console.log(uri);
  //       //create new did registry entry
  //       console.log("stored files with cid:", cid);
  //       console.log("uri:", uri);

  //       //TODO Get receiptient address from DID.
  //       //const recipientDIDAddress = getAddressfromDID(recipientDID)
  //       //const userSender = await PushAPI.initialize(signer, { env: 'staging' })
  //       /*const targetedNotif = await userSender.channel.send([recipientDID], {
  //         notification: {
  //           title: 'message',
  //           body: uri,
  //         },
  //       })
  //       */
  //     }

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
