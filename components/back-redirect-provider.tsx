"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { BackRedirectFirstStep } from "./back-redirect-first-step"
import { BackRedirectSecondStep } from "./back-redirect-second-step"
import { useRouter, usePathname } from "next/navigation"

type BackRedirectContextType = {
  showBackRedirect: (step: number) => void
  hideBackRedirect: () => void
  isBackRedirectVisible: boolean
  currentStep: number
  userData: any
  setUserData: (data: any) => void
  showSecondStep: () => void
}

const BackRedirectContext = createContext<BackRedirectContextType | undefined>(undefined)

export function useBackRedirect() {
  const context = useContext(BackRedirectContext)
  if (context === undefined) {
    throw new Error("useBackRedirect must be used within a BackRedirectProvider")
  }
  return context
}

interface BackRedirectProviderProps {
  children: ReactNode
}

export function BackRedirectProvider({ children }: BackRedirectProviderProps) {
  const [isBackRedirectVisible, setIsBackRedirectVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [userData, setUserData] = useState<any>({})
  const router = useRouter()
  const pathname = usePathname()

  // Carrega dados do localStorage
  useEffect(() => {
    const savedUserData = localStorage.getItem("userData")
    if (savedUserData) {
      try {
        const parsedData = JSON.parse(savedUserData)
        setUserData(parsedData)
      } catch (error) {
        console.error("Erro ao carregar dados do localStorage:", error)
        localStorage.removeItem("userData")
      }
    }
  }, [])

  const showBackRedirect = (step: number) => {
    console.log(`🔙 Mostrando back redirect - Step: ${step}`)
    setCurrentStep(step)
    setIsBackRedirectVisible(true)
  }

  const hideBackRedirect = () => {
    setIsBackRedirectVisible(false)
  }

  const showSecondStep = () => {
    setCurrentStep(2)
    setIsBackRedirectVisible(true)
  }

  return (
    <BackRedirectContext.Provider
      value={{
        showBackRedirect,
        hideBackRedirect,
        isBackRedirectVisible,
        currentStep,
        userData,
        setUserData,
        showSecondStep,
      }}
    >
      {children}
      {isBackRedirectVisible && currentStep === 1 && <BackRedirectFirstStep />}
      {isBackRedirectVisible && currentStep === 2 && userData && userData.debitos && <BackRedirectSecondStep />}
    </BackRedirectContext.Provider>
  )
}
