import React, { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { useFilePicker } from "use-file-picker";
import Web3Context from "./context/Web3Context";
import toast from "react-hot-toast";
import { create } from "ipfs-http-client";
import shortenFilename from "./utils/shortenFilename";

import FactoryContract from "./contracts/FundraiserFactory.json";

const authorization =
  "Basic " +
  btoa(
    `${process.env.REACT_APP_PROJECT_ID}:${process.env.REACT_APP_API_KEY_SECRET}`
  );

const NewFundraiser = () => {
  const [name, setFundraiserName] = useState(null);
  const [website, setFundraiserWebsite] = useState(null);
  const [image, setImage] = useState(null);
  const [description, setFundraiserDescription] = useState(null);
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [imageIsLocal, setImageIsLocal] = useState(false);
  const [file, setFile] = useState(null);
  const web3 = useContext(Web3Context);
  let [ipfs, setIpfs] = useState(null);

  const [openFileSelector, { filesContent }] = useFilePicker({
    accept: "image/*",
    multiple: false,
    readAs: "ArrayBuffer",
  });

  useEffect(() => {
    if (filesContent.length >= 1) {
      const data = filesContent[0];
      const uint8Content = new Uint8Array(data.content);
      setFile(uint8Content);
    } else {
      setFile(null);
    }
  }, [filesContent]);

  useEffect(() => {
    try {
      setIpfs(
        create({
          url: "https://ipfs.infura.io:5001/api/v0",
          headers: {
            authorization,
          },
        })
      );
    } catch (err) {
      console.error("IPFS error ", err);
      toast.error("IPFS connection error");
      ipfs = undefined;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = FactoryContract.networks[networkId];
        const accounts = await web3.eth.getAccounts();
        const instance = new web3.eth.Contract(
          FactoryContract.abi,
          deployedNetwork && deployedNetwork.address
        );

        setContract(instance);
        setAccounts(accounts);
      } catch (error) {
        toast.error(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
      }
    };

    web3 && init();
  }, [web3]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const imageURL = image;
    const url = website;
    const beneficiary = address;

    if (
      (imageIsLocal && !ipfs) ||
      (imageIsLocal ? !file : !imageURL) ||
      !name ||
      !description ||
      !website
    ) {
      return toast.error("Please fill out all fields before submitting");
    }

    try {
      let src = "";

      if (imageIsLocal) {
        try {
          setSavingImage(true);
          const result = await ipfs.add(file);

          src = `https://infura-ipfs.io/ipfs/${result.path}`;
        } catch (err) {
          throw new Error(err.message);
        } finally {
          setSavingImage(false);
        }
      }

      setLoading(true);

      await contract.methods
        .createFundraiser(
          name,
          url,
          imageIsLocal ? src : imageURL,
          description,
          beneficiary
        )
        .send({ from: accounts[0] });

      toast.success("Successfully created fundraiser");
    } catch (err) {
      console.log("error: ", err.message);
      err.code !== 4001 && toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return web3 ? (
    <div className="create-fundraiser-container">
      <h1 className="heading">Create A New Fundraiser</h1>

      <div className="form">
        <div>
          <label>Name</label>
          <input
            placeholder="Fundraiser Name"
            onChange={(e) => setFundraiserName(e.target.value)}
          />
        </div>

        <div>
          <label>Website</label>
          <input
            placeholder="Fundraiser Website"
            onChange={(e) => setFundraiserWebsite(e.target.value)}
          />
        </div>

        <div>
          <label>Description</label>
          <input
            placeholder="Fundraiser Description"
            onChange={(e) => setFundraiserDescription(e.target.value)}
          />
        </div>

        <div>
          <label>Image</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "0.75rem",
            }}
          >
            {imageIsLocal ? (
              <div
                tabIndex={0}
                onClick={() => openFileSelector()}
                className="file-picker"
              >
                {filesContent && filesContent?.length >= 1
                  ? `📁 ${shortenFilename(filesContent[0].name, 20)}`
                  : "📁 Select Image"}
              </div>
            ) : (
              <input
                placeholder="Image URL"
                onChange={(e) => setImage(e.target.value)}
              />
            )}
            <span
              title={
                imageIsLocal
                  ? "Switch to use an image URL"
                  : "Switch to use a local image"
              }
              style={{
                marginLeft: "1rem",
                cursor: "pointer",
              }}
              onClick={() => {
                setImageIsLocal((prev) => !prev);
              }}
            >
              <FontAwesomeIcon icon={faRepeat} size="1x" color="#6b7280" />
            </span>
          </div>
        </div>

        <div>
          <label>Address</label>
          <input
            placeholder="Fundraiser Ethereum Address"
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || savingImage}
        >
          {loading || savingImage ? (
            <TailSpin width="25" color="#ffffff" />
          ) : (
            "SUBMIT"
          )}
        </button>
      </div>
    </div>
  ) : (
    <div>
      <TailSpin width="40" color="#49796f" />
    </div>
  );
};

export default NewFundraiser;
