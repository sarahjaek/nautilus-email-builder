// src/app/editor/config.tsx
// tells puck which components exist, what is editable, and how it renders

import type { Config } from "@puckeditor/core";
import { Heading, Text } from "@react-email/components";

type Components = {
  HeadingBlock: { text: string; color: string };
  TextBlock: {text: string; fontSize: number};
};

export const config: Config<Components> = {
  components: {
    HeadingBlock: {
      fields: {
        text: { type: "text" },
        color: { type: "text" },
      },
      defaultProps: { text: "Hello", color: "#000000"},
      render: ({ text, color }) => (
        <Heading style = {{color: color }}>{text}</Heading>
      ),
    },

    TextBlock: {
        fields: {
          text: { type: "text" },
          fontSize: { type: "number"}
        },
        defaultProps: {text: "Hello", fontSize: 3},
        render: ({ text, fontSize }) => (
            <Text style = {{ fontSize: fontSize}}>{text}</Text>
        ),
      },
  },
};





