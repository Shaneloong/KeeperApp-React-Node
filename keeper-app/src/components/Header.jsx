import React from "react";
import HighlightIcon from "@material-ui/icons/Highlight";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

function Header(props) {
  return (
    <header className="d-flex align-items-center">
      <h1>
        <HighlightIcon />
        Keeper
      </h1>
      {(props.isLoggedIn !=="" && props.isLoggedIn !== "undefined") && <div className="ms-auto btn btn-outline-secondary" onClick={props.clicked}>
      <ExitToAppIcon />
      </div>}
      
    </header>
  );
}

export default Header;
