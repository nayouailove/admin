import { LogIn } from "lucide-react";
import { useState } from "react";

import { login } from "../api";
import loginImage from "../assets/login.png";

function LoginView({ onLogin }) {
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const user = await login(accountId.trim(), password);
      onLogin(user);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="loginPage">
      <section className="loginBrand" aria-label="서비스 이미지">
        <img className="loginHeroImage" src={loginImage} alt="로고이미지" />
      </section>

      <section className="loginPanel" aria-label="관리자 로그인">
        <form className="loginForm" onSubmit={handleSubmit}>
          <input
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            placeholder="아이디를 입력하세요"
            autoComplete="username"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력하세요"
            type="password"
            autoComplete="current-password"
          />

          {errorMessage && (
            <p className="error" role="alert">
              {errorMessage}
            </p>
          )}

          <button
            className="loginButton"
            type="submit"
            disabled={isSubmitting || !accountId.trim() || !password}
          >
            <LogIn size={18} />
            관리자 로그인
          </button>
        </form>

        <p className="loginHelp">
          로그인에 문의사항 있을 시 contact@iotedcorp.com으로 연락바랍니다.
        </p>
      </section>
    </main>
  );
}

export default LoginView;
