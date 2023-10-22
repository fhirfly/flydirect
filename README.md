
# FlyDirect: Decentralized Healthcare Communication Platform
## Overview

FlyDirect is an innovative, open-source platform designed to revolutionize communication within the healthcare ecosystem. By utilizing decentralized identities (DIDs) and adhering to Fast Healthcare Interoperability Resources (FHIR) standards, FlyDirect enables secure, private, and standardized communication among patients, practitioners, organizations, devices and related entities. This project is under the MIT license, promoting a collaborative development environment.

## Features
- FHIR Standard Adherence: Ensures efficient, error-free message data exchange and astandard data model for interoperability across various healthcare systems.
- IPFS/FileCoin for Message Storage: Provides decentralized data storage, preventing data loss, enhancing availability, and ensuring scalability.
- Decentralized Identifiers (DIDs): Enables individuals and entities to control their identifiers, promoting privacy and security in communications.
- Threshold Cryptography: Offers robust security for sensitive health information through the Lit protocol, safeguarding data integrity and confidentiality.
- Real-Time Communication: Facilitates instant, reliable notifications and communications among users via XMTP, the Push Protocol, or Fly COntract.
- Comprehensive Stakeholder Engagement: Encourages a holistic healthcare communication environment for informed and efficient decision-making.
- Open-Source Collaboration: Allows developers worldwide to contribute, adapt, and customize, driving the platform's evolution.
- Gasless

## Getting Started
### Prerequisites
- Node.js
- An understanding of React and TypeScript

# Running a Fly Direct Receiver
## Prerequisites
- Configure the DIDs: Before running the receiver, you must have a channel preconfigured between two DIDs. This involves setting the public keys and endpoints that the DIDs will use to communicate.  Channels can be set up on any system, but you can use XMTP or Push Protocol precofigured channels.
## Environmental Variables: 
- Configure your wallet private key or neumonic, Lit Auth Sig, and Web 3 Storage API Key, all set in your environment file. See more below.
- Make sure there is an "out/Bundle" folder at the same level as you where you run the script.  This folder should have been created when you created the cloned this repository.
## Receive FHIR Messages
```node receiver.js```
# Setting Up and Running the Fly Direct Sender
- Configure the Sender: The sender needs to know the directory to monitor and the receiver DID to send the files to.
- Configure your wallet private key or neumonic, Lit Auth Sig, and Web 3 Storage API Key, all set in your environment file. See more below.
- Configure the recepient(s) - the wallet addresses or public kets or DIDs.
- Folder Permissions: Verify that that node has the necessary permissions to read the directory it will monitor and to send files over the network.  Plase FHIR Message resourcess in the ```./in``` directory per trhe FHIR Messaging Spec e.g. Bundle + MessageHeader + Other FHIR Resource.  An example file has been provided

## Send it:

```node sender.js```

## Monitoring the Sender: 
The sender will actively watch for new files in the ```./in``` directory.  The sender can be stopped at anytime with Ctrl + C.
Security and Key Configuration

## Key Configuration
### 1 Private Key or Neumonic for Push Protocol and XMTP Address
This key should be configured in the environment where sender.js and receiver.js will run.
### Lit Auth Signature for the Private Key 
The authentication signature must be configured in the environment.
the auth signature is created by signing a lit request with your wallet.
### Web3 Storage Key: 
The storage key must also be present in the environment.  You must obtain it from https://web3.storage

## Security Best Practices
Never commit your .env file or any file containing sensitive keys or signatures to version control.
store the keys in a vault in your cloud or a hardware wallet on your PC.

## Contributing
We warmly welcome contributions to FlyDirect! Please consult the CONTRIBUTING.md for guidelines on how to proceed.

## License
FlyDirect is open-sourced under the MIT license. See the LICENSE file for more details.

## Support
Encountering issues with the platform? Please inform us. We have a mailing list and an issue tracker for support.