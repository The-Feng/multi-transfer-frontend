import { useCallback, useState } from 'react';
import { JsonRpcProvider, formatEther } from 'ethers';

export default function ProviderDataPage() {
  const [rpcUrl, setRpcUrl] = useState('https://mainnet.infura.io/v3/YOUR_KEY');
  const [address, setAddress] = useState('');
  const [provider, setProvider] = useState<JsonRpcProvider | null>(null);
  const [networkInfo, setNetworkInfo] = useState('');
  const [latestBlock, setLatestBlock] = useState<number>();
  const [balance, setBalance] = useState<string>();
  const [status, setStatus] = useState('请填入 Infura / Alchemy RPC 地址后点击连接');
  const [isBusy, setIsBusy] = useState(false);

  const connectRpc = useCallback(async () => {
    try {
      setIsBusy(true);
      setStatus('正在连接远程节点...');
      const nextProvider = new JsonRpcProvider(rpcUrl);
      const [network, blockNumber] = await Promise.all([
        nextProvider.getNetwork(),
        nextProvider.getBlockNumber(),
      ]);

      setProvider(nextProvider);
      setNetworkInfo(`${network.name} · Chain ID ${network.chainId}`);
      setLatestBlock(blockNumber);
      setStatus('连接成功，可以读取区块与余额信息。');
    } catch (error) {
      console.error(error);
      setStatus((error as Error).message || '连接失败，请检查 RPC 地址或 Key');
    } finally {
      setIsBusy(false);
    }
  }, [rpcUrl]);

  const readBalance = useCallback(async () => {
    if (!provider) {
      setStatus('请先连接 RPC');
      return;
    }
    if (!address) {
      setStatus('请输入要查询的地址');
      return;
    }

    try {
      setIsBusy(true);
      setStatus('查询余额中...');
      const value = await provider.getBalance(address);
      setBalance(`${formatEther(value)} ETH`);
      setStatus('余额查询完成');
    } catch (error) {
      console.error(error);
      setStatus((error as Error).message || '余额查询失败');
    } finally {
      setIsBusy(false);
    }
  }, [address, provider]);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-label">节点服务</p>
          <h2>通过 Infura / Alchemy 读取链上数据</h2>
          <p className="panel-desc">
            适用于服务器端渲染或无钱包环境，输入任意兼容的 HTTPS RPC Endpoint，即可检索区块高度与地址余额。
          </p>
        </div>
      </div>

      <div className="card">
        <h3>节点连接</h3>
        <label>
          RPC 地址
          <input className="input" value={rpcUrl} onChange={(e) => setRpcUrl(e.target.value)} />
        </label>
        <button className="primary-btn" disabled={isBusy} onClick={connectRpc} type="button">
          {isBusy ? '连接中...' : '连接远程节点'}
        </button>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>连接详情</h3>
          <ul className="info-list">
            <li>
              <span>网络</span>
              <strong>{networkInfo || '--'}</strong>
            </li>
            <li>
              <span>最新区块</span>
              <strong>{latestBlock ?? '--'}</strong>
            </li>
            <li>
              <span>余额结果</span>
              <strong>{balance || '--'}</strong>
            </li>
          </ul>
        </div>
        <div className="card">
          <h3>读取余额</h3>
          <label>
            钱包地址
            <input
              className="input"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <button className="secondary-btn" disabled={isBusy} onClick={readBalance} type="button">
            {isBusy ? '查询中...' : '读取余额'}
          </button>
        </div>
      </div>

      <div className="status-bar">{status}</div>
    </section>
  );
}

