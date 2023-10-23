import React from "react";

export const FillPage = ({
  children,
  backgroundImage,
}: {
  children: React.ReactNode;
  backgroundImage?: string;
}) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      flex: "1 1 auto",
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : ``,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    {children}
  </div>
);
