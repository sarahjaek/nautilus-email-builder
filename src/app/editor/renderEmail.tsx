// src/app/editor/renderEmail.tsx
// turns puck data into email html on the server, reusing each block's render function from config
// (puck's own <Render> uses react hooks, which crash inside a next.js route handler)

import type { ComponentData, Data, PuckContext } from "@puckeditor/core";
import { Body, Html, render } from "@react-email/components";
import type { ComponentType, ReactNode } from "react";
import { config } from "./config";

type BlockRender = ComponentType<Record<string, unknown>>;

// puck passes this extra "puck" prop to every render function; these values mean "not in the editor"
const puck: PuckContext = {
  renderDropZone: () => null,
  metadata: {},
  isEditing: false,
  dragRef: null,
};

function renderBlocks(blocks: ComponentData[]): ReactNode {
  return blocks.map((block) => {
    const componentConfig = config.components[block.type as keyof typeof config.components];
    if (!componentConfig) return null; // block type no longer in config, skip it

    const props: Record<string, unknown> = { ...block.props, puck };

    // slot props are stored as a list of nested blocks, but render functions expect
    // a component they can use as <Content />, so swap each list for one
    for (const [name, field] of Object.entries(componentConfig.fields ?? {})) {
      if (field.type === "slot") {
        const nested = (block.props[name] ?? []) as ComponentData[];
        props[name] = () => <>{renderBlocks(nested)}</>;
      }
    }

    const Block = componentConfig.render as unknown as BlockRender;
    return <Block key={block.props.id} {...props} />;
  });
}

export async function renderEmail(data: Data): Promise<string> {
  const content = renderBlocks(data.content ?? []);

  // if config ever gets a root render (e.g. an email-wide background), wrap the blocks in it
  const Root = config.root?.render as BlockRender | undefined;

  return render(
    <Html>
      <Body
        style={{
          margin: 0,
          padding: 0,
          textAlign: "left",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {Root ? <Root {...data.root?.props} puck={puck}>{content}</Root> : content}
      </Body>
    </Html>
  );
}
