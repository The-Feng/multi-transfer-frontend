import { NavLink, Route, Routes } from 'react-router-dom';
import DirectTransferPage from './pages/DirectTransfer';
import ProviderDataPage from './pages/ProviderData';

const navLinks = [
  { to: '/', label: '浏览器钱包' },
  { to: '/provider', label: '节点服务' },
];

export default function App() {
  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="hero-badge">Web3 Dashboard</p>
          <h1>多方式以太坊交互面板</h1>
          <p className="hero-desc">
            一站式查看地址信息、发送交易与读取远程节点数据。风格借鉴以太坊浏览器，适配桌面与移动端。
          </p>
        </div>
        <div className="hero-stats">
          <div>
            <span className="label">支持网络</span>
            <p>EVM 兼容</p>
          </div>
          <div>
            <span className="label">模式</span>
            <p>钱包 / RPC</p>
          </div>
        </div>
      </header>

      <nav className="main-nav">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <main className="page-container">
        <Routes>
          <Route path="/" element={<DirectTransferPage />} />
          <Route path="/provider" element={<ProviderDataPage />} />
        </Routes>
      </main>
    </div>
  );
}

