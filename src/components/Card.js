import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import './Card.css'; // Import CSS file for styling
import { useLocation, useNavigate, Link } from 'react-router-dom';
import err2 from '../assets/err2.png'; // Import your error image

function Card() {
    const [packages, setPackages] = useState([]);
    const [userId, setUserId] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserId();
    }, []);

    useEffect(() => {
        if (userId) {
            if (location.state && location.state.searchResults) {
                const sortedPackages = location.state.searchResults.sort((a, b) => a.id - b.id);
                fetchSalesData(sortedPackages);
            } else {
                //console.log('error ID');
                fetchData();
            }
        }
    }, [userId, location.state]);

    const fetchData = async () => {
        if (!userId) {
            return;  // หาก userId ยังไม่ถูกตั้งค่าให้ไม่ทำงาน
        }
        try {
            // เรียก association
            const response = await axios.get(`${config.api_path}/api/association/${userId}`);
            const data = response.data;
            
            //console.log('Fetched Data:', data); // Log ข้อมูลที่ได้รับจาก API

        } catch (error) {
            console.error('Error fetching data:', error.message);
        }

        try {
            const packageResponse = await axios.get(`${config.api_path}/products/list`, { params: { memberId: userId } });
            const sortedPackages = packageResponse.data.results.sort((a, b) => a.id - b.id);
            fetchSalesData(sortedPackages);
        } catch (error) {
            console.error('Error fetching package data:', error.message);
        }
    };

    const fetchSalesData = async (packages) => {
        try {
            const orderResponse = await axios.get(`${config.api_path}/orders/list`);
            const orderData = orderResponse.data.results;
            

            const salesCountMap = {};

            orderData.forEach(order => {
                const { packageId, quantity } = order;
                if (salesCountMap[packageId]) {
                    salesCountMap[packageId] += quantity;
                } else {
                    salesCountMap[packageId] = quantity;
                }
            });

            //console.log('Sales Count Map:', salesCountMap); // Log sales count map for debugging

            const packagesWithSales = packages.map(pkg => ({
                ...pkg,
                salesCount: salesCountMap[pkg.id] || 0,
            }));

            setPackages(packagesWithSales);
        } catch (error) {
            console.error('Error fetching sales data:', error.message);
        }
    };

    const fetchUserId = async () => {
        try {
            const response = await axios.get(`${config.api_path}/member/info/id`, config.headers());
            setUserId(response.data.userId);
        } catch (error) {
            console.error('Error fetching user data:', error.message);
        }
    };

    const handleBuyNow = (item) => {
        navigate('/details', { state: { selectedPackage: item } });
    };

    return (
        <div className="container flex justify-center">
            <div className="flex space-x-3 flex-wrap flex-direction: row justify-center">
                {packages.length > 0 ? (
                    packages.map(item => (
                        <div key={item.id} className="card shadow-xl mr-4 mt-5" style={{ width: '350px', height: '500px', paddingBottom: '20px' }}>
                            <figure>
                                <img src={item.imageUrl} className="mt-2 err-pic" style={{ width: '326px', height: '258px' }} alt="Product" />
                            </figure>
                            <div className="card-body">
                                <h1 className="card-title bold">{item.name}</h1>
                                <p className="red-text"><br /><br /> ฿ : {item.price}</p>
                                <p> ขายได้ : {item.salesCount}</p>
                            </div>
                            <button className="button" onClick={() => handleBuyNow(item)}>รายละเอียดสินค้า</button>
                        </div>
                    ))
                ) : (
                    <div className="centered-image">
                        <Link to="/home">
                            <img src={err2} className="err-pic" alt="Error" />
                            <p className="err-message">Sorry, no products found. Please search again.</p>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Card;
