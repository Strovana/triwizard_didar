import React, { useState, useEffect } from "react";
import Sociva from "./utils/socivaContract.json";
import "./SivBox.css";
import Avatar from "react-avatar";
import { Button } from "@mui/material";
import axios from "axios";
import { SocivaContractAddress } from "./config.js";
import { BrowserProvider, Contract } from "ethers";
import { uploadToIPFS } from "./ipfs"; // Make sure you have this utility
import { uploadNoteToBlockchain } from "./blockchain"; // Make sure you have this utility

function SivBox({ onPost }) {
  const [sivMessage, setSivMessage] = useState("");
  const [avatarName, setAvatarName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isComposing, setIsComposing] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [title, setTitle] = useState("");

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + Enter to submit
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        if (showPollForm) {
          handlePollSubmit();
        } else if (sivMessage.trim()) {
          handleSivSubmit();
        }
      }

      // Escape to close poll form
      if (event.key === "Escape" && showPollForm) {
        setShowPollForm(false);
        setPollQuestion("");
        setPollOptions(["", ""]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sivMessage, showPollForm, pollQuestion, pollOptions]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const uploadFileToCloudinary = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", "your_upload_preset"); // Replace with your actual preset
    setUploading(true);
    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload", // Replace with your Cloud name
        formData
      );
      return res.data.secure_url;
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed!");
      return "";
    } finally {
      setUploading(false);
    }
  };

  // Updated addSiv function with automatic CID generation
  const addSiv = async (messageText, cid = null) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const socivaContract = new Contract(
        SocivaContractAddress,
        Sociva.abi,
        signer
      );

      // Call the updated contract function with CID
      let sivTx = await socivaContract.addSiv(
        messageText || sivMessage,
        cid || ""
      );
      console.log("Siv transaction:", sivTx);

      // Wait for transaction to be mined
      await sivTx.wait();
      return sivTx;
    } catch (error) {
      console.log("Error submitting new Siv:", error);
      throw error;
    }
  };

  const handleSivSubmit = async () => {
    if (!sivMessage.trim() && !selectedFile) return;

    setIsComposing(true);
    try {
      let fileUrl = "";
      let completeMessage = sivMessage;

      // Handle file upload to Cloudinary if needed
      if (selectedFile) {
        fileUrl = await uploadFileToCloudinary();
        completeMessage = sivMessage + (fileUrl ? `\n📎 ${fileUrl}` : "");
      }

      console.log("📤 Uploading to IPFS...");

      // Step 1: Upload content to IPFS and get unique CID
      const cid = await uploadToIPFS(
        completeMessage,
        `siv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.txt`
      );

      console.log("✅ Generated CID:", cid);

      // Step 2: Save to blockchain with the CID
      await addSiv(completeMessage, cid);

      if (onPost) onPost();

      // Reset form
      setSivMessage("");
      setSelectedFile(null);

      // Show success message with CID
      alert(
        `✅ Siv posted successfully!\n\n🔗 CID: ${cid}\n\n📄 View on IPFS: https://ipfs.io/ipfs/${cid}`
      );

      // Refresh the page to show new post (you can improve this with state management)
      //window.location.reload();
    } catch (error) {
      console.error("❌ Error posting Siv:", error);
      alert(`❌ Error posting Siv: ${error.message}`);
    } finally {
      setIsComposing(false);
    }
  };

  // Updated addPoll function with CID generation
  const addPoll = async () => {
    const pollData = {
      type: "poll",
      id: `poll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: pollQuestion,
      options: pollOptions.filter((option) => option.trim() !== ""),
      votes: {},
      sivText: `Poll: ${pollQuestion}`,
      isDeleted: false,
    };

    try {
      console.log("📤 Uploading poll to IPFS...");

      // Step 1: Upload poll to IPFS and get unique CID
      const cid = await uploadToIPFS(
        JSON.stringify(pollData, null, 2),
        `poll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.json`
      );

      console.log("✅ Generated Poll CID:", cid);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const socivaContract = new Contract(
        SocivaContractAddress,
        Sociva.abi,
        signer
      );

      // Step 2: Store poll data with CID in blockchain
      let pollTx = await socivaContract.addSiv(JSON.stringify(pollData), cid);
      console.log("Poll created:", pollTx);

      await pollTx.wait();
      return { pollTx, cid };
    } catch (error) {
      console.log("Error submitting new Poll:", error);
      throw error;
    }
  };

  const handlePollSubmit = async () => {
    if (
      !pollQuestion.trim() ||
      pollOptions.filter((opt) => opt.trim()).length < 2
    ) {
      alert("Please enter a question and at least 2 options for your poll.");
      return;
    }

    setIsComposing(true);
    try {
      const result = await addPoll();

      // Reset form
      setShowPollForm(false);
      setPollQuestion("");
      setPollOptions(["", ""]);

      // Show success message with CID
      alert(
        `✅ Poll created successfully!\n\n🔗 CID: ${result.cid}\n\n📄 View on IPFS: https://ipfs.io/ipfs/${result.cid}`
      );
      if (onPost) onPost();
      // Refresh the page to show new poll
      //window.location.reload();
    } catch (error) {
      console.error("❌ Error creating poll:", error);
      alert(`❌ Error creating poll: ${error.message}`);
    } finally {
      setIsComposing(false);
    }
  };

  const togglePollForm = () => {
    setShowPollForm(!showPollForm);
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  useEffect(() => {
    // Use a random name or user input for avatar
    setAvatarName("NoteMoire User");
  }, []);

  // Add this function for uploading notes
  async function handleUpload() {
    try {
      const cid = await uploadToIPFS(noteContent, `${title}.txt`);
      if (!cid) {
        console.error("CID not returned.");
        return;
      }
      const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;
      console.log("Your note is at:", ipfsUrl);
      const txHash = await uploadNoteToBlockchain(cid, title);
      alert(`Note uploaded!\nCID: ${cid}\nTxHash: ${txHash}`);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Something went wrong!");
    }
  }

  return (
    <>
      {/* Main Siv posting section */}
      <div className="sivBox">
        <form>
          <div className="sivBox__input">
            <Avatar
              name={avatarName}
              size="50"
              round={true}
              color="#bb2b7a"
              fgColor="#ffffff"
            />
            <input
              onChange={(e) => setSivMessage(e.target.value)}
              value={sivMessage}
              placeholder="What's happening?"
              type="text"
              style={{ borderRadius: "50px" }}
              disabled={isComposing}
            />
          </div>

          {selectedFile && (
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                textAlign: "center",
                marginTop: "0.5rem",
              }}
            >
              Selected: {selectedFile.name}
            </p>
          )}

          {(uploading || isComposing) && (
            <p
              style={{
                color: "var(--text-secondary)",
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              {uploading
                ? "Uploading file..."
                : "🚀 Uploading to IPFS & Blockchain..."}
            </p>
          )}

          {!showPollForm ? (
            <div className="sivBox__actions">
              <Button
                onClick={handleSivSubmit}
                type="button"
                disabled={(!sivMessage.trim() && !selectedFile) || isComposing}
                className="sivBox__sivButton"
              >
                {isComposing ? "🚀 Posting to IPFS..." : "Siv"}
              </Button>
              <Button
                onClick={togglePollForm}
                type="button"
                className="sivBox__addPoll"
                disabled={isComposing}
              >
                Add Poll
              </Button>
              <label htmlFor="fileInput" className="sivBox__fileLabel">
                {selectedFile ? selectedFile.name : "Attach a file"}
              </label>
              <input
                type="file"
                id="fileInput"
                accept="image/*,video/*,.pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={handleFileChange}
                disabled={isComposing}
              />
            </div>
          ) : (
            <div className="sivBox__pollForm">
              <input
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="sivBox__pollQuestion"
                disabled={isComposing}
              />

              {pollOptions.map((option, index) => (
                <div key={index} className="sivBox__pollOption">
                  <input
                    value={option}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="sivBox__pollOptionInput"
                    disabled={isComposing}
                  />
                  {pollOptions.length > 2 && (
                    <Button
                      onClick={() => removePollOption(index)}
                      className="sivBox__removeOption"
                      size="small"
                      disabled={isComposing}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}

              <div className="sivBox__pollActions">
                <Button
                  onClick={addPollOption}
                  className="sivBox__addOption"
                  size="small"
                  disabled={isComposing}
                >
                  Add Option
                </Button>

                <div className="sivBox__pollButtons">
                  <Button
                    onClick={() => {
                      setShowPollForm(false);
                      setPollQuestion("");
                      setPollOptions(["", ""]);
                    }}
                    className="sivBox__cancelPoll"
                    disabled={isComposing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePollSubmit}
                    disabled={
                      !pollQuestion.trim() ||
                      pollOptions.filter((opt) => opt.trim()).length < 2 ||
                      isComposing
                    }
                    className="sivBox__submitPoll"
                  >
                    {isComposing ? "🚀 Creating..." : "Create Poll"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Separate Note upload section */}
      {/*
      <div
        className="sivBox__noteSection"
        style={{
          marginTop: "20px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "10px",
        }}
      >
        <h3 style={{ marginBottom: "10px", color: "#333" }}>
          Upload Note to IPFS & Blockchain
        </h3>
        <input
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            fontSize: "14px",
          }}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            height: "100px",
            fontSize: "14px",
            resize: "vertical",
          }}
          placeholder="Write your note..."
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
        />
        <button
          style={{
            backgroundColor: "#1976d2",
            color: "white",
            padding: "10px 16px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
          onClick={handleUpload}
          disabled={!title.trim() || !noteContent.trim()}
        >
          Upload to IPFS & Blockchain
        </button>
      </div>*/}
    </>
  );
}

export default SivBox;
