// src/app/editor/config.tsx
// tells puck which components exist, what is editable, and how it renders

import type { Config, Slot } from "@puckeditor/core";
import {
  Button,
  CodeBlock,
  CodeInline,
  Column,
  Container,
  dracula,
  Heading,
  Hr,
  Img,
  Link,
  Markdown,
  Row,
  Section,
  Text,
} from "@react-email/components";

type Components = {
  HeadingBlock: { text: string; color: string };
  TextBlock: {text: string; fontSize: 10 | 11 | 13 | 18; fontFamily: string}; // font size in pt, fontFamily is a css font stack
  ButtonBlock: { text: string; href: string; backgroundColor: string; color: string };
  LinkBlock: { text: string; href: string; color: string };
  ImageBlock: { src: string; alt: string; width: number };
  DividerBlock: { color: string };
  ContainerBlock: { content: Slot; backgroundColor: string };
  SectionBlock: { content: Slot; backgroundColor: string; padding: number };
  ColumnsBlock: { left: Slot; right: Slot };
  CodeInlineBlock: { code: string };
  CodeBlockBlock: { code: string; language: "javascript" | "typescript" | "html" | "css" | "json" };
  MarkdownBlock: { markdown: string };
};

export const config: Config<Components> = {
  // wraps every block: keeps the email ~800px wide and centered, in the editor and the sent email
  root: {
    render: ({ children }) => (
      <Container
        align="left"
        style={{
          maxWidth: "800px",
          width: "100%",
          margin: "0",
          textAlign: "left",
        }}
      >
        {children}
      </Container>
    ),
  },
  components: {
    HeadingBlock: {
      fields: {
        text: { type: "text" },
        color: { type: "text" },
      },
      defaultProps: { text: "Hello", color: "#000000"},
      render: ({ text, color }) => (
        // explicit size/weight: tailwind's css reset makes headings inherit normal text size in the editor
        <Heading style = {{textAlign: "left", color: color, fontSize: "24pt", fontWeight: "bold" }}>{text}</Heading>
      ),
    },

    TextBlock: {
        fields: {
          text: { type: "text" },
          fontSize: {
            type: "select",
            label: "Text size",
            options: [
              { label: "Small", value: 10 },
              { label: "Normal", value: 11 },
              { label: "Large", value: 13 },
              { label: "Huge", value: 18 },
            ],
          },
          // each font falls back to arial if the reader's device doesn't have it
          fontFamily: {
            type: "select",
            label: "Font",
            options: [
              { label: "Arial", value: "Arial, sans-serif" },
              { label: "Comic Sans MS", value: "'Comic Sans MS', Arial, sans-serif" },
              { label: "Georgia", value: "Georgia, Arial, sans-serif" },
              { label: "Garamond", value: "Garamond, Arial, sans-serif" },
              { label: "Tahoma", value: "Tahoma, Arial, sans-serif" },
              { label: "Times New Roman", value: "'Times New Roman', Arial, sans-serif" },
              { label: "Verdana", value: "Verdana, Arial, sans-serif" },
            ],
          }
        },
        defaultProps: {text: "Hello", fontSize: 11, fontFamily: "Arial, sans-serif"},
        render: ({ text, fontSize, fontFamily }) => (
            <Text
              style={{
                textAlign: "left",
                fontSize: `${fontSize}pt`,
                fontFamily: fontFamily ?? "Arial, sans-serif",
              }}
            >
              {text}
            </Text>
          ),
      },

    ButtonBlock: {
      fields: {
        text: { type: "text" },
        href: { type: "text" },
        backgroundColor: { type: "text" },
        color: { type: "text" },
      },
      defaultProps: { text: "Click me", href: "https://example.com", backgroundColor: "#000000", color: "#ffffff" },
      render: ({ text, href, backgroundColor, color }) => (
        <Button href={href} style={{ backgroundColor, color, padding: "12px 20px", borderRadius: 4 }}>
          {text}
        </Button>
      ),
    },

    LinkBlock: {
      fields: {
        text: { type: "text" },
        href: { type: "text" },
        color: { type: "text" },
      },
      defaultProps: { text: "Visit our site", href: "https://example.com", color: "#2563eb" },
      render: ({ text, href, color }) => (
        <Link href={href} style={{ color }}>{text}</Link>
      ),
    },

    ImageBlock: {
      fields: {
        src: { type: "text" },
        alt: { type: "text" },
        width: { type: "number" },
      },
      defaultProps: { src: "https://placehold.co/600x200", alt: "", width: 600 },
      render: ({ src, alt, width }) => (
        <Img src={src} alt={alt} width={width} style={{ maxWidth: "100%", margin: "0 auto" }} />
      ),
    },

    DividerBlock: {
      fields: {
        color: { type: "text" },
      },
      defaultProps: { color: "#e5e7eb" },
      render: ({ color }) => (
        <Hr style={{ borderColor: color }} />
      ),
    },

    ContainerBlock: {
      fields: {
        content: { type: "slot" },
        backgroundColor: { type: "text" },
      },
      defaultProps: { content: [], backgroundColor: "#ffffff" },
      render: ({ content: Content, backgroundColor }) => (
        <Container style={{ backgroundColor }}>
          <Content />
        </Container>
      ),
    },

    SectionBlock: {
      fields: {
        content: { type: "slot" },
        backgroundColor: { type: "text" },
        padding: { type: "number" },
      },
      defaultProps: { content: [], backgroundColor: "#ffffff", padding: 16 },
      render: ({ content: Content, backgroundColor, padding }) => (
        <Section style={{ backgroundColor, padding }}>
          <Content />
        </Section>
      ),
    },

    ColumnsBlock: {
      fields: {
        left: { type: "slot" },
        right: { type: "slot" },
      },
      defaultProps: { left: [], right: [] },
      render: ({ left: Left, right: Right }) => (
        <Row>
          <Column style={{ width: "50%", verticalAlign: "top" }}><Left /></Column>
          <Column style={{ width: "50%", verticalAlign: "top" }}><Right /></Column>
        </Row>
      ),
    },

    CodeInlineBlock: {
      fields: {
        code: { type: "text" },
      },
      defaultProps: { code: "npm install" },
      render: ({ code }) => (
        <Text><CodeInline>{code}</CodeInline></Text>
      ),
    },

    CodeBlockBlock: {
      fields: {
        code: { type: "textarea" },
        language: {
          type: "select",
          options: [
            { label: "JavaScript", value: "javascript" },
            { label: "TypeScript", value: "typescript" },
            { label: "HTML", value: "html" },
            { label: "CSS", value: "css" },
            { label: "JSON", value: "json" },
          ],
        },
      },
      defaultProps: { code: "const hello = \"world\";", language: "javascript" },
      render: ({ code, language }) => (
        <CodeBlock code={code} language={language} theme={dracula} />
      ),
    },

    MarkdownBlock: {
      fields: {
        markdown: { type: "textarea" },
      },
      defaultProps: { markdown: "**Bold**, _italic_ and [a link](https://example.com)" },
      render: ({ markdown }) => (
        <Markdown>{markdown}</Markdown>
      ),
    },
  },
};

// small default padding around every block, added once here instead of in each render
// (the editor and the sent email both use these render functions, so both get it)
for (const block of Object.values(config.components)) {
  const render = block.render as (props: object) => React.ReactNode;
  (block as { render: unknown }).render = (props: object) => (
    <div style={{ padding: "8px" }}>{render(props)}</div>
  );
}





