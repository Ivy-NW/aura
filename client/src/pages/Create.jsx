import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Container, Row, Col } from "reactstrap";
import { useBlockchainContext } from "../context/BlockchainContext";
import CommonSection from "../components/ui/Common-section/CommonSection";
import "../styles/create-item.css";

const Create = () => {
  const { contract, currentAccount } = useBlockchainContext();
  const [fileImg, setFileImg] = useState(null);
  const [createdBy, setCreatedBy] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [minBid, setMinBid] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Pinata API keys
  const PINATA_API_KEY = "35f37cbbfb66eba6108f";
  const PINATA_SECRET_API_KEY = "2363dbfe3a821cf4a6ec274da71bdced34af8d2ed0f74d493c50c2f92d7e49d2";

  const sendSMS = async () => {
    try {
      // Call the backend server instead of Africa's Talking API directly
      const response = await axios.post("http://localhost:5000/send-sms", {
        phoneNumber: phoneNumber,
        message: "Your NFT has been successfully minted!",
      });

      if (response.data.SMSMessageData.Message === "Sent to 1/1") {
        console.log("SMS sent successfully");
      } else {
        console.error("Failed to send SMS:", response.data);
      }
    } catch (error) {
      console.error("SMS Error:", error);
      throw error;
    }
  };

  const sendJSONtoIPFS = async (ImgHash) => {
    try {
      const resJSON = await axios.post(
        "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        {
          name: name,
          description: desc,
          createdBy: createdBy,
          image: ImgHash,
          minBid: minBid,
          price: price,
          startDate: startDate,
          expirationDate: expirationDate,
        },
        {
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
          },
        }
      );

      const tokenURI = resJSON.data.IpfsHash;
      await mintNFT(tokenURI);
    } catch (error) {
      throw error;
    }
  };

  const sendFileToIPFS = async () => {
    if (fileImg) {
      try {
        const formData = new FormData();
        formData.append("file", fileImg);

        const resFile = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          formData,
          {
            headers: {
              pinata_api_key: PINATA_API_KEY,
              pinata_secret_api_key: PINATA_SECRET_API_KEY,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const ImgHash = resFile.data.IpfsHash;
        await sendJSONtoIPFS(ImgHash);
      } catch (error) {
        throw error;
      }
    }
  };

  const mintNFT = async (tokenURI) => {
    try {
      await contract.NFTminter(tokenURI, currentAccount);
    } catch (error) {
      throw error;
    }
  };

  const validatePhoneNumber = (number) => {
    const regex = /^\+\d{1,3}\d{9,15}$/;
    return regex.test(number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentAccount) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!fileImg || !name || !price) {
      toast.error("Upload the required data");
      return;
    }

    let loadingToastId;
    try {
      loadingToastId = toast.loading("Sending data and minting NFT...");
      await sendFileToIPFS();

      toast.success("File sent to IPFS and NFT minted successfully", {
        id: loadingToastId,
      });

      if (phoneNumber) {
        if (!validatePhoneNumber(phoneNumber)) {
          toast.error("Invalid phone number format");
          return;
        }

        try {
          await sendSMS();
          toast.success("SMS notification sent successfully");
        } catch (smsError) {
          toast.error("Failed to send SMS notification");
        }
      }
    } catch (error) {
      toast.error("Error in sending file or minting NFT", {
        id: loadingToastId,
      });
    }
  };

  return (
    <>
      <CommonSection title="Create Item" />

      <section>
        <Container>
          <Row>
            <Col lg="9" md="8" sm="6">
              <div className="create__item">
                {currentAccount ? null : (
                  <div className="form__input">
                    <p className="connect-wallet-message text-center">
                      Please connect your wallet to proceed.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form__input">
                    <label htmlFor="">
                      Upload File <span className="required">*</span>
                    </label>
                    <input
                      type="file"
                      className="upload__input"
                      onChange={(e) => setFileImg(e.target.files[0])}
                    />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">
                      Price <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter price for one item (ETH)"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Minimum Bid</label>
                    <input
                      type="number"
                      placeholder="Enter minimum bid"
                      value={minBid}
                      onChange={(e) => setMinBid(e.target.value)}
                    />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Phone Number (SMS Notification)</label>
                    <input
                      type="tel"
                      placeholder="Enter international number (+254...)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      pattern="\+\d{1,3}\d{9,15}"
                    />
                    <small className="form-text text-muted">
                      Include country code (e.g., +1, +254)
                    </small>
                  </div>

                  <div className="d-flex align-items-center gap-4">
                    <div className="form__input w-50">
                      <label htmlFor="">Starting Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>

                    <div className="form__input w-50">
                      <label htmlFor="">Expiration Date</label>
                      <input
                        type="date"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Owner</label>
                    <input
                      type="text"
                      placeholder="Enter Owner name"
                      value={createdBy}
                      onChange={(e) => setCreatedBy(e.target.value)}
                    />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">
                      Title <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter title"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Description</label>
                    <textarea
                      rows="7"
                      placeholder="Enter description"
                      className="w-100"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="send__btn"
                    style={{
                      border: "none",
                      padding: "7px 25px",
                      borderRadius: "5px",
                      marginTop: "20px",
                    }}
                  >
                    Create NFT
                  </button>
                </form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Create;