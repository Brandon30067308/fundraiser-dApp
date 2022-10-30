import React, { useEffect, useState, useContext } from "react";
import { TailSpin } from "react-loader-spinner";
import Modal from "react-modal";
import toast from "react-hot-toast";
import cc from "cryptocompare";

import Web3Context from "./context/Web3Context";

import FundraiserContract from "./contracts/Fundraiser.json";

import { Link } from "react-router-dom";

const FundraiserCard = ({ fundraiser }) => {
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [fundName, setFundname] = useState(null);
  const [description, setDescription] = useState(null);
  const [totalDonations, setTotalDonations] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [url, setURL] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(null);
  const [userDonations, setUserDonations] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [beneficiary, setNewBeneficiary] = useState("");
  const [donateLoading, setDonateLoading] = useState(false);
  const [beneficiaryLoading, setBeneficiaryLoading] = useState(false);
  const web3 = useContext(Web3Context);

  const ethAmount = (
    (donationAmount < 1 ? 0 : donationAmount) / exchangeRate || 0
  ).toFixed(4);

  useEffect(() => {
    if (fundraiser) {
      init(fundraiser);
    }
  }, [fundraiser]);

  const init = async (fundraiser) => {
    try {
      const fund = fundraiser;
      const networkId = await web3.eth.net.getId();
      const accounts = await web3.eth.getAccounts();
      const instance = new web3.eth.Contract(FundraiserContract.abi, fund);
      setContract(instance);
      setAccounts(accounts);

      const name = await instance.methods.name().call();
      const description = await instance.methods.description().call();
      const totalDonations = await instance.methods.totalDonations().call();
      const imageURL = await instance.methods.imageURL().call();
      const url = await instance.methods.url().call();

      const exchangeRate = await cc.price("ETH", ["USD"]);
      setExchangeRate(exchangeRate.USD);
      const eth = web3.utils.fromWei(totalDonations, "ether");
      const dollarDonationAmount = exchangeRate.USD * eth;

      setTotalDonations(dollarDonationAmount.toFixed(2));
      setFundname(name);
      setDescription(description);
      setImageURL(imageURL);
      setURL(url);

      const userDonations = await instance.methods
        .myDonations()
        .call({ from: accounts[0] });
      setUserDonations(userDonations);

      const isOwner = await instance.methods.owner().call();

      if (isOwner === accounts[0]) {
        setIsOwner(true);
      }
    } catch (error) {
      toast.error(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  const renderDonationsList = () => {
    var donations = userDonations;
    if (donations === null) {
      return null;
    }

    const totalDonations = donations.values.length;
    let donationList = [];
    var i;
    for (i = 0; i < totalDonations; i++) {
      const ethAmount = web3.utils.fromWei(donations.values[i]);
      const userDonation = exchangeRate * ethAmount;
      const donationDate = donations.dates[i];
      donationList.push({
        donationAmount: userDonation.toFixed(2),
        date: donationDate,
      });
    }

    return donationList.length >= 1 ? (
      <>
        <h3>My donations</h3>
        {donationList.map((donation, idx) => {
          return (
            <div className="donation-list" key={`d-${idx}`}>
              <p
                style={{
                  marginRight: "0.75rem",
                }}
              >
                ${donation.donationAmount}
              </p>

              <button variant="contained" color="primary">
                <Link
                  className="donation-receipt-link"
                  to="/receipts"
                  state={{
                    fund: fundName,
                    donation: donation.donationAmount,
                    date: donation.date,
                  }}
                >
                  REQUEST RECEIPT
                </Link>
              </button>
            </div>
          );
        })}
      </>
    ) : (
      <></>
    );
  };

  window.ethereum.on("accountsChanged", function (accounts) {
    window.location.reload();
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const submitFunds = async () => {
    const fundraisercontract = contract;
    const ethRate = exchangeRate;
    const ethTotal = donationAmount / ethRate;
    const donation = web3.utils.toWei((ethTotal < 1 ? 0 : ethTotal).toString());

    if (donationAmount < 1) {
      return toast.error("You can donate at least $1");
    }

    setDonateLoading(true);

    try {
      await fundraisercontract.methods.donate().send({
        from: accounts[0],
        value: donation,
        gas: 650000,
      });

      toast.success(`Your donation of $${donationAmount} was successful!`);
      setOpen(false);

      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (err) {
      console.log("error: ", err.message);
      err.code !== 4001 && toast.error("An error occurred");
    } finally {
      setDonateLoading(false);
    }
  };

  const withdrawalFunds = async () => {
    try {
      const balanceInWei = await web3.eth.getBalance(accounts[0]);
      const balance = web3.utils.fromWei(balanceInWei, "ether");
      if (balance <= 0) {
        return toast.error("You don't have any funds to withdraw");
      }

      await contract.methods.withdraw().send({
        from: accounts[0],
      });

      toast.success("Funds withdrawn!");
      setOpen(false);
    } catch (err) {
      console.log("error: ", err.message);
      err.code !== 4001 && toast.error("An error occurred");
    }
  };

  const setBeneficiary = async () => {
    try {
      if (!beneficiary) {
        return toast.error("Please fill out the beneficiary field");
      }

      setBeneficiaryLoading(true);
      await contract.methods.setBeneficiary(beneficiary).send({
        from: accounts[0],
      });

      toast.success("Fundraiser beneficiary changed");
    } catch (err) {
      console.log("error: ", err.message);
      err.code !== 4001 && toast.error("An error occurred");
    } finally {
      setBeneficiaryLoading(false);
    }
  };

  return !web3 || !fundName || !totalDonations ? (
    <></>
  ) : (
    <div className="card-container">
      {/* card */}
      <div className="card">
        <div>
          <div className="card-media" title="Fundraiser Image">
            <div
              style={{
                width: "100%",
                height: "300px",
                backgroundImage: `url(${imageURL})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
          <div className="card-content">
            <h2>{fundName}</h2>
            <div>
              <p
                style={{
                  marginBottom: "1.5rem",
                }}
              >
                {description}
              </p>
              <p>Total Donations: ${totalDonations}</p>
            </div>
          </div>
        </div>
        <div className="card-actions">
          <button
            onClick={() => handleOpen(fundraiser.id)}
            className="card-action-button"
          >
            VIEW MORE
          </button>
        </div>
      </div>

      {/* more details */}
      <Modal
        isOpen={open}
        ariaHideApp={false}
        onRequestClose={() => setOpen(false)}
        className="react-modal"
        closeTimeoutMS={600}
      >
        <div className="modal">
          <h2 className="modal-title">Donate to {fundName}</h2>
          <div className="modal-content">
            <div className="modal-content-text">
              <img
                src={imageURL}
                style={{
                  width: "275px",
                  borderRadius: ".35rem",
                  marginBottom: "2rem",
                }}
              />
              <p
                style={{
                  marginBottom: "2rem",
                }}
              >
                {description}
              </p>

              <div className="donation-input-container">
                <div className="form-control">
                  <span
                    style={{
                      marginRight: "0.25rem",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <p className="eth-value">Eth: {ethAmount}</p>
              </div>

              <button
                className="dontate-btn"
                onClick={submitFunds}
                style={{
                  height: "58px",
                  minWidth: "127px",
                  marginBottom:
                    userDonations?.values?.length === 0 && !isOwner
                      ? "0"
                      : "2rem",
                }}
                disabled={donateLoading}
              >
                {donateLoading ? (
                  <TailSpin width="20" color="#ffffff" />
                ) : (
                  "DONATE"
                )}
              </button>

              {userDonations?.values?.length >= 1 && (
                <div
                  className="donations"
                  style={{
                    marginBottom: isOwner ? "2rem" : "0",
                  }}
                >
                  {renderDonationsList()}
                </div>
              )}

              {isOwner && (
                <div>
                  <div
                    className="form-control"
                    style={{
                      marginBottom: "1rem",
                    }}
                  >
                    <label>Beneficiary:</label>
                    <input
                      value={beneficiary}
                      onChange={(e) => setNewBeneficiary(e.target.value)}
                      placeholder="Set Beneficiary"
                      style={{
                        marginLeft: "0.5rem",
                      }}
                    />
                  </div>

                  <button
                    style={{
                      height: "58px",
                      minWidth: "192px",
                    }}
                    className="set-beneficiary-btn"
                    onClick={setBeneficiary}
                    disabled={beneficiaryLoading}
                  >
                    {beneficiaryLoading ? (
                      <TailSpin width="20" color="#ffffff" />
                    ) : (
                      "SET BENEFICIARY"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="modal-actions">
            <button
              className="modal-action-button"
              onClick={handleClose}
              color="primary"
            >
              CANCEL
            </button>
            {isOwner && (
              <button className="modal-action-button" onClick={withdrawalFunds}>
                WITHDRAWAL
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FundraiserCard;
