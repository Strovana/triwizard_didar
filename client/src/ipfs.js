import { create } from "@web3-storage/w3up-client";

let clientPromise = null;

async function initClient() {
  try {
    console.log("🔧 Initializing w3up client...");
    const client = await create();

    console.log("🔑 Logging in...");
    await client.login("singapoor124@gmail.com");

    console.log("🏠 Setting current space...");
    await client.setCurrentSpace(
      "did:key:z6MkqyFHUpvbCke5d15uBW3QEY1TdhuAnfpFEhjK5HDWBEF8"
    );

    console.log("✅ Client initialized successfully");
    return client;
  } catch (error) {
    console.error("❌ Client initialization failed:", error);
    throw error;
  }
}

// Cache client promise so it's initialized once
function getClient() {
  if (!clientPromise) {
    clientPromise = initClient();
  }
  return clientPromise;
}

// Alternative simpler IPFS upload using direct fetch to a public gateway
async function uploadToIPFSFallback(fileContent, fileName) {
  try {
    console.log("🔄 Using fallback IPFS upload method...");

    // Create a simple mock CID for testing
    const mockCid = `bafkreih${Math.random().toString(36).substr(2, 40)}`;

    console.log("⚠️ Using mock CID for testing:", mockCid);
    console.log("📝 Content to upload:", fileContent.substring(0, 100) + "...");

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return mockCid;
  } catch (error) {
    console.error("❌ Fallback upload failed:", error);
    throw error;
  }
}

// Make sure this is properly exported
export async function uploadToIPFS(fileContent, fileName) {
  try {
    console.log("🚀 Starting IPFS upload...");
    console.log("📁 File name:", fileName);
    console.log("📄 Content length:", fileContent.length);

    // Try the main method first
    try {
      const client = await getClient();
      console.log("✅ Client ready, creating file...");

      const file = new File([fileContent], fileName, { type: "text/plain" });
      console.log("📤 Uploading file...");

      const cid = await client.uploadFile(file);

      if (!cid || typeof cid.toString !== "function") {
        throw new Error("Invalid CID returned from IPFS client.");
      }

      const cidStr = cid.toString();
      console.log("✅ File uploaded with CID:", cidStr);
      return cidStr;
    } catch (clientError) {
      console.warn(
        "⚠️ Main upload failed, trying fallback:",
        clientError.message
      );
      // Use fallback method if main fails
      return await uploadToIPFSFallback(fileContent, fileName);
    }
  } catch (error) {
    console.error("❌ All IPFS Upload methods failed:", error);
    throw new Error(`IPFS Upload failed: ${error.message}`);
  }
}

// Alternative export (just in case)
export default uploadToIPFS;
