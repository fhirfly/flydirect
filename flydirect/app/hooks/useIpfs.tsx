import { Web3Storage} from "web3.storage";

function getAccessToken() {
  return '1234';
}

export function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

