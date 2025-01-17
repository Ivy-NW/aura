import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import "./nft-card.css";

const RealNFTCard = ({ tokenId, contract, marketplaceContract, account }) => {
  const [metadata, setMetadata] = useState(null);
  const [isListing, setIsListing] = useState(false); // To track listing state
  const baseIpfsUrl = "https://ipfs.io/ipfs/";

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const tokenURI = await contract.tokenURI(tokenId);
        const fullIpfsUrl = baseIpfsUrl + tokenURI;
        const response = await axios.get(fullIpfsUrl);
        const metadata = response.data;
        metadata.image = baseIpfsUrl + metadata.image;
        setMetadata(metadata);
      } catch (error) {
        console.log("Error fetching metadata:", error);
      }
    }

    fetchMetadata();
  }, [tokenId, contract]);

  const handleSell = async () => {
    if (!marketplaceContract || !account) {
      alert("Marketplace contract or account not available");
      return;
    }

    try {
      setIsListing(true); // Start listing process
      const price = prompt("Enter the starting price in ETH:");
      if (!price || isNaN(price)) {
        alert("Invalid price entered");
        setIsListing(false);
        return;
      }

      // Convert price to Wei (assuming you're using ethers.js)
      const priceInWei = window.ethers.utils.parseEther(price);

      // Approve the marketplace to transfer the NFT
      const approveTx = await contract.approve(marketplaceContract.address, tokenId);
      await approveTx.wait();

      // List the NFT on the marketplace
      const listTx = await marketplaceContract.listItem(tokenId, priceInWei, {
        from: account,
      });
      await listTx.wait();

      alert("NFT listed successfully!");
    } catch (error) {
      console.error("Error listing NFT:", error);
      alert("Failed to list NFT. Please try again.");
    } finally {
      setIsListing(false); // End listing process
    }
  };

  if (!metadata) {
    return <div>Loading...</div>;
  }

  return (
    <div className="single__nft__card">
      <div className="nft__img">
        <img src={metadata.image} alt="" className="w-100" />
      </div>

      <div className="nft__content">
        <h5 className="nft__title">
          <Link to={`/market/${tokenId}`}>{metadata.name || "No title"}</Link>
        </h5>

        <div className="creator__info-wrapper d-flex gap-3">
          <div className="creator__img">
            <img src={metadata.image} alt="" className="w-100" />
          </div>

          <div className="creator__info w-100 d-flex align-items-center justify-content-between">
            <div>
              <h6>Created By</h6>
              <p>{metadata.createdBy || "Unknown Creator"}</p>
            </div>

            <div>
              <h6>Current Bid</h6>
              <p>{metadata.price} ETH</p>
            </div>
          </div>
        </div>

        <div className="mt-3 d-flex align-items-center justify-content-between">
          <button
            className="bid__btn d-flex align-items-center gap-1"
            onClick={handleSell}
            disabled={isListing} // Disable button while listing
          >
            {isListing ? "Listing..." : <><i className="ri-shopping-bag-line"></i> Sell</>}
          </button>

          <span className="history__link">
            <Link to="#">View History</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RealNFTCard;