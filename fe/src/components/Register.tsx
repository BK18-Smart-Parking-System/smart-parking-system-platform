import { useState } from "react";
import { SquareParking } from "lucide-react";

export function Register({ onBack }: { onBack: () => void }) {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [role, setRole] = useState("STUDENT");
	const [universityId, setUniversityId] = useState("");

	const handleRegister = () => {
		fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, email, password, fullName, role, universityId }),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.message === "Đăng ký thành công") {
					alert("Đăng ký thành công! Vui lòng đăng nhập.");
					onBack(); // Quay lại trang login sau khi đăng ký thành công
				} else {
					alert("Đăng ký thất bại: " + (data.message || "Vui lòng thử lại!"));
				}
			})
	};

	return (
		<div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
				<div className="text-center mb-8">
				<div className="inline-flex items-center justify-center w-24 h-24 bg-blue-600 rounded-full mb-4">
					<img src="../hcmut.png" alt="Logo" width="60" height="60" />
				</div>
				<h1 className="text-gray-900 mb-2">HCMUT Smart Parking System</h1>
				</div>

				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						handleRegister();
					}}
				>

					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)} // gán state
						className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
					/>
					<input
						type="text"
						placeholder="Tên đăng nhập"
						value={username}
						onChange={(e) => setUsername(e.target.value)} // gán state
						className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
					/>

					<input
						type="password"
						placeholder="Mật khẩu"
						value={password}
						onChange={(e) => setPassword(e.target.value)} // gán state
						className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>

					<input
						type="text"
						placeholder="Họ và tên"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)} // gán state
						className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
					/>

					<input
						type="text"
						placeholder="Mã số sinh viên / Mã cán bộ"
						value={universityId}
						onChange={(e) => setUniversityId(e.target.value)} // gán state
						className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
					/>

					<select
						value={role}
						onChange={(e) => setRole(e.target.value)} // gán state
						className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 appearance-none focus:ring-blue-600 mb-4"
					>
						<option value="STUDENT">Sinh viên</option>
						<option value="STAFF">Giảng viên</option>
					</select>

					<button
						type="submit"
						className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg"
					>
						Đăng ký
					</button>
				</form>

				<button onClick={onBack} className="mt-4 hover:underline hover:cursor-pointer hover:text-blue-600">
					&larr; Quay lại
				</button>
			</div>
		</div>
	);
}