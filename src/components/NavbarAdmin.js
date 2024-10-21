import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import axios from 'axios';
import config from "../config";
import maoyang from '../assets/maoyang.png';
import './NavbarCss.css';

function Navbar() {
    const navigate = useNavigate();


    const handleSignOut = () => {
        Swal.fire({
            title: 'Sign Out',
            text: 'ยืนยันการออกจากระบบ',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true
        }).then(res => {
            if (res.isConfirmed) {
                localStorage.removeItem(config);
                navigate('/Adminlogin');
            }
        });
    };

    const handleAdd = () => {
        navigate('/AdminAdd');
    };

    const handleEdit = () => {
        navigate('/AdminEdit');
    };

    const handleOrder = () => {
        navigate('/AdminOrder');
    };

    const handleAddIngredient = () => {
        navigate('/AdminAddIngredient');
    };

    const handleAddNotification = () => {
        navigate('/AdminAddNotification');
    };

    return (
        <nav className="navbar navbar-expand navbar-light">
            <img className="MAO" src={maoyang} alt="Logo" />
            <button className="MAOYANG no-border" onClick={handleAdd}>Add products</button>
            <button className="MAOYANG no-border" onClick={handleEdit}>Edit products</button>
            <button className="MAOYANG no-border" onClick={handleOrder}>search products</button>
            <button className="MAOYANG no-border" onClick={handleAddIngredient}>Add ingredients</button>
            <button className="MAOYANG no-border" onClick={handleAddNotification}>Add Notification</button>
            <ul className="navbar-nav ml-auto">


                <li className="nav-item mt-2">
                    <div className="dropdown">
                        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-user"></i>
                        </button>
                        <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                            <a className="dropdown-item" href="#" onClick={handleSignOut}>Sign Out</a>
                        </div>
                    </div>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
