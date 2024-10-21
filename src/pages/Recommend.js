import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { useNavigate } from 'react-router-dom';
import Template from "../components/Template";
import './Css/RecommendCss.css';
import REC3 from "../assets/REC3.png";
import MOST6 from "../assets/MOST6.png";

function Recommend() {
    const [topProducts, setTopProducts] = useState([]);
    const [userId, setUserId] = useState(null);
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [favoritesIngredients, setFavoritesIngredients] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserId();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchTopProducts();
            fetchFavoriteProducts();
            fetchFavoriteIngredients();  // เรียกใช้งานฟังก์ชันนี้
        }
    }, [userId]);

    const fetchUserId = async () => {
        try {
            const response = await axios.get(`${config.api_path}/member/info/id`, config.headers());
            setUserId(response.data.userId);
        } catch (error) {
            console.error('Error fetching user data:', error.message);
        }
    };

    const fetchTopProducts = async () => {
        try {
            const response = await axios.get(`${config.api_path}/products/list`, { params: { memberId: userId } })
            const products = response.data.results;
            const ordersResponse = await axios.get(`${config.api_path}/orders/list`);
            const orders = ordersResponse.data.results;

            const salesCountMap = {};
            orders.forEach(order => {
                const { packageId, quantity } = order;
                salesCountMap[packageId] = (salesCountMap[packageId] || 0) + quantity;
            });

            const productsWithSales = products.map(product => ({
                ...product,
                salesCount: salesCountMap[product.id] || 0
            }));

            const maxSales = Math.max(...productsWithSales.map(product => product.salesCount));
            const topSellingProducts = productsWithSales.filter(product => product.salesCount === maxSales);
            console.log(topSellingProducts);
            setTopProducts(topSellingProducts);
        } catch (error) {
            console.error('Error fetching top products:', error.message);
        }
    };

    // ฟังก์ชันดึงสินค้าที่ตรงกับส่วนผสมที่ชอบของผู้ใช้
    const fetchFavoriteProducts = async () => {
        try {
            const response = await axios.get(`${config.api_path}/products/similar?memberId=${userId}`);
            setFavoriteProducts(response.data.results);
        } catch (error) {
            console.error('Error fetching favorite products:', error.message);
        }
    };

    const fetchFavoriteIngredients = async () => {
        try {
            const response = await axios.get(`${config.api_path}/member-favorites/${userId}`, config.headers()); // แก้เป็น userId
            setFavoritesIngredients(response.data || []); // ตั้งชื่อ state ให้ถูกต้อง
        } catch (error) {
            console.error('Error fetching favorite Ingredient:', error.message);
        }
    };

    const handleBuyNow = (item) => {
        navigate('/details', { state: { selectedPackage: item } });
    };

    return (
        <>
            <div className="home-background">
                <Template />
                <div className="name-title">MAO YANG</div>
                <div className="rec-title">สินค้ายอดขายสูงสุด</div>
                <div className="rec-item">
                    {topProducts.length > 0 ? (
                        <div className="container flex justify-center">
                            <div className="flex space-x-3 flex-wrap flex-direction: row justify-center">
                                {topProducts.map(item => (
                                    <div className="card shadow-xl mr-4 mt-5" style={{ width: '350px', height: '500px', paddingBottom: '20px', position: 'relative' }} onClick={() => handleBuyNow(item)}>
                                        <div className="recommend-circle">
                                            <img src={MOST6} style={{ width: '150px', height: '150px' }} />
                                        </div>
                                        <figure>
                                            <img src={item.imageUrl} className="mt-2 err-pic" style={{ width: '326px', height: '258px' }} alt="Product" />
                                        </figure>
                                        <div className="card-body">
                                            <h1 className="card-title bold">{item.name}</h1>
                                            <p className="red-text"><br /><br /> ฿ : {item.price}</p>
                                            <p> ขายได้ : {item.salesCount}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="centered-image">
                            <p className="err-message">Sorry, no products found.</p>
                        </div>
                    )}
                </div>

                <div className="rec-title">สินค้าที่ตรงกับส่วนผสมที่คุณชอบ</div>
                <div className="rec-item">
                    {favoritesIngredients.length > 0 ? (
                        <div className="container flex justify-center">
                            <div className="flex space-x-3 flex-wrap flex-direction: row justify-center">
                                {favoritesIngredients.map(ingredient => (
                                    <div key={ingredient.id} className="ingredient-card">
                                        <p className="ingredient-name"> ส่วนผสม : {ingredient.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="centered-image">
                            <p className="err-message">ไม่มีส่วนผสมที่ชอบ</p>
                        </div>
                    )}

                    {favoriteProducts.length > 0 ? (
                        <div className="container flex justify-center">
                            <div className="flex space-x-3 flex-wrap flex-direction: row justify-center">
                                {favoriteProducts.map(item => (
                                    <div key={item.id} className="card shadow-xl mr-4 mt-5" style={{ width: '350px', height: '500px', paddingBottom: '20px' }} onClick={() => handleBuyNow(item)}>
                                        <div className="recommend-circle">
                                            <img src={REC3} style={{ width: '150px', height: '150px' }} />
                                        </div>
                                        <figure>
                                            <img src={item.imageUrl} className="mt-2 err-pic" style={{ width: '326px', height: '258px' }} alt="Product" />
                                        </figure>
                                        <div className="card-body">
                                            <h1 className="card-title bold">{item.name}</h1>
                                            <p className="red-text"><br /><br /> ฿ : {item.price}</p>
                                            <p> สินค้าที่มีส่วนผสมที่คุณชื่นชอบ</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="centered-image">
                            <p className="err-message">ไม่มีสินค้าแนะนำตามส่วนผสมที่ชอบ</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Recommend;
