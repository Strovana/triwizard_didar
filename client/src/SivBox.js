import React, { useState, useEffect } from "react";
import Sociva from "./utils/socivaContract.json";
import "./SivBox.css";
import Avatar from "react-avatar";
import { Button } from "@mui/material";
import axios from "axios";
import { SocivaContractAddress } from "./config.js";
import { BrowserProvider, Contract } from "ethers";
import { uploadToIPFS } from "./ipfs";
import { uploadNoteToBlockchain } from "./blockchain";

function SivBox({ onPost, refreshFeed }) {
  const [sivMessage, setSivMessage] = useState("");
  const [avatarName, setAvatarName] = useState("NoteMoire User");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isComposing, setIsComposing] = useState(false);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState("");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        if (showPollForm) {
          handlePollSubmit();
        } else if (sivMessage.trim()) {
          handleSivSubmit();
        }
      }
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
    formData.append("upload_preset", "notemoire");

    setUploading(true);
    try {
      const isPdf = selectedFile && selectedFile.type === "application/pdf";
      const endpoint = isPdf
        ? "https://api.cloudinary.com/v1_1/dckwtcpso/raw/upload"
        : "https://api.cloudinary.com/v1_1/dckwtcpso/upload";

      const res = await axios.post(endpoint, formData);
      return res.data.secure_url;
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed!");
      return "";
    } finally {
      setUploading(false);
    }
  };

  const handleSivSubmit = async () => {
    if (!sivMessage.trim() && !selectedFile) return;
    setIsComposing(true);
    let fileUrl = "";
    try {
      if (selectedFile) {
        fileUrl = await uploadFileToCloudinary();
        if (selectedFile.type === "application/pdf") setUploadedPdfUrl(fileUrl);
      }
      const completeMessage = sivMessage + (fileUrl ? `\n📎 ${fileUrl}` : "");
      const cid = await uploadToIPFS(
        completeMessage,
        `siv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.txt`
      );
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const socivaContract = new Contract(
        SocivaContractAddress,
        Sociva.abi,
        signer
      );
      const sivTx = await socivaContract.addSiv(completeMessage, cid);
      await sivTx.wait();
      alert(
        `✅ Siv posted successfully!\n\n🔗 CID: ${cid}\n\n📄 View on IPFS: https://ipfs.io/ipfs/${cid}`
      );
      setSivMessage("");
      setSelectedFile(null);
      setUploadedPdfUrl("");
      if (onPost) onPost();
      if (refreshFeed) refreshFeed();
    } catch (error) {
      console.error("Error posting Siv:", error);
      alert("❌ Error posting Siv.");
    } finally {
      setIsComposing(false);
    }
  };

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
      const cid = await uploadToIPFS(
        JSON.stringify(pollData, null, 2),
        `poll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.json`
      );
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const socivaContract = new Contract(
        SocivaContractAddress,
        Sociva.abi,
        signer
      );
      const pollTx = await socivaContract.addSiv(JSON.stringify(pollData), cid);
      await pollTx.wait();
      alert(
        `✅ Poll created successfully!\n\n🔗 CID: ${cid}\n\n📄 View on IPFS: https://ipfs.io/ipfs/${cid}`
      );
      if (refreshFeed) refreshFeed();
      if (onPost) onPost();
    } catch (error) {
      console.log("Error submitting new Poll:", error);
      alert("❌ Error creating poll.");
    }
  };

  const handlePollSubmit = async () => {
    if (
      !pollQuestion.trim() ||
      pollOptions.filter((opt) => opt.trim()).length < 2
    ) {
      alert("Please enter a question and at least 2 options.");
      return;
    }
    setIsComposing(true);
    try {
      await addPoll();
      setShowPollForm(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
    } finally {
      setIsComposing(false);
    }
  };

  const togglePollForm = () => setShowPollForm(!showPollForm);
  const addPollOption = () => setPollOptions([...pollOptions, ""]);
  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };
  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  return (
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
          <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
            {uploading
              ? "Uploading file..."
              : "🚀 Uploading to IPFS & Blockchain..."}
          </p>
        )}

        {!showPollForm ? (
          <div className="sivBox__buttons">
            <Button
              onClick={handleSivSubmit}
              type="button"
              disabled={(!sivMessage.trim() && !selectedFile) || isComposing}
              className="sivBox__sivButton"
            >
              {isComposing ? "Posting..." : "Siv"}
            </Button>
            <Button
              onClick={togglePollForm}
              type="button"
              className="sivBox__addPoll"
              disabled={isComposing}
            >
              Add Poll
            </Button>
            {!selectedFile && (
              <>
                <label htmlFor="fileInput" className="attach-file">
                  Attach a file
                </label>
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  disabled={isComposing}
                />
              </>
            )}
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
                  {isComposing ? "Creating..." : "Create Poll"}
                </Button>
              </div>
            </div>
          </div>
        )}
        {uploadedPdfUrl && (
          <div className="uploaded-pdf" style={{ marginTop: "1rem" }}>
            <p>Uploaded PDF:</p>
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                window.open(uploadedPdfUrl, "_blank", "noopener,noreferrer")
              }
              style={{
                background: "#bb2b7a",
                color: "#fff",
                borderRadius: 8,
                marginTop: 8,
              }}
            >
              Open PDF in New Tab
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

export default SivBox;
