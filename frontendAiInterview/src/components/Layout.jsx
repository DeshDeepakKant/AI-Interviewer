import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import React from "react";


function Layout() {
    return(
        <>
            <Header/>
            <Outlet/>
            <Footer/>
        </>
    )
}

export default Layout