import React from 'react';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#fffbe6] dark:bg-[#2e3440] rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-2xl font-bold text-cat-frappe-base dark:text-cat-frappe-yellow mb-4">Confirm Delete</h2>
        <p className="text-cat-frappe-surface1 dark:text-cat-frappe-text mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md border border-black bg-cat-frappe-red text-cat-frappe-base text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
