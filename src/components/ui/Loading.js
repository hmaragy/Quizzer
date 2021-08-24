import classes from "./Loading.module.css";

const Loading = props => {
  return (
    <div className={classes["loading-wrapper"]}>
      <div className={props.loading ? classes["loading"] : ""}></div>
    </div>
  );
};

export default Loading;
