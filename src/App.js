import './App.css';
import MyNFT from './MyNFT.js'
import Exchange from './Exchange.js'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Exchange />}  />
        <Route path="/NFT" element={<MyNFT />}  />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
