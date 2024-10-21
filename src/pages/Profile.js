import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from "../config";
import Swal from 'sweetalert2';
import Modal from "../components/Modal";
import './Css/Profilecss.css';
import maoyang from '../assets/maoyang.png';
import { useNavigate } from 'react-router-dom';
import Template from "../components/Template";
import homeCss from './Css/homeCss.css'

function Profile() {
    const [memberData, setMemberData] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [favoriteIngredients, setFavoriteIngredients] = useState([]);
    const [allergicIngredients, setAllergicIngredients] = useState([]);
    const [selectedFavorites, setSelectedFavorites] = useState([]);
    const [selectedAllergies, setSelectedAllergies] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAllergicModalOpen, setIsAllergicModalOpen] = useState(false);
    const [editField, setEditField] = useState(''); // Track which field to edit
    const [newValue, setNewValue] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        fetchIngredients();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(config.api_path + '/member/info', config.headers());
            setMemberData(response.data.result);

            const favoriteResponse = await axios.get(config.api_path + `/member-favorites/${response.data.result.id}`, config.headers());
            setFavoriteIngredients(favoriteResponse.data || []);

            const allergicResponse = await axios.get(`${config.api_path}/member-allergies/${response.data.result.id}`, config.headers());
            setAllergicIngredients(allergicResponse.data || []);
        } catch (error) {
            console.error('Error fetching data:', error.message);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'เกิดข้อผิดพลาดขณะดึงข้อมูล!',
            });
        }
    };

    const fetchIngredients = async () => {
        try {
            const response = await axios.get(config.api_path + '/ingredients', config.headers());
            setIngredients(response.data);
        } catch (error) {
            console.error('Error fetching ingredients:', error.message);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'เกิดข้อผิดพลาดขณะดึงรายการผลไม้!',
            });
        }
    };

    const handleCheckboxChange = (ingredientId, type) => {
        if (type === 'favorite') {
            setSelectedFavorites(prevState =>
                prevState.includes(ingredientId)
                    ? prevState.filter(id => id !== ingredientId)
                    : [...prevState, ingredientId]
            );
        } else if (type === 'allergic') {
            setSelectedAllergies(prevState =>
                prevState.includes(ingredientId)
                    ? prevState.filter(id => id !== ingredientId)
                    : [...prevState, ingredientId]
            );
        }
    };

    const handleSaveIngredients = async (type) => {
        try {
            const ingredientIds = type === 'favorite' ? selectedFavorites : selectedAllergies;

            if (!memberData?.id) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning',
                    text: 'ไม่พบข้อมูลผู้ใช้',
                });
                return;
            }

            await axios.put(config.api_path + (type === 'favorite' ? '/member-favorites' : '/member-allergies'),
                {
                    memberId: memberData.id,
                    [type === 'favorite' ? 'fruits' : 'allergies']: ingredientIds
                },
                config.headers()
            );

            fetchData();
            setIsModalOpen(false);
            setIsAllergicModalOpen(false);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'ข้อมูลถูกอัปเดตเรียบร้อยแล้ว!',
            });
        } catch (error) {
            console.error('Error updating data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'เกิดข้อผิดพลาดขณะอัปเดตข้อมูล!',
            });
        }
    };

    const handleSaveProfileField = async () => {
        try {
            if (!memberData?.id) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Warning',
                    text: 'ไม่พบข้อมูลผู้ใช้',
                });
                return;
            }

            const endpoint = {
                Name: '/member/editName',
                Phone: '/member/editPhone',
                Address: '/member/editAddress',
            }[editField];

            await axios.put(config.api_path + endpoint, { [editField.toLowerCase()]: newValue }, config.headers());
            fetchData();
            setIsModalOpen(false);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'ข้อมูลถูกอัปเดตเรียบร้อยแล้ว!',
            });
        } catch (error) {
            console.error('Error updating data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'เกิดข้อผิดพลาดขณะอัปเดตข้อมูล!',
            });
        }
    };

    return (
        <>
            <div className="home-background">
                <Template />
                <div>
                    <div className="container-profile">
                        {memberData && (
                            <div className="profile-container ">
                                <div className="profile-text">
                                    <div className="profile-card">
                                        <p className="profile-heading">ชื่อ:</p>
                                        <p>{memberData.name}</p>
                                        <button
                                            className={memberData.name ? "edit-button" : "add-button"}
                                            onClick={() => {
                                                setEditField('Name');
                                                setNewValue(memberData.name || '');
                                                setIsModalOpen(true);
                                            }}
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalProfileField"
                                        >
                                            {memberData.name ? 'แก้ไข' : 'เพิ่ม'}
                                        </button>
                                    </div>

                                    <div className="profile-card">
                                        <p className="profile-heading">เบอร์โทร:</p>
                                        <p>{memberData.phone}</p>
                                        <button
                                            className={memberData.phone ? "edit-button" : "add-button"}
                                            onClick={() => {
                                                setEditField('Phone');
                                                setNewValue(memberData.phone || '');
                                                setIsModalOpen(true);
                                            }}
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalProfileField"
                                        >
                                            {memberData.phone ? 'แก้ไข' : 'เพิ่ม'}
                                        </button>
                                    </div>
                                    <div className="profile-card">
                                        <p className="profile-heading">ที่อยู่ :</p>
                                        <p>{memberData.address}</p>
                                        <button
                                            className={memberData.address ? "edit-button" : "add-button"}
                                            onClick={() => {
                                                setEditField('Address');
                                                setNewValue(memberData.address || '');
                                                setIsModalOpen(true);
                                            }}
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalProfileField"
                                        >
                                            {memberData.address ? 'แก้ไข' : 'เพิ่ม'}
                                        </button>
                                    </div>
                                    <div className="profile-card">
                                        <p className="profile-heading">เพศ :</p>
                                        <p>{memberData.sex}</p>
                                    </div>
                                    <div className="profile-card">
                                        <p className="profile-heading">ส่วนผสมที่ชื่นชอบ :</p>
                                        {favoriteIngredients.length > 0 ? (
                                            <ul>
                                                {favoriteIngredients.map(ingredient => (
                                                    <li key={ingredient.id}>{ingredient.name}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>ยังไม่มีข้อมูลผลไม้ที่ชื่นชอบ</p>
                                        )}
                                        <button
                                            className="edit-button"
                                            onClick={() => {
                                                setSelectedFavorites(favoriteIngredients.map(ingredient => ingredient.id));
                                                setIsModalOpen(true);
                                            }}
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalIngredients"
                                        >
                                            แก้ไข
                                        </button>
                                    </div>
                                    <div className="profile-card">
                                        <p className="profile-heading">ส่วนผสมไม้ที่แพ้ :</p>
                                        {allergicIngredients.length > 0 ? (
                                            <ul>
                                                {allergicIngredients.map(ingredient => (
                                                    <li key={ingredient.id}>{ingredient.name}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>ยังไม่มีข้อมูลผลไม้ที่แพ้</p>
                                        )}
                                        <button
                                            className="edit-button"
                                            onClick={() => {
                                                setSelectedAllergies(allergicIngredients.map(ingredient => ingredient.id));
                                                setIsAllergicModalOpen(true);
                                            }}
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalAllergies"
                                        >
                                            แก้ไข
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Modal id="modalProfileField" title={`แก้ไขข้อมูล`}>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => setIsModalOpen(false)}>
                                    ยกเลิก
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveProfileField}>
                                    บันทึก
                                </button>
                            </div>
                        </Modal>

                        <Modal id="modalIngredients" title="เลือกส่วนผสมที่ชื่นชอบ">
                            <div className="modal-body">
                                {ingredients.length > 0 ? (
                                    <div>
                                        {ingredients
                                            .filter(ingredient => !allergicIngredients.some(allergic => allergic.id === ingredient.id))
                                            .map(ingredient => (
                                                <div key={ingredient.id} className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        id={`ingredient-${ingredient.id}`}
                                                        checked={selectedFavorites.includes(ingredient.id)}
                                                        onChange={() => handleCheckboxChange(ingredient.id, 'favorite')}
                                                    />
                                                    <label htmlFor={`ingredient-${ingredient.id}`} className="form-check-label">
                                                        {ingredient.name}
                                                    </label>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p>ยังไม่มีรายการผลไม้</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
                                <button type="button" className="btn btn-primary" onClick={() => handleSaveIngredients('favorite')}>
                                    บันทึก
                                </button>
                            </div>
                        </Modal>

                        <Modal id="modalAllergies" title="เลือกส่วนผสมที่แพ้">
                            <div className="modal-body">
                                {ingredients.length > 0 ? (
                                    <div>
                                        {ingredients
                                            .filter(ingredient => !favoriteIngredients.some(favorite => favorite.id === ingredient.id))
                                            .map(ingredient => (
                                                <div key={ingredient.id} className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        id={`ingredient-${ingredient.id}`}
                                                        checked={selectedAllergies.includes(ingredient.id)}
                                                        onChange={() => handleCheckboxChange(ingredient.id, 'allergic')}
                                                    />
                                                    <label htmlFor={`ingredient-${ingredient.id}`} className="form-check-label">
                                                        {ingredient.name}
                                                    </label>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p>ยังไม่มีรายการผลไม้</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
                                <button type="button" className="btn btn-primary" onClick={() => handleSaveIngredients('allergic')}>
                                    บันทึก
                                </button>
                            </div>
                        </Modal>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;
