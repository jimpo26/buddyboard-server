import React from "react";
import styled, { css } from "styled-components";
const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 10px;
  cursor: pointer;
  border: 2px solid #202020;
  border-radius: ${props => props.border || 10}px;

  ${props => props.theme === "dark" && css`
      background-color: #202020;
      color: #fff;
    `}
`;
const ButtonTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-family: "Outfit", sans-serif;
`;
const ButtonTitle = styled.span`
  font-size: 12px;
`;
const ButtonStoreName = styled.span`
  font-size: 20px;
  font-weight: bold;
`;
const Button = ({
    theme = "light",
    height = 50,
    width = 180,
    border,
    logo,
    storeName,
    title,
    url,
    className
}) => {
    const Logo = logo;
    return /*#__PURE__*/React.createElement(ButtonContainer, {
        theme: theme,
        border: border,
        className: className,
        style: {
            height,
            width,
            borderRadius: border
        },
        onClick: () => window.open(url, "_blank"),
        title: title,
        url: url
    }, /*#__PURE__*/React.createElement(Logo, null), /*#__PURE__*/React.createElement(ButtonTextContainer, null, /*#__PURE__*/React.createElement(ButtonTitle, null, title), /*#__PURE__*/React.createElement(ButtonStoreName, null, storeName)));
};
export default Button;