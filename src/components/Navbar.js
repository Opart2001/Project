import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import config from '../config';
import maoyang from '../assets/maoyang.png';
import './NavbarCss.css';

function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [notificationsCount, setNotificationsCount] = useState(0);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await axios.get(`${config.api_path}/member/info/id`, config.headers());
                setUserId(response.data.userId);
            } catch (error) {
                console.error('Error fetching user data:', error.message);
            }
        };

        fetchUserId();
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                if (userId) {
                    const response = await axios.get(`${config.api_path}/notifications/${userId}`);
                    setNotifications(response.data);
                    const unreadCount = response.data.filter(notification => !notification.isRead).length;
                    setNotificationsCount(unreadCount);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error.message);
            }
        };

        fetchNotifications();
    }, [userId]);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                handleSearch();
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [searchQuery]);

    const handleSearch = async () => {
        try {
            if (!searchQuery) {
                Swal.fire({
                    icon: 'info',
                    title: 'กรุณากรอกข้อมูล',
                    text: 'โปรดใส่คำที่ต้องการค้นหา',
                });
                return;
            }

            const response = await axios.get(`${config.api_path}/products/query?query=${searchQuery}`);
            if (response.data.results.length > 0) {
                Swal.fire({
                    icon: 'success',
                    title: 'พบสินค้า',
                });
                navigate('/home', { state: { searchResults: response.data.results } });
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'ไม่พบสินค้า',
                    text: 'ขออภัยไม่พบสินค้าที่คุณค้นหา กรุณาค้นหาอีกครั้ง',
                });
                navigate('/home', { state: { searchResults: [] } });
            }
        } catch (error) {
            console.error('Error searching products:', error.message);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong while searching for products!',
            });
        }
    };

    const handleSignOut = () => {
        Swal.fire({
            title: '<img class="MAO" src="' + maoyang + '" alt="Logo" />',
            text: 'ยืนยันการออกจากระบบ',
            showCancelButton: true,
            showConfirmButton: true
        }).then(res => {
            if (res.isConfirmed) {
                localStorage.removeItem('userId');
                navigate('/login');
            }
        });
    };

    const handleOrders = () => {
        navigate('/Orders');
    };

    const handleProfile = () => {
        navigate('/Profile');
    };

    const handleHome = () => {
        navigate('/home');
    };

    const handleRecommend = () => {
        navigate('/Recommend');
    };

    const handleCart = () => {
        navigate('/Cart');
    };

    const handleNotificationClick = async (notificationId) => {
        try {
            await axios.patch(`${config.api_path}/notifications/${notificationId}`, { isRead: true });
            if (userId) {
                const response = await axios.get(`${config.api_path}/notifications/${userId}`);
                setNotifications(response.data);
                const unreadCount = response.data.filter(notification => !notification.isRead).length;
                setNotificationsCount(unreadCount);

                const notification = response.data.find(n => n.id === notificationId);
                if (notification) {
                    const formattedDate = new Date(notification.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });

                    Swal.fire({
                        title: '<img class="MAO" src="' + maoyang + '" alt="Logo" />',
                        html: `<h2>${notification.title}</h2>
                               <div style="border: 1px solid black; padding: 10px; margin-bottom: 10px;">${notification.message}</div>
                               <div> วันที่: ${formattedDate}</div>`,
                        confirmButtonText: 'ปิด'
                    });
                }
            }
        } catch (error) {
            console.error('Error marking notification as read:', error.message);
        }
    };

    return (
        <nav className="navbar navbar-expand navbar-light">
            <img className="MAO" src={maoyang} alt="Logo" />
            <button className="MAOYANG no-border" onClick={handleRecommend}>หน้าหลัก</button>
            <button className="MAOYANG no-border" onClick={handleHome}>สินค้า</button>
            <button className="MAOYANG no-border" onClick={handleCart}>ตะกร้าสินค้า</button>
            <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                    <a className="nav-link" data-toggle="dropdown" href="#">
                        <i className="far fa-bell"></i>
                        <span className="badge badge-warning">{notificationsCount}</span>
                    </a>
                    <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                        <span className="dropdown-item dropdown-header">{notificationsCount} การแจ้งเตือน </span>
                        <div className="dropdown-divider"></div>
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <a key={notification.id} href="#"
                                    className={`dropdown-item ${notification.isRead ? 'read-notification' : 'unread-notification'}`}
                                    onClick={() => handleNotificationClick(notification.id)}>
                                    <div className='text-des'>
                                        <i className="fas fa-bell mr-2"></i> {notification.title}
                                        <div className="text-muted text-sm">
                                            {new Date(notification.createdAt).toLocaleDateString('th-TH', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </a>
                            ))
                        ) : (
                            <span className="dropdown-item">ไม่มีการแจ้งเตือน</span>
                        )}
                        <div className="dropdown-divider"></div>
                        <a href="#" className="dropdown-item dropdown-footer"></a>
                    </div>
                </li>
                <li className="nav-item search-container">
                    <input type="text" className="form-control search-input" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <button className="btn btn-outline-secondary search-button" type="button" onClick={handleSearch}>
                        <i className="fas fa-search"></i>
                    </button>
                </li>
                <li className="nav-item-dd">
                    <div className="dropdown">
                        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-user"></i>
                        </button>
                        <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                            <a className="dropdown-item" href="#" onClick={handleProfile}>ข้อมูลส่วนตัว</a>
                            <a className="dropdown-item" href="#" onClick={handleOrders}>คำสั่งซื้อ</a>
                            <a className="dropdown-item" href="#" onClick={handleSignOut}>ออกจากระบบ</a>
                        </div>
                    </div>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
