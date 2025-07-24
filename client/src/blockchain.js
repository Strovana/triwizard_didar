import { BrowserProvider, Contract } from "ethers";
import NotesRegistryABI from "./contract/NotesRegistry.json"; // Adjust path as needed

const CONTRACT_ADDRESS = "0x0F22976428B2406f1208817ce7948961e8cd39ae";

export async function uploadNoteToBlockchain(cid, title) {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const contract = new Contract(CONTRACT_ADDRESS, NotesRegistryABI.abi, signer);

  const tx = await contract.uploadNote(cid, title);
  const receipt = await tx.wait();
  return receipt.hash;
}
