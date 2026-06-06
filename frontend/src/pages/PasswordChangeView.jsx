import { KeyRound } from "lucide-react";
import { useState } from "react";

import { changePassword } from "../api";

function PasswordChangeView() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setMessage("비밀번호가 변경되었습니다.");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="workspace">
      <header className="workspaceHeader">
        <div>
          <p className="eyebrow">계정 보안</p>
          <h1>비밀번호 변경</h1>
        </div>
      </header>

      <form className="passwordForm" onSubmit={handleSubmit}>
        <input
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          placeholder="현재 비밀번호"
          type="password"
          autoComplete="current-password"
        />
        <input
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="변경할 비밀번호"
          type="password"
          autoComplete="new-password"
        />
        <button
          type="submit"
          disabled={isSubmitting || !currentPassword || newPassword.length < 4}
        >
          <KeyRound size={18} />
          변경
        </button>
      </form>

      {message && <div className="success">{message}</div>}

      {errorMessage && (
        <div className="error" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export default PasswordChangeView;
