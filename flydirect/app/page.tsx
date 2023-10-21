"use client";
import Test from "./components/test";
import React, { useState } from "react";

import { checkAndSignAuthMessage } from "@lit-protocol/lit-node-client";
import NewMessageForm from "./components/NewMessage";

export default function Home() {
  const [authSig, setAuthSig] = useState({});

  const obtainAuthSig = async () => {
    try {
      let sig = await checkAndSignAuthMessage({
        chain: "ethereum",
      });
      setAuthSig(sig);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {authSig.sig ? (
        <NewMessageForm
          authSig_address={authSig.address}
          authSig_derivedVia={authSig.derivedVia}
          authSig_sig={authSig.sig}
          authSig_signedMessage={authSig.signedMessage}
        />
      ) : (
        <button onClick={obtainAuthSig}>Obtain AuthSig</button>
      )}
    </main>
  );
}
