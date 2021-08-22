import React from "react";
import classes from "./Card.module.css";

const Card = props => {
  return (
    <div
      className={`${props.className} ${classes["card"]} ${props.border ? classes["border"] : ""} ${
        props.flat ? classes["flat"] : ""
      } ${props.className}`}
    >
      {props.children}
    </div>
  );
};

export default Card;
