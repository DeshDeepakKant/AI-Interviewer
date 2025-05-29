import { Outlet } from "react-router";
import Footer from "./Footer";
import Header from "./Header";
import React from "react";

function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;

