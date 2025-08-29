import "./App.css";
import React from "react";
import HomePage from "./components/Homepage";
import LoginPage from "./components/LoginPage";
import Testing from "./components/testing";
import Header from "./components/Header";
import { Outlet } from "react-router";

function App() {
  return (
    <>
      <HomePage />
    </>
  );
}

export default App;

