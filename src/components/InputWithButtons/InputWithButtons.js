import React from "react";
import "./InputWithButtons.scss";

function InputWithButtons({
  inputPlaceholder,
  inputRef,
  handleChangeInput,
  handleCancel,
  isDisabled,
  handleAction,
  actionType,
}) {
  function handleKeyPress(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAction();
    }
  }

  return (
    <>
      <input
        type="text"
        placeholder={inputPlaceholder}
        ref={inputRef}
        onChange={handleChangeInput}
        onKeyDown={handleKeyPress}
      />
      <div className="edit-buttons">
        <button className="button" onClick={handleCancel}>
          Cancel
        </button>
        <button className="button" onClick={handleAction} disabled={isDisabled}>
          {actionType}
        </button>
      </div>
    </>
  );
}

export default InputWithButtons;
