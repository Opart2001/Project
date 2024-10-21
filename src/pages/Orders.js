import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import './Css/OrderCss.css'; // Import CSS file for styling
import Template from "../components/Template";
import homeCss from './Css/homeCss.css'
import OrderCss from './Css/OrderCss.css'

function Order() {
    const [userId, setUserId] = useState(null);
    const [orders, setOrders] = useState([]);
    const [packages, setPackages] = useState([]);
    const [userDetails, setUserDetails] = useState(null);
    const [openOrderIndex, setOpenOrderIndex] = useState(null);
    const [loadingPackages, setLoadingPackages] = useState(true);

    //--------------------------------ดึงข้อมูลทั้งหมด
    const fetchAllData = async () => {
        try {
            await fetchUserId();
            await fetchPackages();
        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    };


    useEffect(() => {
        fetchAllData();
    }, []);

    //--------------------------------ดึงคำสั่งซื้อและรายละเอียดผู้ใช้เมื่อ userId และ loadingPackages เปลี่ยนแปลง
    useEffect(() => {
        if (userId !== null && !loadingPackages) {
            fetchUserOrders(userId);
            fetchUserDetails(userId);
        }
    }, [userId, loadingPackages]);

    const fetchUserId = async () => {
        try {
            const response = await axios.get(config.api_path + '/member/info/id', config.headers());
            setUserId(response.data.userId);
        } catch (error) {
            console.error('Error fetching user ID:', error.message);
        }
    };

    const fetchUserOrders = async (userId) => {
        try {
            const response = await axios.get(config.api_path + '/orders/list', {
                params: { userId }
            });

            const ordersData = response.data.results.filter(order => order.userId === parseInt(userId, 10));
            const groupedOrders = groupOrdersByNumber(ordersData);
            setOrders(groupedOrders);
        } catch (error) {
            console.error('Error fetching user orders:', error.message);
        }
    };


    const fetchPackages = async () => {
        try {
            const response = await axios.get(config.api_path + '/products/order/list');
            setPackages(response.data.results);
            setLoadingPackages(false); // Mark packages as loaded
        } catch (error) {
            console.error('Error fetching packages:', error.message);
        }
    };

    const fetchUserDetails = async (userId) => {
        try {
            const response = await axios.get(config.api_path + `/member/info/${userId}`, config.headers());
            setUserDetails(response.data.result);
        } catch (error) {
            console.error('Error fetching user details:', error.message);
        }
    };

    const groupOrdersByNumber = (orders) => {
        const grouped = orders.reduce((acc, order) => {
            if (!acc[order.orderNumber]) {
                acc[order.orderNumber] = {
                    orderNumber: order.orderNumber,
                    userId: order.userId,
                    items: {},
                    totalPrice: 0,
                    createdAt: order.createdAt,
                    status: order.status
                };
            }
            const orderGroup = acc[order.orderNumber];
            orderGroup.totalPrice += parseFloat(order.totalPrice) || 0;
            if (orderGroup.items[order.packageId]) {
                orderGroup.items[order.packageId].quantity += order.quantity;
                orderGroup.items[order.packageId].totalPrice += parseFloat(order.totalPrice) || 0;
            } else {
                const packageDetail = packages.find(pkg => pkg.id === order.packageId);
                orderGroup.items[order.packageId] = {
                    name: packageDetail ? packageDetail.name : 'Loading...',
                    imageUrl: packageDetail ? packageDetail.imageUrl : 'default-image-path.jpg', // เพิ่มการดึง URL รูปภาพ
                    quantity: order.quantity,
                    totalPrice: parseFloat(order.totalPrice) || 0
                };
            }
            return acc;
        }, {});
    
        return Object.values(grouped);
    };
    

    const toggleDropdown = (index) => {
        setOpenOrderIndex(openOrderIndex === index ? null : index);
    };

    return (
        <>
            <div className="home-background">
                <Template />
                <div className='detail'>
                    <h2 className='title'>รายละเอียดคำสั่งซื้อ</h2>
                    <div className="concontainer_sec">
                        {orders.length === 0 ? (
                            <p>No orders placed yet.</p>
                        ) : (
                            <ul>
                                {orders.map((order, index) => {
                                    const isOpen = openOrderIndex === index;
                                    const statusClass = order.status === 'pending' ? 'status-pending' : order.status === 'sending' ? 'status-sending' : '';

                                    return (
                                        <div key={index} className="order-item">
                                            <div className="order-header" onClick={() => toggleDropdown(index)}>
                                                <p>คำสั่งซื้อที่ {index + 1}</p>
                                                <button className="toggle-button">
                                                    {isOpen ? '▲' : '▼'}
                                                </button>
                                            </div>

                                            {isOpen && (
                                                <div className="order-details">
                                                    <div>
                                                        <p>รหัสคำสั่งซื้อ : {order.orderNumber}</p>
                                                        {Object.entries(order.items).map(([packageId, item]) => (
                                                            <div key={packageId} className="item-details">
                                                                <p>สินค้าที่สั่งซื้อ : {item.name}</p>

                                                                {/* เพิ่มส่วนแสดงรูปภาพสินค้า */}
                                                                <img
                                                                    className="product-order-image"
                                                                    src={item.imageUrl ? item.imageUrl : 'default-image-path.jpg'}
                                                                    alt={item.name}

                                                                />

                                                                <p>จำนวนสินค้า : {item.quantity}</p>
                                                            </div>
                                                        ))}

                                                        <p>ราคารวม : {order.totalPrice.toFixed(2)}</p>
                                                        <p>ชื่อ: {userDetails ? userDetails.name : 'Loading...'}</p>
                                                        <p>ที่อยู่: {userDetails ? userDetails.address : 'Loading...'}</p>
                                                        <p>เบอร์โทร: {userDetails ? userDetails.phone : 'Loading...'}</p>
                                                        <p>วันที่สั่งซื้อ : {new Date(order.createdAt).toLocaleDateString()}</p>
                                                        <p className={statusClass}>
                                                            สถานะ : {order.status === 'pending' ? 'กำลังตรวจสอบ' : order.status === 'sending' ? 'กำลังจัดส่ง' : 'สถานะไม่ทราบ'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Order;
