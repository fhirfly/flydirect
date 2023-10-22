"use client";
import Test from "./components/test";
import React, { useState } from "react";

import { checkAndSignAuthMessage } from "@lit-protocol/lit-node-client";
import NewMessageForm from "./components/NewMessage";
import Inbox from "@/app/components/Inbox";

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
        <div>
              {authSig.sig ? (
                  <div className="flex flex-col items-center">
                    <div className="p-8">
                      <Inbox/>
                    </div>

                  <div className="w-full max-w-lg">
                      <NewMessageForm
                        authSig_address={authSig.address}
                        authSig_derivedVia={authSig.derivedVia}
                        authSig_sig={authSig.sig}
                        authSig_signedMessage={authSig.signedMessage}
                      />
                  </div>

                  </div>
                    ) : (
                  <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4 flex flex-col items-center">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        FlyDirect Messenger
                      </label>
                    </div>
                    <div className="flex flex-col items-center justify-between">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={obtainAuthSig}>
                    Authorize
                  </button>
                    </div>
                  </form>
              )}
          <p className="text-center text-gray-500 text-xs">
            &copy;2023 FlyDirect. All rights reserved.
          </p>
        </div>
      </main>

  );
}
