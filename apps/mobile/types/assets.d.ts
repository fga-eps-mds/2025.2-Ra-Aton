declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";

// Substitua a linha antiga do SVG por isso:
declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}