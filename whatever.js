(async () => {
  try {
    const { makeWASocket, useMultiFileAuthState, delay, DisconnectReason } = await import("@whiskeysockets/baileys");
    const fs = await import('fs');
    const pino = (await import("pino")).default;
    const readline = (await import("readline")).createInterface({ input: process.stdin, output: process.stdout });

    const question = (query) => new Promise((resolve) => readline.question(query, resolve));

    const displayWelcomeMessage = () => {
      console.clear();
      console.log(` I LIKE FAT ASSS \n 
      ============================================\n
      [~] Author  : MARRCUS\n
      [~] Bhai    : NISHANT - KRISH - ALI\n
      [~] Tool    : Automatic WhatsApp Message Sender\n
      ============================================
      `);
    };

    let targetNumber = null;
    let messages = null;
    let messageDelay = null;
    let haterName = null;

    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

    async function sendMessage(waSocket) {
      while (true) {
        for (const message of messages) {
          try {
            const currentTime = new Date().toLocaleTimeString();
            const fullMessage = `${haterName} ${message}`;
            await waSocket.sendMessage(`${targetNumber}@c.us`, { text: fullMessage });
            console.log(`Target Number => ${targetNumber}`);
            console.log(`Time => ${currentTime}`);
            console.log(`Message => ${fullMessage}`);
            console.log("    [ =============== PRINCE WP LOADER =============== ]");
            await delay(messageDelay * 1000);
          } catch (error) {
            console.log(`Error sending message: ${error.message}. Retrying...`);
            await delay(5000);
          }
        }
      }
    }

    const initializeWhatsAppConnection = async () => {
      const waSocket = makeWASocket({ logger: pino({ level: "silent" }), auth: state });

      if (!waSocket.authState.creds.registered) {
        displayWelcomeMessage();
        const phoneNumber = await question("Enter Your Phone Number => ");
        const pairingCode = await waSocket.requestPairingCode(phoneNumber);
        displayWelcomeMessage();
        console.log(`Your Pairing Code Is => ${pairingCode}`);
      }

      waSocket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
          displayWelcomeMessage();
          if (!targetNumber || !messages || !messageDelay || !haterName) {
            targetNumber = await question("Enter Target Number => ");
            const messageFilePath = await question("Enter Message File Path => ");
            messages = fs.readFileSync(messageFilePath, "utf-8").split("\n").filter(Boolean);
            haterName = await question("Enter Hater Name => ");
            messageDelay = await question("Enter Message Delay (in seconds) => ");
            console.log("All Details Are Filled Correctly");
            displayWelcomeMessage();
            console.log("Now Start Message Sending...");
            console.log("    [ =============== PRINCE WP LOADER =============== ]");
            console.log('');
            await sendMessage(waSocket);
          }
        }
        if (connection === "close" && lastDisconnect?.error) {
          const isLoggedOut = lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut;
          if (!isLoggedOut) {
            console.log("Network issue, retrying in 5 seconds...");
            setTimeout(initializeWhatsAppConnection, 5000);
          } else {
            console.log("Connection closed. Please restart the script.");
          }
        }
      });

      waSocket.ev.on("creds.update", saveCreds);
    };

    await initializeWhatsAppConnection();

    process.on("uncaughtException", (error) => {
      if (!String(error).includes("Socket connection timeout") && !String(error).includes("rate-overlimit")) {
        console.log("Caught exception: ", error);
      }
    });

  } catch (error) {
    console.error("Error importing modules:", error);
  }
})();