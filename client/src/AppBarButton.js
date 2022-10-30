import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

const AppBarButton = ({ icon, className, children, ...props }) => {
  return (
    <button className={clsx("appbar-button", className)} {...props}>
      {icon && (
        <span>
          <FontAwesomeIcon icon={icon} />
        </span>
      )}
      {children}
    </button>
  );
};

export default AppBarButton;
