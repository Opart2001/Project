import { useState } from "react";
import axios from 'axios';
import config from "../config";
import Modal from "../components/Modal";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // นำเข้า Font Awesome
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'; // นำเข้าไอคอนตา
import maoyang from '../assets/maoyang.png';
import BGDSB from '../assets/BGDSB.png';
import './Css/StartCss.css';

function Start() {
    const [name, setName] = useState();
    const [phone, setPhone] = useState();
    const [email, setEmail] = useState();
    const [sex, setSex] = useState();
    const [pass, setPass] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [showPassword, setShowPassword] = useState(false); // State สำหรับการแสดง/ซ่อนรหัสผ่าน

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        // ตรวจสอบว่า รหัสผ่านมีอย่างน้อย 8 ตัวอักษร
        if (pass && pass.length < 8) {
            Swal.fire({
                title: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัว',
                icon: 'error',
            });
            return; 
        }

        // ตรวจสอบว่ารหัสผ่านและยืนยันรหัสผ่านตรงกัน
        if (pass !== confirmPassword) {
            Swal.fire({
                title: 'รหัสผ่านไม่ตรงกัน',
                icon: 'error',
            });
            return; // หยุดการทำงานถ้ารหัสผ่านไม่ตรงกัน
        }

        try {
            Swal.fire({
                title: 'ยืนยันการสมัครสมาชิก',
                text: 'โปรดยืนยันการสมัครสมาชิก',
                icon: 'question',
                showCancelButton: true,
                showConfirmButton: true
            }).then(res => {
                if (res.isConfirmed) {
                    const payload = { name, phone, email, sex, pass };
                    axios.post(config.api_path + '/member/memberRegister', payload).then(res => {
                        if (res.data.message === 'success') {
                            Swal.fire({
                                title: 'บันทึกข้อมูล',
                                text: 'บันทึกข้อมูลการสมัครแล้ว',
                                icon: 'success',
                                timer: 2000
                            });
                            document.getElementById('btnModalClose').click();
                            navigate('/login');
                        }
                    }).catch(err => {
                        throw err.response.data;
                    });
                }
            });

        } catch (e) {
            Swal.fire({
                title: "ERROR",
                message: e.message,
                icon: 'error',
            });
        }
    }

    return (
        <>
            <div className="login-container" style={{ backgroundImage: `url(${BGDSB})`, backgroundSize: "cover", backgroundPosition: "center", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="vh-100 d-flex align-items-center justify-content-center ">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-md-6 order-md-1">
                                <img src={maoyang} alt="Mao Yang Logo" style={{ maxWidth: '100%', height: 'auto', borderRight: '2px solid #FFCC33', paddingRight: '20px' }} />
                            </div>
                            <div className="col-md-6 order-md-2">
                                <h1 className="titleMao">MAOYANG, The Best</h1>
                                <h1>Flavor For You</h1>
                                <h2 style={{ textAlign: 'left' }}>
                                    Area for drinkers a source for beverage products with a wide selection of products to choose from.
                                </h2>
                                <div className="mt-3 d-flex justify-content-center button-group">
                                    <button onClick={Modal} data-bs-toggle="modal" data-bs-target="#modalRegister" className="btn btn-custom">สมัครสมาชิก</button>
                                    <button onClick={() => navigate('/login')} className="btn btn-custom">เข้าสู่ระบบ</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Modal id="modalRegister" title="สมัครใช้บริการ">
                        <form onSubmit={handleRegister}>
                            <div>
                                <div>ชื่อ <span style={{ color: 'red' }}>{name ? '' : '*'}</span></div>
                                <input className="form-control" onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="mt-3">
                                <div>เบอร์โทร <span style={{ color: 'red' }}>{phone ? '' : '*'}</span></div>
                                <input className="form-control" onChange={e => setPhone(e.target.value)} />
                            </div>
                            <div className="mt-3">
                                <div>อีเมล <span style={{ color: 'red' }}>{email ? '' : '*'}</span></div>
                                <input className="form-control" onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div className="mt-3">
                                <div>เพศ <span style={{ color: 'red' }}>{sex ? '' : '*'}</span></div>
                                <div className="radio-group">
                                    <input type="radio" id="male" name="gender" value="male" onChange={() => setSex('ชาย')} />
                                    <label htmlFor="male">ชาย</label>
                                </div>
                                <div className="radio-group">
                                    <input type="radio" id="female" name="gender" value="female" onChange={() => setSex('หญิง')} />
                                    <label htmlFor="female">หญิง</label>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div>รหัสผ่าน <span style={{ color: 'red' }}>{pass ? '' : '*'}</span></div>
                                <div className="input-group">
                                    <input type={showPassword ? 'text' : 'password'} className="form-control" onChange={e => setPass(e.target.value)} />
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} /> {/* ใช้ไอคอนตา */}
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div>ยืนยันรหัสผ่าน <span style={{ color: 'red' }}>{confirmPassword ? '' : '*'}</span></div>
                                <div className="input-group">
                                    <input type={showPassword ? 'text' : 'password'} className="form-control" onChange={e => setConfirmPassword(e.target.value)} />
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} /> {/* ใช้ไอคอนตา */}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <button className="btn btn-primary mt-3" type="submit">
                                    ยืนยันการสมัคร
                                    <i className="fa fa-arrow-right " style={{ marginLeft: '10px' }}></i>
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </div>
        </>
    );
}

export default Start;
