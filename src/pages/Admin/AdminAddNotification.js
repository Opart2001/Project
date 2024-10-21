import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import config from '../../config';
import TemplateAdmin from "../../components/TemplateAdmin";

function AdminAddNotification() {
    const [notificationData, setNotificationData] = useState({
        title: '',
        message: '',
        type: '',
        expiryDate: '',
        userId: '',
        sendToAll: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNotificationData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const result = await Swal.fire({
            title: 'ยืนยันการส่งการแจ้งเตือน?',
            text: "คุณต้องการส่งการแจ้งเตือนนี้หรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, send it!',
            cancelButtonText: 'Cancel'
        });
    
        if (result.isConfirmed) {
            try {
                // ถ้าไม่ได้เลือกส่งให้ทุกคน (`sendToAll`) ต้องมีค่า `userId`
                if (!notificationData.sendToAll && !notificationData.userId) {
                    Swal.fire({
                        title: 'Error',
                        text: 'User ID is required when not sending to all users.',
                        icon: 'error'
                    });
                    return; // ออกถ้าหากไม่มี userId
                }
    
                // ส่งการแจ้งเตือน
                await axios.post(`${config.api_path}/notifications`, notificationData);
    
                Swal.fire({
                    title: 'Success',
                    text: 'Notification sent successfully',
                    icon: 'success'
                });
    
                setNotificationData({
                    title: '',
                    message: '',
                    type: '',
                    expiryDate: '',
                    userId: '',
                    sendToAll: false
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: error.message,
                    icon: 'error'
                });
            }
        }
    };
    


    return (
        <>
            <TemplateAdmin />
            <div className="notification-container">
                <h1>Create New Notification</h1>
                <form onSubmit={handleSubmit}>
                    {Object.keys(notificationData).map((key) => {
                        if (key === 'sendToAll') {
                            return (
                                <div key={key} className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name={key}
                                            checked={notificationData[key]}
                                            onChange={handleChange}
                                        />
                                        Send to All
                                    </label>
                                </div>
                            );
                        }
                        return (
                            <div key={key} className="form-group">
                                <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <input
                                    type={key === 'expiryDate' ? 'date' : 'text'}
                                    name={key}
                                    value={notificationData[key]}
                                    onChange={handleChange}
                                    className="form-control"
                                    required={!notificationData.sendToAll && (key === 'userId' || key === 'orderId')}
                                    disabled={notificationData.sendToAll && (key === 'userId' || key === 'orderId')}
                                />
                            </div>
                        );
                    })}
                    <button type="submit" className="confirm btn-primary">Send Notification</button>
                </form>
            </div>
        </>
    );
}

export default AdminAddNotification;
