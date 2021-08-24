import React from "react";
import classes from "./FormButton.module.css";

const Button = props => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      type={props.type}
      className={`${props.className || ""} ${classes["form-submit"]} ${
        props.isLoading ? classes["form-submit--loading"] : ""
      }`}
    >
      {props.children}
    </button>
  );
};

export default Button;
