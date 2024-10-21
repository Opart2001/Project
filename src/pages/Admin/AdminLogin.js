import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import BGDS6 from "../../assets/BGDS6.png";

function AdminLogin() {
    const [phone, setPhone] = useState();
    const [pass, setPass] = useState();

    const navigate = useNavigate();

    const handleSignIn = async () => {
        try {
            const payload = {
                phone: phone,
                pass: pass,
            };
            await axios
                .post(config.api_path + "/admin/signin", payload)
                .then((res) => {
                    if (res.data.message === "success") {
                        Swal.fire({
                            title: "Sign In",
                            text: "เข้าสู่ระบบ",
                            icon: "success",
                            timer: 2000,
                        });
                        localStorage.setItem(config.token_name, res.data.token);

                        navigate("/AdminAdd");
                    } else {
                        Swal.fire({
                            title: "Sign In",
                            text: "ไม่พบข้อมูลในระบบ",
                            icon: "warning",
                            timer: 2000,
                        });
                    }
                })
                .catch((err) => {
                    throw err.response.data;
                });
        } catch (e) {
            Swal.fire({
                title: "ERROR",
                text: e.message,
                icon: "error",
            });
        }
    };

    return (
        <div
            className="login-container"
            style={{
                backgroundImage: `url(${BGDS6})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div className="card container">
                <div className="card-header">
                    <div className="card-title">Admin Login</div>
                </div>
                <div className="card-body">
                    <div className="mt-3">
                        <label>Phone</label>
                        <input
                            onChange={(e) => setPhone(e.target.value)}
                            className="form-control"
                        />
                    </div>

                    <div className="mt-3">
                        <label>Password</label>
                        <input
                            onChange={(e) => setPass(e.target.value)}
                            type="password"
                            className="form-control"
                        />
                    </div>

                    <div className="mb-3 mt-3">
                        <button onClick={handleSignIn} className="btn btn-primary">
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
