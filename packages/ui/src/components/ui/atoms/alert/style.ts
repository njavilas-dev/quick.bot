import { alertAnatomy } from "@chakra-ui/anatomy";
import {
  createMultiStyleConfigHelpers,
  type StyleFunctionProps,
} from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(alertAnatomy.keys);

const statusToColor: Record<string, string> = {
  info: "blue",
  success: "green",
  warning: "orange",
  error: "red",
};

const baseStyle = definePartsStyle((props: StyleFunctionProps) => {
  const scheme = statusToColor[props.status ?? "info"];

  return {
    container: {
      bg: `${scheme}.50`,
      borderRadius: "md",

      "& a": {
        color: `${scheme}.700`,
        fontWeight: "semibold",
        textDecoration: "underline",
        _hover: { color: `${scheme}.900` },
      },

      "& .chakra-button": {
        bg: `${scheme}.600`,
        color: "white",
        _hover: { bg: `${scheme}.700` },
        _active: { bg: `${scheme}.800` },
      },
    },
    icon: { color: `${scheme}.600` },
  };
});

export const Alert = defineMultiStyleConfig({ baseStyle });