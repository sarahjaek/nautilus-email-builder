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
  TextBlock: {text: string; fontSize: number};
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
        <Img src={src} alt={alt} width={width} style={{ maxWidth: "100%" }} />
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





