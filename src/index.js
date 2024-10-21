import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';

import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import Login from './pages/Login';
import Home from './pages/Home';
import Start from './pages/Start';
import Order from './pages/Orders';
import Profile from './pages/Profile';
import Details from './pages/Details';
import Recommend from './pages/Recommend';
import AdminAdd from './pages/Admin/AdminAdd';
import AdminEdit from './pages/Admin/AdminEdit';
import AdminOrder from './pages/Admin/AddminOrder';
import AdminLogin from './pages/Admin/AdminLogin';
import Cart from './pages/cart';
import AdminAddIngredient from './pages/Admin/AdminAddIngredient';
import AdminAddNotification from './pages/Admin/AdminAddNotification';
import { CartProvider } from './components/CartContext'; 

const router = createBrowserRouter([
    {
        path: "/",
        element: <Start />,
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/home",
        element: <Home />
    },
    {
        path: "/Orders",
        element: <Order />
    },
    {
        path: "/Profile",
        element: <Profile />
    },
    {
        path: "/Details",
        element: <Details />
    },
    {
        path: "/Recommend",
        element: <Recommend />
    },
    {
        path: "/AdminAdd",
        element: <AdminAdd />
    },
    {
        path: "/AdminEdit",
        element: <AdminEdit />
    },
    {
        path: "/AdminOrder",
        element: <AdminOrder />
    },
    {
        path: "/AdminLogin",
        element: <AdminLogin />
    },
    {
        path: "/Cart",
        element: <Cart />
    },
    {
        path: "/AdminAddIngredient",
        element: <AdminAddIngredient />
    },
    {
        path: "/AdminAddNotification",
        element: <AdminAddNotification />
    }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <CartProvider>
        <RouterProvider router={router} />
    </CartProvider>
);

reportWebVitals();
