import React, { FC } from 'react';
import Blockies from "react-blockies";

export interface BlockieProps {
  address: string,
  size: number,
  scale: number,
}

export const Blockie: FC<BlockieProps> = (props) => {

  if (!props.address || typeof props.address.toLowerCase !== "function") {
    return <span />;
  }

  return <Blockies seed={props.address.toLowerCase()} {...props} />;
};
