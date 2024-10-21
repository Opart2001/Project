import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../components/CartContext';
import Swal from 'sweetalert2';
import axios from 'axios';
import config from '../config';
import './Css/cartCss.css'; // Import the CSS file
import Template from "../components/Template";
import Check from '../assets/check.png';

const Cart = () => {
    const { cartItems, clearCart, addToCart } = useContext(CartContext);
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch products with images
        const fetchProducts = async () => {
            try {
                const response = await axios.get(config.api_path + '/products/order/list', config.headers());
                setProducts(response.data.results);
            } catch (error) {
                console.error('Error fetching products:', error.message);
            }
        };

        fetchProducts();
    }, []);

    const handleConfirmOrder = async () => {
        const result = await Swal.fire({
            title: 'ยืนยันการสั่งซื้อ',
            text: "คุณแน่ใจหรือไม่ว่าต้องการสั่งซื้อสินค้าทั้งหมดในตะกร้า?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่, สั่งซื้อ!',
            cancelButtonText: 'ยกเลิก'
        });
    
        if (result.isConfirmed) {
            try {
                // เรียก API เพื่อดึงข้อมูลของผู้ใช้ รวมถึง address
                const userResponse = await axios.get(config.api_path + '/member/info', config.headers());
                const user = userResponse.data.result;
                
                // เช็คว่ามี address หรือไม่
                if (!user.address) {
                    // ถ้าไม่มีที่อยู่ นำผู้ใช้ไปยังหน้า Profile
                    Swal.fire({
                        icon: 'warning',
                        title: 'ไม่พบที่อยู่',
                        text: 'กรุณาเพิ่มที่อยู่ในโปรไฟล์ของคุณก่อนทำการสั่งซื้อ',
                        showConfirmButton: true,
                    });
                    return; // หยุดการทำงานต่อ
                }
    
                const userId = user.id;
                const orderNumber = generateOrderNumber();
    
                // ลูปสำหรับสั่งซื้อสินค้าในตะกร้า
                for (const item of cartItems) {
                    const orderData = {
                        orderNumber: orderNumber,
                        userId: userId,
                        productId: item.id,
                        quantity: item.quantity,
                        totalPrice: item.quantity * item.price,
                        status: 'pending'
                    };
    
                    await axios.post(config.api_path + '/orders/create', orderData, config.headers());
    
                    // อัปเดตจำนวนสินค้าในสต็อก
                    await axios.put(config.api_path + `/products/update-stock/${item.id}`, {
                        quantity: item.quantityInStock - item.quantity
                    }, config.headers());
                }
    
                clearCart();
    
                Swal.fire({
                    icon: 'success',
                    title: 'สั่งซื้อสำเร็จ',
                    text: 'คำสั่งซื้อของคุณได้ถูกบันทึกแล้ว!',
                    timer: 3000,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('Error placing order:', error.message);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถทำการสั่งซื้อได้',
                });
            }
        }
    };
    

    const handleRemoveItem = (itemId) => {
        Swal.fire({
            icon: 'warning',
            title: 'ยืนยันการยกเลิก',
            text: 'คุณแน่ใจว่าต้องการยกเลิกสินค้านี้?',
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก'
        }).then(result => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'ยกเลิกสินค้าสำเร็จ',
                    text: 'สินค้านี้จะถูกลบออกจากตะกร้า',
                    showConfirmButton: false,
                    timer: 1500
                });

                const updatedCart = cartItems.filter(item => item.id !== itemId);
                clearCart();
                updatedCart.forEach(item => addToCart(item, item.quantity));
            }
        });
    };

    const generateOrderNumber = () => {
        const now = new Date();
        const timestamp = now.getTime();
        const random = Math.floor(Math.random() * 1000);
        return `${timestamp}-${random}`;
    };

    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => total += item.quantity * item.price, 0);
    };

    // Find product details including image URL from the list of products
    const getProductImage = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.imageUrl : ''; // Return image URL or empty string if not found
    };

    return (
        <>
            <div className="home-background">
                <Template />
                <div className="cart-container">
                    {cartItems.length === 0 ? (
                        <div className="empty-cart-message">
                            <img src={Check} alt="No items" />
                            <p className='cart-text'>ไม่มีสินค้าในตะกร้า</p>
                    </div>
                    
                    ) : (
                        <>
                            <table className="cart-table">
                                <thead>
                                    <tr>
                                        <th>สินค้า</th>
                                        <th>ชื่อ</th>
                                        <th>จำนวน</th>
                                        <th>ราคารวม</th>
                                        <th>แอคชั่น</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <img src={getProductImage(item.id)} alt={item.name} className="productCart-image" />
                                            </td>

                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.quantity * item.price} บาท</td>
                                            <td>
                                                <button className="remove-button" onClick={() => handleRemoveItem(item.id)}>ลบ</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="total-price">
                                <h3>ราคารวม: {calculateTotalPrice()} บาท</h3>
                            </div>
                            <div>
                                <button className="confirm-button" onClick={handleConfirmOrder}>ยืนยันคำสั่งซื้อ</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Cart;
