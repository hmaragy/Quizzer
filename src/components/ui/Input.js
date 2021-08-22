import React from "react";
import classes from "./Input.module.css";

const Input = props => {
  return (
    <div className={classes["form-group"]}>
      <input
        ref={props.innerRef}
        disabled={props.disabled}
        type={props.type}
        autoComplete={props.autoComplete}
        onChange={props.onChange}
        required
        name={props.name}
        id={props.id}
        value={props.value}
      />
      <label htmlFor={props.id}>{props.label}</label>
    </div>
  );
};

export default Input;
