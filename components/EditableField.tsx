import React, { useState, useEffect, useRef } from 'react';

type EditableFieldProps = {
  initialValue: string | number;
  onSave: (newValue: string) => void;
  as?: React.ElementType;
  className?: string;
  inputClassName?: string;
  type?: 'text' | 'date' | 'datetime-local' | 'number';
};

const EditableField: React.FC<EditableFieldProps> = ({
  initialValue,
  onSave,
  as: Component = 'span',
  className = '',
  inputClassName = '',
  type = 'text',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(String(initialValue));
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(String(initialValue));
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // For input elements, select the text
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    // Only call onSave if value has actually changed
    if (String(initialValue) !== value) {
      onSave(value);
    }
    setIsEditing(false);
  };
  
  const isTextarea = Component === 'div' || (typeof initialValue === 'string' && initialValue.includes('\n'));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTextarea && type !== 'datetime-local') {
        e.preventDefault(); // Prevent form submission if inside one
        handleSave();
    } else if (e.key === 'Escape') {
      setValue(String(initialValue));
      setIsEditing(false);
    }
  };

  if (isEditing) {
    const commonProps = {
        value: value,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value),
        onBlur: handleSave,
        onKeyDown: handleKeyDown,
        className: `w-full h-full bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 rounded-md ${inputClassName}`
    };

    if (isTextarea) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          {...commonProps}
          rows={Math.max(3, String(value).split('\n').length + 1)}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        {...commonProps}
      />
    );
  }
  
  const displayValue = (type === 'datetime-local' && typeof value === 'string' && value)
    ? value.replace('T', ' ')
    : value;

  return (
    <Component
      onDoubleClick={() => setIsEditing(true)}
      className={`${className} transition-colors cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-500/10 rounded-md p-1 -m-1`}
      title="Double-click to edit"
      style={ isTextarea ? { whiteSpace: 'pre-wrap', minHeight: '1.5em' } : {}}
    >
      {displayValue || <span className="text-gray-400 dark:text-slate-500">(empty)</span>}
    </Component>
  );
};

export default EditableField;
