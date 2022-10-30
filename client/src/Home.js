import React, { useState, useEffect, useContext, useRef } from "react";
import { TailSpin } from "react-loader-spinner";
import FundraiserCard from "./FundraiserCard";
import Web3Context from "./context/Web3Context";
import toast from "react-hot-toast";

import FactoryContract from "./contracts/FundraiserFactory.json";

const Home = () => {
  const [funds, setFunds] = useState([]);
  const hasFetchedFunds = useRef(false);
  const web3 = useContext(Web3Context);

  useEffect(() => {
    const init = async () => {
      try {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = FactoryContract.networks[networkId];
        const instance = new web3.eth.Contract(
          FactoryContract.abi,
          deployedNetwork && deployedNetwork.address
        );

        const funds = await instance.methods.fundraisers(15, 0).call();

        hasFetchedFunds.current = true;

        setFunds(funds);
      } catch (error) {
        toast.error(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
      }
    };

    web3 && init();
  }, [web3]);

  const displayFundraisers = () => {
    return funds.length >= 1 ? (
      <>
        <h1 className="heading">Fundraisers</h1>
        <div className="cards-container">
          {funds.map((fundraiser) => {
            const values = Object.values(fundraiser);
            const address = values.slice(0, values.length - 1).join("");

            return (
              <FundraiserCard
                fundraiser={web3.utils.toChecksumAddress(fundraiser)}
                key={address}
              />
            );
          })}
        </div>
      </>
    ) : (
      <p>No fundraiser is currently accepting donations.</p>
    );
  };

  return (
    <div className="main-container">
      {web3 && hasFetchedFunds.current ? (
        displayFundraisers()
      ) : (
        <div>
          <TailSpin width="40" color="#49796f" />
        </div>
      )}
    </div>
  );
};

export default Home;
