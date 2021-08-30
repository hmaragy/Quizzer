import React from "react";
import classes from "./Screen.module.css";
const Screen = props => {
  return (
    <div className={classes["screen"]}>
      <div className={classes["screen__toolbar"]}>
        <div className={classes["screen__controls"]}>
          <div className={classes["screen__controls--red"]}></div>
          <div className={classes["screen__controls--yellow"]}></div>
          <div className={classes["screen__controls--green"]}></div>
        </div>
        <div className={classes["screen__title"]}>
          <h2 className={classes["screen_course-name"]} title={props.title}>
            {props.title}
          </h2>
        </div>
        {props.actioned && props.actions && (
          <div className={classes["screen__actions"]}>
            {props.actions.map((action, index) => {
              return (
                <button
                  title={action.title}
                  key={index}
                  className={classes["screen__action-button"]}
                  onClick={action.onClick}
                >
                  {action.icon}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className={classes["screen__content"]}>{props.children}</div>
    </div>
  );
};

export default Screen;
