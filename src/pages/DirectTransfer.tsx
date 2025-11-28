import { useCallback, useMemo, useState } from 'react';
import { BrowserProvider, JsonRpcSigner, formatEther, parseEther } from 'ethers';
import type { Eip1193Provider } from 'ethers';

interface WindowWithEthereum extends Window {
  ethereum?: Eip1193Provider;
}

const formatAddress = (addr?: string) => {
  if (!addr) return '--';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export default function DirectTransferPage() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>();
  const [balance, setBalance] = useState<string>();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isReady = useMemo(() => Boolean(provider && signer && account), [provider, signer, account]);

  const connectWallet = useCallback(async () => {
    try {
      setStatus('正在请求钱包授权...');
      const win = window as WindowWithEthereum;

      if (!win.ethereum) {
        setStatus('未检测到浏览器钱包，请安装 MetaMask 或其他 EIP-1193 钱包扩展。');
        return;
      }

      const nextProvider = new BrowserProvider(win.ethereum);
      await nextProvider.send('eth_requestAccounts', []);
      const nextSigner = await nextProvider.getSigner();
      const addr = await nextSigner.getAddress();
      const bal = await nextProvider.getBalance(addr);

      setProvider(nextProvider);
      setSigner(nextSigner);
      setAccount(addr);
      setBalance(formatEther(bal));
      setStatus('钱包连接成功，可以发起转账。');
    } catch (error) {
      console.error(error);
      setStatus((error as Error).message || '钱包连接失败');
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!provider || !account) return;
    const next = await provider.getBalance(account);
    setBalance(formatEther(next));
  }, [provider, account]);

  const handleTransfer = useCallback(async () => {
    if (!signer) {
      setStatus('请先连接钱包');
      return;
    }
    if (!toAddress || !amount) {
      setStatus('请填写完整的收款地址和金额');
      return;
    }

    try {
      setIsSending(true);
      setStatus('交易提交中，请在钱包里确认...');
      const tx = await signer.sendTransaction({
        to: toAddress,
        value: parseEther(amount),
      });
      setStatus(`交易已发送，等待上链，哈希：${tx.hash}`);
      await tx.wait();
      await refreshBalance();
      setStatus('✅ 交易已确认，余额已更新');
      setAmount('');
    } catch (error) {
      console.error(error);
      setStatus((error as Error).message || '交易失败，请检查输入');
    } finally {
      setIsSending(false);
    }
  }, [amount, refreshBalance, signer, toAddress]);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-label">浏览器钱包</p>
          <h2>连接 MetaMask 等钱包发起转账</h2>
          <p className="panel-desc">直接调用本地钱包完成授权、签名与广播，体验一致的以太坊交互流程。</p>
        </div>
        <button className="primary-btn" onClick={connectWallet} type="button">
          {isReady ? '重新连接钱包' : '连接浏览器钱包'}
        </button>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>钱包概览</h3>
          <ul className="info-list">
            <li>
              <span>当前地址</span>
              <strong>{formatAddress(account)}</strong>
            </li>
            <li>
              <span>当前余额</span>
              <strong>{balance ? `${Number(balance).toFixed(4)} ETH` : '--'}</strong>
            </li>
            <li>
              <span>链上状态</span>
              <strong>{isReady ? '已连接' : '未连接'}</strong>
            </li>
          </ul>
        </div>

        <div className="card">
          <h3>发起转账</h3>
          <label>
            收款地址
            <input
              className="input"
              placeholder="0x..."
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
            />
          </label>
          <label>
            金额（ETH）
            <input
              className="input"
              placeholder="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <button
            className="primary-btn"
            disabled={!isReady || isSending}
            onClick={handleTransfer}
            type="button"
          >
            {isSending ? '发送中...' : '立即发送'}
          </button>
        </div>
      </div>

      <div className="status-bar">{status || '等待操作中'}</div>
    </section>
  );
}

