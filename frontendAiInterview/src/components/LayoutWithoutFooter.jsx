import { Outlet } from "react-router";
import Header from "./Header";
import React from "react";

function LayoutWithoutFooter() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default LayoutWithoutFooter;

