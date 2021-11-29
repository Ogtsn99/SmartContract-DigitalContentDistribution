import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Symfoni } from "./hardhat/SymfoniContext";
import { Main } from './components/Main';
import { Navbar } from "./components/Navbar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ContentAndTokenInterface } from "./components/ContentAndTokenInterface";
import { FileSharingContractInterface } from "./components/FileSharingContractInterface";

function App() {

  return (
    <div className="App">
        <Symfoni autoInit={true} >
          <Navbar/>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Main/>} />
              <Route path="/contentAndToken" element={<ContentAndTokenInterface/>} />
              <Route path="/fileSharingContract" element={<FileSharingContractInterface/> }/>
            </Routes>
          </BrowserRouter>
          
        </Symfoni>
    </div>
  );
}

export default App;
