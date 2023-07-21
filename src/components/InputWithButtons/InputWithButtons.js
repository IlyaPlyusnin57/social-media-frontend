import React from "react";
import "./InputWithButtons.scss";

function InputWithButtons({
  inputPlaceholder,
  editValue,
  handleChangeInput,
  handleCancel,
  isDisabled,
  finishEditing,
  actionType,
}) {
  return (
    <>
      <input
        type="text"
        placeholder={inputPlaceholder}
        ref={editValue}
        onChange={handleChangeInput}
      />
      <div className="edit-buttons">
        <button className="button" onClick={handleCancel}>
          Cancel
        </button>
        <button
          className="button"
          onClick={finishEditing}
          disabled={isDisabled}
        >
          {actionType}
        </button>
      </div>
    </>
  );
}

export default InputWithButtons;
