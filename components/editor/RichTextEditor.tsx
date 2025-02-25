import React, { useCallback, useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Button, Group, Paper, NumberInput, Select } from "@mantine/core";

interface RichTextEditorProps {
  initialValue: string;
  onChange: (content: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialValue, onChange }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [tableWidth, setTableWidth] = useState("100%");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link,
      Underline,
      Highlight,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Heading.configure({ levels: [1, 2, 3] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: initialValue,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external changes to the editor
  useEffect(() => {
    if (editor && initialValue !== editor.getHTML()) {
      editor.commands.setContent(initialValue);
    }
  }, [initialValue, editor]);

  const addImage = useCallback(() => {
    if (!editor) {
      console.error("Editor instance not found.");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/file-system/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        console.log("Upload response:", data);

        if (response.ok && data.thumbnailPath) {
          const imageUrl = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${data.webpPath}`;
          console.log("Inserting image:", imageUrl);

          editor.chain().focus().setImage({ src: imageUrl }).run();
        } else {
          console.error("Image upload failed:", data);
        }
      } catch (error) {
        console.error("Image upload error:", error);
      }
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <Paper shadow="xs" radius="md" p="md" withBorder>
      {/* Toolbar */}
      <Group spacing="xs" position="left" mb="sm">
        <Button size="xs" variant="light" onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </Button>
        <Button size="xs" variant="light" onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </Button>
        <Button size="xs" variant="light" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          Underline
        </Button>
        <Button size="xs" variant="light" onClick={() => editor.chain().focus().toggleStrike().run()}>
          Strike
        </Button>
        <Button size="xs" variant="light" onClick={() => editor.chain().focus().toggleHighlight().run()}>
          Highlight
        </Button>
        <Button size="xs" variant="light" onClick={() => editor.chain().focus().setColor("red").run()}>
          Red
        </Button>
        <Button size="xs" variant="light" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </Button>
        <Button size="xs" variant="light" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Button>
        <Button size="xs" variant="light" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          Bullet List
        </Button>
        <Button size="xs" variant="light" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          Ordered List
        </Button>
        <Button size="xs" variant="light" onClick={addImage}>Image</Button>
      </Group>

      {/* Table Controls */}
      <Group className="table-toolbar">
        <NumberInput
          value={rows}
          onChange={(value) => setRows(value ?? 1)}
          label="Rows"
          min={1}
          max={10}
          size="xs"
          w={70}
        />
        <NumberInput
          value={cols}
          onChange={(value) => setCols(value ?? 1)}
          label="Columns"
          min={1}
          max={10}
          size="xs"
          w={80}
        />
        <Select
          value={tableWidth}
          onChange={(value) => setTableWidth(value ?? "100%")} // Ensures a valid string
          data={["50%", "75%", "100%"]}
          label="Table Width"
          size="xs"
          w={120}
        />

        <Button size="xs" onClick={() => editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()}>Insert Table</Button>
        <Button size="xs" onClick={() => editor.chain().focus().addRowAfter().run()}>Add Row</Button>
        <Button size="xs" onClick={() => editor.chain().focus().addColumnAfter().run()}>Add Column</Button>
        <Button size="xs" onClick={() => editor.chain().focus().mergeCells().run()}>Merge Cells</Button>
        <Button size="xs" onClick={() => editor.chain().focus().splitCell().run()}>Unmerge Cells</Button>
        <Button size="xs" onClick={() => editor.chain().focus().deleteTable().run()}>Delete Table</Button>
      </Group>

      {/* Editor Content */}
      <EditorContent editor={editor} className="tiptap" />
    </Paper>
  );
};

export default RichTextEditor;
