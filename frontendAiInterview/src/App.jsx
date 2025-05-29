import "./App.css";
import React from "react";
import HomePage from "./components/homepage";
import LoginPage from "./components/loginPage";
import Testing from "./components/testing";
import Header from "./components/Header";
import { Outlet } from "react-router";
import { Analytics } from "@vercel/analytics/next"

function App() {
  return (
    <>
      <HomePage />
    </>
  );
}

export default App;

