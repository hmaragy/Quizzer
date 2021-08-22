import { useEffect } from "react";
import classes from "./Notifications.module.css";

const Notifications = props => {
  useEffect(() => {
    const listener = e => {
      if (!e.target.classList[0]?.includes("notification") && !e.target.innerText?.includes("Notification")) {
        props.onClose();
      }
    };
    document.addEventListener("click", listener);
    return () => {
      document.removeEventListener("click", listener);
    };
  }, []);

  return (
    <>
      {
        <div className={`${classes["notifications"]} ${!props.notifications.length ? classes["loading"] : ""}`}>
          <div className={classes["notification"]}>Your Instructor had accepted you.</div>
          <div className={classes["notification"]}>OPS</div>
          <div className={classes["notification"]}>OPS</div>
          <div className={classes["notification"]}>OPS</div>
          <div className={classes["notification"]}>OPS</div>
          <div className={classes["notification"]}>OPS</div>
        </div>
      }
    </>
  );
};

export default Notifications;
