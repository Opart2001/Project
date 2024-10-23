import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import './Css/DetailsCss.css';
import CartContext from '../components/CartContext';
import Template from "../components/Template";
import Swal from 'sweetalert2';
import maoyang from '../assets/maoyang.png';

function Details() {
    const location = useLocation();
    const { selectedPackage } = location.state || {};
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [userId, setUserId] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [similarProducts, setSimilarProducts] = useState([]); // สินค้าที่มีส่วนผสมเหมือนกัน
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        fetchUserId();
    }, []);

    useEffect(() => {
        if (selectedPackage && userId) {
            fetchIngredients(selectedPackage.id);
            fetchAssociationRules();
        }
    }, [selectedPackage, userId]);

    const fetchUserId = async () => {
        try {
            const response = await axios.get(config.api_path + '/member/info/id', config.headers());
            setUserId(response.data.userId);
        } catch (error) {
            console.error('Error fetching user data:', error.message);
        }
    };

    const fetchIngredients = async (productId) => {
        try {
            const response = await axios.get(`${config.api_path}/products/${productId}/ingredients`, config.headers());
            setIngredients(response.data);
        } catch (error) {
            console.error('Error fetching ingredients:', error.message);
        }
    };

    const fetchAssociationRules = async () => {
        try {
            // ดึงกฎสำหรับผู้ใช้คนเดียว
            const response = await axios.get(`${config.api_path}/api/association/${userId}`, config.headers());
            let associationRules = response.data.associationRules;
    
            console.log('Association Rules for Single User:', associationRules);
    
            // กรองกฎที่เกี่ยวข้องกับสินค้าปัจจุบัน
            let related = associationRules.filter(rule => {
                const [lhs, rhs] = rule.rule.split(' -> ');
                console.log('Rule:', rule.rule, 'LHS:', lhs, 'Selected Package ID:', selectedPackage.id);
                return lhs === selectedPackage.id.toString();
            }).map(rule => rule.rule.split(' -> ')[1]);
    
            console.log('Related Products after filtering:', related);
    
            // ถ้าไม่มีกฎที่เกี่ยวข้องสำหรับผู้ใช้, ดึงกฎจาก association-all
            if (related.length === 0) {
                const allResponse = await axios.get(`${config.api_path}/api/association-all/${userId}`, config.headers());
                const allAssociationRules = allResponse.data.associationRules;
    
                // กรองกฎที่เกี่ยวข้องกับสินค้าจากกฎรวม
                related = allAssociationRules.filter(rule => {
                    const [lhs, rhs] = rule.rule.split(' -> ');
                    return lhs === selectedPackage.id.toString();
                }).map(rule => rule.rule.split(' -> ')[1]);
            }
    
            console.log('Final Related Products:', related);
    
            // ถ้ามีกฎที่เกี่ยวข้อง ดึงข้อมูลสินค้าที่เกี่ยวข้อง
            if (related.length > 0) {
                const relatedProductsResponse = await axios.get(`${config.api_path}/products/recommendation?ids=${related.join(',')}`, config.headers());
                setRelatedProducts(relatedProductsResponse.data.results);
            }
        } catch (error) {
            console.error('Error fetching association rules:', error.message);
        }
    };
    




    const incrementQuantity = () => {
        if (selectedQuantity < selectedPackage.quantityInStock) {
            setSelectedQuantity(prevQuantity => prevQuantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (selectedQuantity > 1) {
            setSelectedQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    const calculateTotalPrice = () => {
        if (selectedPackage) {
            return (selectedQuantity * selectedPackage.price).toFixed(2);
        }
        return (0).toFixed(2); // คืนค่าเป็นทศนิยม 2 ตำแหน่งเช่นกัน
    };
    

    const handleAddToCart = () => {
        addToCart(selectedPackage, selectedQuantity);
        Swal.fire({
            icon: 'success',
            title: 'เพิ่มสินค้าไปที่ตะกร้าแล้ว',
            showConfirmButton: false,
            timer: 5000
        });

        navigate('/home');
    };

    const handleOrder = async () => {
        try {
            // ดึงข้อมูลผู้ใช้เพื่อเช็คที่อยู่
            const userResponse = await axios.get(config.api_path + '/member/info', config.headers());
            const user = userResponse.data.result;
    
            // ตรวจสอบว่ามีที่อยู่หรือไม่
            if (!user.address) {
                // ถ้าไม่มีที่อยู่ ให้แสดงข้อความแจ้งเตือนและนำไปยังหน้าโปรไฟล์
                Swal.fire({
                    icon: 'warning',
                    title: 'ไม่พบที่อยู่',
                    text: 'กรุณาเพิ่มที่อยู่ในโปรไฟล์ของคุณก่อนทำการสั่งซื้อ',
                    showConfirmButton: true,
                });
                return; // หยุดการทำงานต่อ
            }
    
            const result = await Swal.fire({
                html: `
                        <img class="MAO" src="${maoyang}" alt="Logo" style="display: block; margin: 0 auto 10px;" />
                        <h2>ยืนยันการสั่งซื้อ</h2>
                        <h4>คุณแน่ใจหรือไม่ว่าต้องการสั่งซื้อสินค้านี้?</h4>
                        <div style="border: 1px solid black; padding: 10px;">
                        <p>สินค้า: ${selectedPackage.name}</p>
                        <p>จำนวน: ${selectedQuantity} ชิ้น</p>
                        <p>ราคารวม: ${calculateTotalPrice()} บาท</p>
                        </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'ใช่, สั่งซื้อ!',
                cancelButtonText: 'ยกเลิก'
            });
    
            if (result.isConfirmed) {
                const orderData = {
                    orderNumber: generateOrderNumber(),
                    userId: user.id, // ใช้ข้อมูล userId ที่ดึงมาจากการเช็คที่อยู่
                    productId: selectedPackage.id,
                    quantity: selectedQuantity,
                    totalPrice: calculateTotalPrice(),
                    status: 'pending'
                };
    
                const response = await axios.post(config.api_path + '/orders/create', orderData, config.headers());
                console.log('Order placed successfully:', response.data);
    
                await axios.put(config.api_path + `/products/update-stock/${selectedPackage.id}`, {
                    quantity: selectedPackage.quantityInStock - selectedQuantity
                }, config.headers());
    
                setModalIsOpen(false);
                navigate('/home');
    
                Swal.fire({
                    icon: 'success',
                    title: 'สั่งซื้อสำเร็จ',
                    text: 'คำสั่งซื้อของคุณได้ถูกบันทึกแล้ว!',
                    timer: 3000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            console.error('Error placing order:', error.message);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถทำการสั่งซื้อได้',
            });
        }
    };
    

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const generateOrderNumber = () => {
        const now = new Date();
        const timestamp = now.getTime();
        const random = Math.floor(Math.random() * 1000);
        return `${timestamp}-${random}`;
    };

    const handleRecommendation = (item) => {
        navigate('/details', { state: { selectedPackage: item } });
    };

    return (
        
            <div className="home-background">
                <Template />
                <div className="details-container">
                    {selectedPackage ? (
                        <>
                            <div className="details-content">
                                <div className="details-image">
                                    <img src={selectedPackage.imageUrl} alt={selectedPackage.name} className="product-image" />
                                </div>
                                <div className="details-text">
                                    <h2 className='head'>{selectedPackage.name}</h2>
                                    <p>{selectedPackage.description}</p>
                                    <p className='description'>จังหวัด : {selectedPackage.location} </p>
                                    <p className='description'>ชนิด : {selectedPackage.type} </p>
                                    <p className='description'>ขนาด : {selectedPackage.size} มล.</p>

                                    <p>ส่วนผสมหลัก:</p>
                                    {ingredients.length > 0 ? (
                                        <ul>
                                            {ingredients.map((ingredient) => (
                                                <li key={ingredient.id}>{ingredient.name}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>ไม่มีส่วนผสม</p>
                                    )}

                                    <p className='price'>ราคาต่อชิ้น  {selectedPackage.price} บาท</p>
                                    <p className='description'>มีสินค้าทั้งหมด: {selectedPackage.quantityInStock} ชิ้น</p>

                                    <div className="quantity-controls">
                                        <div className="quantity-box">
                                            <button className="quantity-button" onClick={decrementQuantity}>-</button>
                                        </div>
                                        <div className="quantity-box">
                                            <span className="selected-quantity">{selectedQuantity}</span>
                                        </div>
                                        <div className="quantity-box">
                                            <button className="quantity-button" onClick={incrementQuantity}>+</button>
                                        </div>
                                        <div className='total-price'>ราคารวม : {calculateTotalPrice()} บาท</div>
                                    </div>

                                    <button className="buy" onClick={handleAddToCart}>เพิ่มลงในตะกร้า</button>
                                    <button className="buynow" onClick={handleOrder}>ซื้อเลย</button>
                                </div>
                            </div>
                            <div className="related-products">
                                {relatedProducts.length > 0 ? (
                                    <>
                                        <h3>คุณอาจจะชอบสิ่งนี้</h3>
                                        <ul>
                                            {relatedProducts.map((product) => (
                                                <li key={product.id} onClick={() => handleRecommendation(product)} className="related-product-card">
                                                    <img src={product.imageUrl} alt={product.name} />
                                                    <p>{product.name}</p>
                                                    <p className="price">{product.price} บาท</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <p>ไม่มีสินค้าแนะนำ</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <p>No package selected.</p>
                    )}
                </div>
            </div>
    );
}

export default Details;
