
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        className="w-full px-3 py-2 text-white bg-base-300 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        {...props}
      />
    </div>
  );
};
