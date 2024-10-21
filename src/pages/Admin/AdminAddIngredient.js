import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Css/AdminAddIngredientCss.css';
import config from '../../config';
import TemplateAdmin from "../../components/TemplateAdmin";

function AdminAddIngredient() {
    const [ingredientName, setIngredientName] = useState('');
    const [ingredients, setIngredients] = useState([]);

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            const response = await axios.get(`${config.api_path}/ingredients`);
            setIngredients(response.data);
        } catch (error) {
            console.error('Error fetching ingredients:', error.message);
        }
    };

    const handleAddIngredient = async (e) => {
        e.preventDefault();
        
        try {
            if (!ingredientName) {
                Swal.fire({
                    icon: 'info',
                    title: 'กรุณากรอกชื่อส่วนผสม',
                });
                return;
            }

            // Show confirmation dialog
            const result = await Swal.fire({
                title: 'ยืนยันการเพิ่มส่วนผสม',
                text: `คุณต้องการเพิ่มส่วนผสม "${ingredientName}" หรือไม่?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'ใช่, เพิ่ม',
                cancelButtonText: 'ยกเลิก',
            });

            if (result.isConfirmed) {
                await axios.post(`${config.api_path}/ingredients/add`, { name: ingredientName });
                Swal.fire({
                    icon: 'success',
                    title: 'เพิ่มส่วนผสมเรียบร้อย',
                });
                setIngredientName('');
                fetchIngredients();
            }
        } catch (error) {
            console.error('Error adding ingredient:', error.message);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong while adding the ingredient!',
            });
        }
    };

    return (
        <>
            <TemplateAdmin />
            <div className="admin-container">
                <h2>เพิ่มส่วนผสมใหม่</h2>
                <form onSubmit={handleAddIngredient} className="ingredient-form">
                    <label htmlFor="ingredientName">ชื่อส่วนผสม:</label>
                    <input
                        type="text"
                        id="ingredientName"
                        value={ingredientName}
                        onChange={(e) => setIngredientName(e.target.value)}
                        required
                    />
                    <button type="submit">เพิ่มส่วนผสม</button>
                </form>
                <h2>รายการส่วนผสมทั้งหมด</h2>
                <table className="ingredient-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>ชื่อส่วนผสม</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ingredients.map(ingredient => (
                            <tr key={ingredient.id}>
                                <td>{ingredient.id}</td>
                                <td>{ingredient.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default AdminAddIngredient;
