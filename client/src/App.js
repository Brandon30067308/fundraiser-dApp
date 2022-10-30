import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import AppBarButton from "./AppBarButton";
import NewFundraiser from "./NewFundraiser";
import Home from "./Home";
import Receipts from "./Receipts";
import Error from "./Error";
import Web3Context from "./context/Web3Context";
import toast, { Toaster } from "react-hot-toast";
import getWeb3 from "./utils/getWeb3";

import "./App.css";

import FactoryContract from "./contracts/FundraiserFactory.json";

const App = () => {
  const [state, setState] = useState({
    web3: null,
    accounts: null,
    contract: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();

        const accounts = await web3.eth.getAccounts();

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = FactoryContract.networks[networkId];
        const instance = new web3.eth.Contract(
          FactoryContract.abi,
          deployedNetwork && deployedNetwork.address
        );

        setState({ web3, accounts, contract: instance });
      } catch (err) {
        navigate("/error", {
          state: {
            error:
              "Failed to load web3, accounts, or contract. Check console for details.",
          },
        });
        toast.error(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(err);
      }
    };

    init();
  }, []);

  return (
    <div>
      <Web3Context.Provider value={state.web3}>
        <div className="app-bar">
          <NavLink className="nav-link" to="/">
            <AppBarButton title="Home">Home</AppBarButton>
          </NavLink>
          <NavLink className="nav-link" to="/new/">
            <AppBarButton
              title="Create a fundraiser"
              className="toolbar-button"
            >
              New
            </AppBarButton>
          </NavLink>
        </div>

        <div className="app-body">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/new/" element={<NewFundraiser />} />
            <Route path="/receipts/" element={<Receipts />} />
            <Route path="/error/" element={<Error></Error>} />
          </Routes>
        </div>

        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              fontSize: "14px",
              color: "#191919",
            },
          }}
        />
      </Web3Context.Provider>
    </div>
  );
};

export default App;
