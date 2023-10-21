const PKPEthersWallet = require("@lit-protocol/pkp-ethers");

function obtainAuthSig(){
    return {
        sig : "0xf0fa357988b08853938bca2f05876ba34b7c61f1205312cb91b5eae2562dfc78504214de2845241bddad868d2d42f006e3c355e8e5ae16df9df0e1838aa2288f1b",
        derivedVia : "web3.eth.personal.sign",
        address: "0x75341449dd0e8d696ca09ed4996a637d2cf1ec57"
        } 
}

const pkpWallet = new PKPEthersWallet({
    controllerAuthSig: authSig,
    pkpPubKey: '0x046e09f7a1e553286e453585082220fe50bf6dcf5d229c986ff3010dbbe9c86e92dd546a587ea395f65716bc88f4e5125c8bd5461d5f18bf726138ad840b3779de',
    rpc: 'https://chain-rpc.litprotocol.com/http'
});


await pkpWallet.init();