import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Css/AdminAddCss.css';
import config from '../../config';
import TemplateAdmin from "../../components/TemplateAdmin";

function AdminAdd() {
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        type: '',
        location: '',
        size: '',
        quantityInStock: '',
        ingredients: [],
        price: '',
        imageUrl: ''
    });

    const [allIngredients, setAllIngredients] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sendNotification, setSendNotification] = useState(false); // State สำหรับการเลือกการแจ้งเตือน
    const [isSubmitting, setIsSubmitting] = useState(false); // State สำหรับการตรวจสอบสถานะการส่งข้อมูล


    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const response = await axios.get(`${config.api_path}/ingredients`);
                setAllIngredients(response.data);
            } catch (error) {
                console.error('Error fetching ingredients:', error);
            }
        };

        fetchIngredients();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData({
            ...productData,
            [name]: value
        });
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setProductData((prevData) => {
            const updatedIngredients = checked
                ? [...prevData.ingredients, value]
                : prevData.ingredients.filter((ingredient) => ingredient !== value);

            return {
                ...prevData,
                ingredients: updatedIngredients
            };
        });
    };

    const handleDropdownToggle = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleOutsideClick = (e) => {
        if (dropdownOpen && !e.target.closest('.dropdown-container')) {
            setDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [dropdownOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return; // หากกำลังส่งข้อมูลอยู่แล้ว จะไม่ทำอะไรอีก

        setIsSubmitting(true); // ตั้งค่าเป็นกำลังส่งข้อมูล

        const result = await Swal.fire({
            title: 'ยืนยันการเพิ่มสินค้า?',
            text: "คุณต้องการเพิ่มสินค้าตัวนี้หรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, add it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                // ส่งข้อมูลสินค้า
                await axios.post(`${config.api_path}/products/add`, productData);

                // ส่งการแจ้งเตือนถ้าต้องการ
                if (sendNotification) {
                    await axios.post(`${config.api_path}/notifications`, {
                        title: `สินค้าใหม่ : ${productData.name}`,
                        message: `${productData.description}`,
                        type: 'new_product',
                        sendToAll: true
                    });
                }

                Swal.fire({
                    title: 'Success',
                    text: 'Product added successfully',
                    icon: 'success'
                });

                setProductData({
                    name: '',
                    description: '',
                    type: '',
                    location: '',
                    size: '',
                    quantityInStock: '',
                    ingredients: [],
                    price: '',
                    imageUrl: ''
                });

                setSendNotification(false);
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: error.message,
                    icon: 'error'
                });
            } finally {
                setIsSubmitting(false); // รีเซ็ตสถานะการส่งข้อมูล
            }
        } else {
            setIsSubmitting(false); // รีเซ็ตสถานะการส่งข้อมูลถ้าผู้ใช้ยกเลิก
        }
    };


    return (
        <>
            <TemplateAdmin />
            <div className="admin-container">
                <h1>Add New Product</h1>
                <form onSubmit={handleSubmit}>
                    {Object.keys(productData).map((key) => (
                        key !== 'ingredients' ? (
                            <div key={key} className="form-group">
                                <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <input
                                    type="text"
                                    name={key}
                                    value={productData[key]}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                        ) : null
                    ))}

                    <div className="form-group">
                        <label>Ingredients</label>
                        <div className="dropdown-container">
                            <button type="button" className="dropdown-toggle-ingredient" onClick={handleDropdownToggle}>
                                {productData.ingredients.length > 0 ? 'Selected Ingredients' : 'Select Ingredients'}
                            </button>
                            <div className={`dropdown-menu-ingredient ${dropdownOpen ? 'show' : ''}`}>
                                {allIngredients.map((ingredient) => (
                                    <div key={ingredient.id} className="dropdown-item-ingredient">
                                        <label>{ingredient.name}</label>
                                        <input
                                            type="checkbox"
                                            value={ingredient.id}
                                            onChange={handleCheckboxChange}
                                            checked={productData.ingredients.includes(String(ingredient.id))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>



                    <div className="form-group">
                        <input
                            type="checkbox"
                            id="sendNotification"
                            checked={sendNotification}
                            onChange={(e) => setSendNotification(e.target.checked)}
                        />
                        <label htmlFor="sendNotification">Send notification about new product</label>
                    </div>

                    <button type="submit" className="confirm btn-primary">Add Product</button>
                </form>
            </div>
        </>
    );
}

export default AdminAdd;
