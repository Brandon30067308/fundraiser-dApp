import { useLocation } from "react-router-dom";

const Error = ({ children }) => {
  const location = useLocation();

  const error = location.state.error;

  return (
    <>
      <p className="error">{error ?? "An error occurred"}</p>
      {children}
    </>
  );
};

export default Error;
