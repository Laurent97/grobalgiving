'use client'

import { ShoppingCart, CreditCard, User, FileCheck, Heart } from 'lucide-react'

interface DonationStepperProps {
  currentStep: number
}

const steps = [
  { id: 1, label: 'Cart', icon: ShoppingCart },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Recognition', icon: User },
  { id: 4, label: 'Confirm', icon: FileCheck },
  { id: 5, label: 'Thank You', icon: Heart }
]

export default function DonationStepper({ currentStep }: DonationStepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-gg-primary text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isActive ? 'text-gg-primary' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
