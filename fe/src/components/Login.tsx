import { useState } from "react";
import { SquareParking } from "lucide-react";

type LoginProps = {
  onBack: () => void;
  onLogin: (role: string) => void;
};

export function Login({ onBack, onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const baseUrls = [
      process.env.NEXT_PUBLIC_API_URL,
      "http://localhost:8081",
      "http://localhost:8080",
    ].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

    let payload: any = null;
    let lastError = "Dang nhap that bai!";

    for (const baseUrl of baseUrls) {
      try {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        payload = await response.json();
        if (response.ok && payload?.access_token) {
          break;
        }

        lastError =
          payload && typeof payload === "object" && "message" in payload
            ? String(payload.message)
            : "Dang nhap that bai!";
      } catch (_error) {
        lastError = "Khong the ket noi den server.";
      }
    }

    if (!payload?.access_token) {
      alert(lastError);
      return;
    }

    localStorage.setItem("token", payload.access_token);
    localStorage.setItem("userId", payload.user.id);
    localStorage.setItem("fullName", payload.user.fullName);
    localStorage.setItem("universityId", payload.user.universityId);

    switch (payload.user.role) {
      case "ADMIN":
        onLogin("admin");
        break;
      case "OPERATOR":
        onLogin("operator");
        break;
      default:
        onLogin("student");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <SquareParking className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">He thong Bai Xe Thong Minh</h1>
          <p className="text-gray-600">HCMUT Smart Parking System</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleLogin();
          }}
        >
          <input
            type="text"
            placeholder="Ten dang nhap"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
          />

          <input
            type="password"
            placeholder="Mat khau"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg"
          >
            Dang nhap
          </button>
        </form>

        <button
          onClick={onBack}
          className="mt-4 hover:underline hover:cursor-pointer hover:text-blue-600"
        >
          Quay lai
        </button>
      </div>
    </div>
  );
}
