import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Define the types for the props
interface RichTextEditorProps {
  initialValue?: string; // initial value of the editor, can be undefined
  onChange?: (value: string) => void; // callback function when the value changes
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialValue, onChange }) => {
  const [value, setValue] = useState<string>(initialValue || '');

  const handleChange = (value: string) => {
    setValue(value);
    if (onChange) onChange(value); // Optionally, call onChange if passed
  };

  return <ReactQuill theme="snow" value={value} onChange={handleChange} />;
};

export default RichTextEditor;
