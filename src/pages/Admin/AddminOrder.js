import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Css/AdminOrderCss.css';
import config from '../../config';
import TemplateAdmin from "../../components/TemplateAdmin";

function AdminOrder() {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [filteredOrdersMonth, setFilteredOrdersMonth] = useState([]);
    const [editedOrder, setEditedOrder] = useState({});
    const [memberNames, setMemberNames] = useState({});
    const [packageNames, setPackageNames] = useState({});
    const [selectedMonth, setSelectedMonth] = useState('');

    const memberNamesFetched = useRef(false);
    const packageNamesFetched = useRef(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        setFilteredOrders(
            Array.isArray(orders) ? orders.filter(order =>
                order.orderNumber && order.orderNumber.includes(searchTerm)
            ) : []
        );

        setFilteredOrdersMonth(
            Array.isArray(orders)
                ? orders.filter(order => {
                    const orderMonth = new Date(order.createdAt).getMonth() + 1; //getMonth คืนค่า 0-11
                    return (
                        order.orderNumber && order.orderNumber.includes(searchTerm) &&
                        (selectedMonth === '' || orderMonth === parseInt(selectedMonth))
                    );
                })
                : []
        );
    }, [searchTerm, orders, selectedMonth]);

    useEffect(() => {
        if (orders.length > 0 && !memberNamesFetched.current) {
            fetchMemberNames();
            memberNamesFetched.current = true;
        }
        if (orders.length > 0 && !packageNamesFetched.current) {
            fetchPackageNames();
            packageNamesFetched.current = true;
        }
    }, [orders]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${config.api_path}/orders/list/admin`);
            const orders = response.data.results;
            const groupedOrders = groupOrdersByNumber(orders);
            setOrders(groupedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
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
                orderGroup.items[order.packageId] = {
                    name: '',
                    quantity: order.quantity, // ใช้จำนวนจากข้อมูลที่ดึงมา
                    totalPrice: parseFloat(order.totalPrice) || 0
                };
            }
            return acc;
        }, {});

        return Object.values(grouped);
    };


    const fetchMemberNames = async () => {
        try {
            const userIds = Array.from(new Set(orders.map(order => order.userId)));
            const nameRequests = userIds.map(userId => axios.get(`${config.api_path}/member/name/${userId}`, config.headers()));
            const responses = await Promise.all(nameRequests);
            const names = {};

            responses.forEach((response, index) => {
                const userId = userIds[index];
                if (response.data && response.data.name) {
                    names[userId] = response.data.name;
                }
            });

            setMemberNames(names);
        } catch (error) {
            console.error('Error fetching member names:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to fetch member names',
                icon: 'error'
            });
        }
    };

    const fetchPackageNames = async () => {
        try {
            const packageIds = Array.from(new Set(orders.flatMap(order => Object.keys(order.items))));
            const nameRequests = packageIds.map(packageId => axios.get(`${config.api_path}/products/name/${packageId}`));
            const responses = await Promise.all(nameRequests);
            const names = {};

            responses.forEach((response, index) => {
                const packageId = packageIds[index];
                if (response.data && response.data.product) {
                    names[packageId] = response.data.product;
                }
            });

            setOrders(orders.map(order => ({
                ...order,
                items: Object.keys(order.items).reduce((acc, packageId) => {
                    acc[packageId] = {
                        ...order.items[packageId],
                        name: names[packageId] || 'Unknown'
                    };
                    return acc;
                }, {})
            })));
            setPackageNames(names);
        } catch (error) {
            console.error('Error fetching package names:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to fetch package names',
                icon: 'error'
            });
        }
    };

    const handleDropdownChange = (orderNumber, e) => {
        setEditedOrder(prev => ({
            ...prev,
            [orderNumber]: e.target.value
        }));
    };

    const handleStatusChange = async (orderNumber) => {
        const newStatus = editedOrder[orderNumber];
        if (newStatus === undefined) return;

        const result = await Swal.fire({
            title: 'ยืนยันการเเก้ไข?',
            text: "ข้อมูลจะถูกเปลี่ยนสถานะ",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`${config.api_path}/orders/${orderNumber}`, { status: newStatus });
                Swal.fire({
                    title: 'Success',
                    text: 'Order status updated successfully',
                    icon: 'success'
                });
                fetchOrders();
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: error.message,
                    icon: 'error'
                });
            }
        }
    };


    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Bangkok',
        };
        return new Date(dateString).toLocaleString('th-TH', options);
    };



    return (
        <>
            <TemplateAdmin />
            <div className="admin-container">
                <h1>Manage Orders</h1>
                <input
                    type="text"
                    placeholder="Search by Order Number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                />
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="month-dropdown"
                >
                    <option value="">ทั้งหมด</option>
                    <option value="1">มกราคม</option>
                    <option value="2">กุมภาพันธ์</option>
                    <option value="3">มีนาคม</option>
                    <option value="4">เมษายน</option>
                    <option value="5">พฤษภาคม</option>
                    <option value="6">มิถุนายน</option>
                    <option value="7">กรกฎาคม</option>
                    <option value="8">สิงหาคม</option>
                    <option value="9">กันยายน</option>
                    <option value="10">ตุลาคม</option>
                    <option value="11">พฤศจิกายน</option>
                    <option value="12">ธันวาคม</option>
                </select>
                <table className="table">

                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order Number</th>
                                <th>Customer ID</th>
                                <th>Customer Name</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(filteredOrdersMonth) && filteredOrdersMonth.map(order => (
                                <tr key={order.orderNumber}>
                                    <td>{order.orderNumber}</td>
                                    <td>{order.userId}</td>
                                    <td>{memberNames[order.userId] || 'Loading...'}</td>
                                    <td>
                                        {Object.entries(order.items).map(([packageId, item]) => (
                                            <div key={packageId}>
                                                {item.name}: {item.quantity}
                                            </div>
                                        ))}
                                    </td>
                                    <td>{(order.totalPrice || 0).toFixed(2)}</td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td>
                                        {order.status === 'sending' ? (
                                            <span className="status-sending">Sending</span>
                                        ) : (
                                            <select
                                                value={editedOrder[order.orderNumber] || order.status}
                                                onChange={(e) => handleDropdownChange(order.orderNumber, e)}
                                                className="status-dropdown"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="sending">Sending</option>
                                            </select>
                                        )}
                                    </td>
                                    <td>
                                        {order.status !== 'sending' && (
                                            <button
                                                onClick={() => handleStatusChange(order.orderNumber)}
                                                className="btn-primary"
                                            >
                                                Confirm Changes
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </table>
            </div>
        </>
    );
}

export default AdminOrder;
