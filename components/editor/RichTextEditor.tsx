import dynamic from 'next/dynamic';
import { useState } from 'react';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill so it's only loaded on the client.
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface RichTextEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialValue, onChange }) => {
  const [value, setValue] = useState<string>(initialValue || '');

  const handleChange = (value: string) => {
    setValue(value);
    if (onChange) onChange(value);
  };

  return <ReactQuill theme="snow" value={value} onChange={handleChange} />;
};

export default RichTextEditor;
