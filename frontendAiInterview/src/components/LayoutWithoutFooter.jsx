import { Outlet } from "react-router-dom";
import Header from "./Header";
import React from "react";


function LayoutWithoutFooter() {
    return(
        <>
            <Header/>
            <Outlet/>
        </>
    )
}

export default LayoutWithoutFooter