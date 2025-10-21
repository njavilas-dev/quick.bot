import React from "react";

import { Icon, IconProps as IconPropsOriginal } from "@chakra-ui/icon";

import { RemixiconComponentType } from "@remixicon/react";

export type IconProps = IconPropsOriginal & { size?: string };

export type IconComponentType = React.ElementType<IconProps>;

export const wrapIcon = (IconComponent: RemixiconComponentType) => {
  const WrappedIcon = ({ size, ...props }: IconProps) => <Icon as={IconComponent} fontSize={size} {...props} justifyContent="center" alignContent="center" />;
  WrappedIcon.displayName = `${IconComponent.displayName || IconComponent.name}`;
  return WrappedIcon;
}
