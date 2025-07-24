import React, { useState, useEffect } from "react";
import SivBox from "./SivBox.js";
import Post from "./Post.js";
import "./Feed.css";
import FlipMove from "react-flip-move";
import Sociva from "./utils/socivaContract.json";
import { SocivaContractAddress } from "./config.js";
import { BrowserProvider, Contract } from "ethers";

function Feed() {
  const [posts, setPosts] = useState([]);

  const getUpdatedSivs = (allSivs, address) => {
    let updatedSivs = [];
    for (let i = 0; i < allSivs.length; i++) {
      let sivData;

      try {
        const parsed = JSON.parse(allSivs[i].sivText);
        if (parsed.type === "poll") {
          if (!parsed.id) {
            parsed.id = `poll_${allSivs[i].id}_${Date.now()}`;
          }
          sivData = JSON.stringify(parsed);
        } else {
          sivData = allSivs[i].sivText;
        }
      } catch (e) {
        sivData = allSivs[i].sivText;
      }

      let siv = {
        id: allSivs[i].id,
        sivText: sivData,
        isDeleted: allSivs[i].isDeleted,
        username: allSivs[i].username,
        personal: allSivs[i].username.toLowerCase() === address.toLowerCase(),
        cid: allSivs[i].cid || null,
      };
      updatedSivs.push(siv);
    }
    return updatedSivs.reverse();
  };

  const getAllSivs = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const socivaContract = new Contract(
          SocivaContractAddress,
          Sociva.abi,
          signer
        );
        const allSivs = await socivaContract.getAllSivs();
        const address = await signer.getAddress();
        setPosts(getUpdatedSivs(allSivs, address));
      } else {
        console.log("Ethereum object not found");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const deleteSiv = (key) => async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const socivaContract = new Contract(
          SocivaContractAddress,
          Sociva.abi,
          signer
        );
        const deleteSivTx = await socivaContract.deleteSiv(key, true);
        await deleteSivTx.wait();
        const allSivs = await socivaContract.getAllSivs();
        const address = await signer.getAddress();
        setPosts(getUpdatedSivs(allSivs, address));
      } else {
        console.log("Ethereum object not found");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  useEffect(() => {
    getAllSivs();
  }, []);

  return (
    <div className="feed">
      <div className="feed_header">
        <h2>Home</h2>
      </div>
      <SivBox onPost={getAllSivs} refreshFeed={getAllSivs} />
      <div className="feed__content">
        <FlipMove>
          {posts.map((post) => (
            <div key={post.id} className="feed__post">
              <Post
                post={post}
                displayName={post.username}
                text={post.sivText}
                personal={post.personal}
                cid={post.cid}
                onClick={deleteSiv(post.id)}
              />
            </div>
          ))}
        </FlipMove>
      </div>
    </div>
  );
}

export default Feed;
