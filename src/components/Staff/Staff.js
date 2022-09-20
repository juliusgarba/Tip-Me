import React from "react";
import BigNumber from "bignumber.js";
import "./Staff.css";

const Staff = ({ tips }) => {
  return (
    <div className="staff">
      <div className="staff-heading">Staff Notification panel</div>
      {tips && (
        <div>
          {tips.length > 0 ? (
            <>
              {" "}
              {tips?.map((tip) => (
                <div className="notification">
                  <span className="noti-highlight">{tip.sender}</span> sent you{" "}
                  <span className="noti-highlight">
                    {new BigNumber(tip.amount).shiftedBy(-18).toString()} CELO
                  </span>{" "}
                  with message "
                  <span className="noti-highlight">{tip.message}</span>" on{" "}
                  <span className="noti-highlight">
                    {new Date(Number(tip.timeStamp * 1000)).toUTCString()}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <div>No tips</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Staff;
