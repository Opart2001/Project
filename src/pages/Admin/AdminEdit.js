import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Css/AdminCss.css';
import './Css/AdminEditCss.css';
import config from '../../config';
import TemplateAdmin from "../../components/TemplateAdmin";

function AdminEdit() {
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchIngredients();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${config.api_path}/admin/products/list`);
            if (Array.isArray(response.data.results)) {
                setProducts(response.data.results);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
    };

    const fetchIngredients = async () => {
        try {
            const response = await axios.get(`${config.api_path}/ingredients`);
            console.log(response.data);
            if (Array.isArray(response.data)) {
                setAvailableIngredients(response.data);
            } else {
                setAvailableIngredients([]);
            }
        } catch (error) {
            console.error('Error fetching ingredients:', error);
            setAvailableIngredients([]);
        }
    };

    const fetchProductIngredients = async (productId) => {
        try {
            const response = await axios.get(`${config.api_path}/products/${productId}/ingredients`);
            if (Array.isArray(response.data) && response.data.length > 0) {
                setSelectedIngredients(response.data.map(ingredient => ingredient.id));
            } else {
                setSelectedIngredients([]);
            }
        } catch (error) {
            console.error('Error fetching product ingredients:', error);
            setSelectedIngredients([]);
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct({ ...product });
        fetchProductIngredients(product.id);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingProduct(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleIngredientChange = (ingredientId) => {
        setSelectedIngredients(prevState =>
            prevState.includes(ingredientId)
                ? prevState.filter(id => id !== ingredientId)
                : [...prevState, ingredientId]
        );
    };

    const handleSaveClick = async () => {
        const result = await Swal.fire({
            title: 'ยืนยันการเเก้ไข?',
            text: "ข้อมูลที่แก้ไขจะถูกอัพเดทไปยังฐานข้อมูล",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const updatedProduct = {
                    name: editingProduct.name,
                    description: editingProduct.description,
                    type: editingProduct.type,
                    location: editingProduct.location,
                    size: editingProduct.size,
                    quantityInStock: editingProduct.quantityInStock,
                    price: editingProduct.price,
                    imageUrl: editingProduct.imageUrl,
                    isVisible: editingProduct.isVisible
                };

                await axios.put(`${config.api_path}/products/update/${editingProduct.id}`, updatedProduct);

                Swal.fire({
                    title: 'Success',
                    text: 'Product updated successfully',
                    icon: 'success'
                });

                setEditingProduct(null);
                fetchProducts(); // ดึงข้อมูลใหม่หลังการบันทึก
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: error.message,
                    icon: 'error'
                });
            }
        }
    };


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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



    return (
        <>
            <TemplateAdmin />
            <div className="admin-container">
                <h1>Manage Products</h1>
                {editingProduct ? (
                    <div>
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>
                            {Object.keys(editingProduct).map((key) => (
                                key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && (
                                    <div key={key} className="form-group">
                                        <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                        {key === 'isVisible' ? (
                                            <div>
                                                <input
                                                    type="checkbox"
                                                    name={key}
                                                    checked={editingProduct.isVisible} // ใช้ค่า checked สำหรับ checkbox
                                                    onChange={handleInputChange}
                                                />
                                                <span>{editingProduct.isVisible ? 'Visible' : 'Not Visible'}</span> {/* แสดงข้อความตามสถานะ */}
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                name={key}
                                                value={editingProduct[key]}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                readOnly={key === 'quantityInStock'}
                                            />
                                        )}
                                    </div>
                                )
                            ))}

                            <div className="form-group">
                                <label>Add Quantity</label>
                                <input
                                    type="number"
                                    name="quantityInStock"
                                    value={editingProduct.quantityInStock}
                                    onChange={handleInputChange}
                                />

                                <label>Ingredients</label>
                                <div className="dropdown-container">
                                    <button type="button" className="edit-dropdown-toggle" onClick={handleDropdownToggle}>
                                        {selectedIngredients.length > 0 ? 'Selected Ingredients' : 'Select Ingredients'}
                                    </button>
                                    <div className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                                        {availableIngredients.length === 0 ? (
                                            <p>No ingredients available</p>
                                        ) : (
                                            availableIngredients.map(ingredient => (
                                                <div key={ingredient.id} className="dropdown-item">
                                                    <span>{ingredient.name}</span> {/* ชื่อส่วนผสม */}
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIngredients.includes(ingredient.id)}
                                                        onChange={() => handleIngredientChange(ingredient.id)}
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="confirm btn-primary">Save Changes</button>
                        </form>

                        <button onClick={() => setEditingProduct(null)} className="btn-secondary">Cancel</button>
                    </div>
                ) : (
                    <div>
                        <input
                            type="text"
                            placeholder="Search by name"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="form-control search-input"
                        />
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th>Location</th>
                                    <th>Size</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.name}</td>
                                        <td>{product.description}</td>
                                        <td>{product.type}</td>
                                        <td>{product.location}</td>
                                        <td>{product.size}</td>
                                        <td>{product.quantityInStock}</td>
                                        <td>{product.price}</td>
                                        <td className={product.isVisible ? 'text-green' : 'text-red'}>
                                            {product.isVisible ? 'Show' : 'Hidden'}
                                        </td>
                                        <td>
                                            <button onClick={() => handleEditClick(product)} className="btn-primary">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

export default AdminEdit;
