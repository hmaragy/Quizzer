import classes from "./NotifMsg.module.css";

const Error = props => {
  return (
    <div
      className={`${classes["error"]} ${props.notif ? classes["show-notif"] : ""} ${
        props.error ? classes["show-error"] : ""
      }`}
    >
      {props.error || props.notif}
    </div>
  );
};

export default Error;
