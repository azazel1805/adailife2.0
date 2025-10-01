import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-300 px-4 py-3 rounded-r-lg relative my-4" role="alert">
      <strong className="font-bold">Hata! </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default ErrorMessage;