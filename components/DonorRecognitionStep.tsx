// @ts-nocheck
'use client'

import { useState } from 'react'
import { User, Mail, MessageCircle, Gift, Eye, Heart, Shield } from 'lucide-react'

export interface DonorPreferences {
  recognition: {
    type: 'connected' | 'anonymous'
    displayName: string
    shareContactInfo: boolean
    shareWithOrganizations: boolean
  }
  communication: {
    email: {
      projectUpdates: boolean
      marketingEmails: boolean
      donationMatchOpportunities: boolean
    }
    smsUpdates: boolean
    whatsappUpdates: boolean
    physicalThankYouCard: boolean
  }
  additional: {
    publicRecognition: boolean
    dedication: string
    shareWithPartners: boolean
  }
  consent: {
    privacyPolicy: boolean
    terms: boolean
  }
}

interface DonorRecognitionStepProps {
  totalAmount: number
  currency: string
  onContinue: (preferences: DonorPreferences) => void
  onBack: () => void
}

export default function DonorRecognitionStep({ totalAmount, currency, onContinue, onBack }: DonorRecognitionStepProps) {
  const [preferences, setPreferences] = useState<DonorPreferences>({
    recognition: {
      type: 'connected',
      displayName: 'full_name',
      shareContactInfo: true,
      shareWithOrganizations: true
    },
    communication: {
      email: {
        projectUpdates: true,
        marketingEmails: true,
        donationMatchOpportunities: true
      },
      smsUpdates: false,
      whatsappUpdates: false,
      physicalThankYouCard: false
    },
    additional: {
      publicRecognition: false,
      dedication: '',
      shareWithPartners: false
    },
    consent: {
      privacyPolicy: false,
      terms: false
    }
  })
  const [error, setError] = useState('')

  const updateRecognition = (field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      recognition: { ...prev.recognition, [field]: value }
    }))
  }

  const updateCommunication = (field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      communication: { ...prev.communication, [field]: value }
    }))
  }

  const updateEmail = (field: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      communication: {
        ...prev.communication,
        email: { ...prev.communication.email, [field]: value }
      }
    }))
  }

  const updateAdditional = (field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      additional: { ...prev.additional, [field]: value }
    }))
  }

  const updateConsent = (field: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      consent: { ...prev.consent, [field]: value }
    }))
  }

  const handleContinue = () => {
    setError('')
    if (!preferences.consent.privacyPolicy || !preferences.consent.terms) {
      setError('Please accept the privacy policy and terms to continue')
      return
    }
    onContinue(preferences)
  }

  const getRecognitionLabel = () => {
    switch (preferences.recognition.type) {
      case 'connected': return 'Connected Donor'
      case 'anonymous': return 'Anonymous Donor'
      default: return 'Donor'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recognition & Preferences</h1>
              <p className="text-gray-600">Choose how you would like to be recognized and stay connected</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Donation</p>
              <p className="text-xl font-bold text-gg-primary">
                {totalAmount.toFixed(2)} {currency}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Recognition Section */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gg-primary" />
              <h2 className="font-semibold text-gray-900">How would you like to be recognized?</h2>
            </div>

            <div className="space-y-3">
              <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                preferences.recognition.type === 'connected'
                  ? 'border-gg-primary bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="recognition"
                  value="connected"
                  checked={preferences.recognition.type === 'connected'}
                  onChange={() => updateRecognition('type', 'connected')}
                  className="mt-1 w-4 h-4 text-gg-primary"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Connect me with the organizations</div>
                  <p className="text-sm text-gray-600 mt-1">
                    Share my name and contact information, so the organizations can thank me and keep me up to date.
                  </p>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                preferences.recognition.type === 'anonymous'
                  ? 'border-gg-primary bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="recognition"
                  value="anonymous"
                  checked={preferences.recognition.type === 'anonymous'}
                  onChange={() => updateRecognition('type', 'anonymous')}
                  className="mt-1 w-4 h-4 text-gg-primary"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Make my donation anonymous</div>
                  <p className="text-sm text-gray-600 mt-1">
                    AcaciaGiving will use my information to provide donation updates, but my name and contact information will not be shared with the organizations.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-gg-primary" />
              <h2 className="font-semibold text-gray-900">Communication Preferences</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.communication.email.projectUpdates}
                  onChange={(e) => updateEmail('projectUpdates', e.target.checked)}
                  className="mt-1 w-4 h-4 text-gg-primary rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Email me periodic reports from the project I supported</div>
                  <p className="text-sm text-gray-600">Get updates on how your donation is making a difference.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.communication.email.marketingEmails}
                  onChange={(e) => updateEmail('marketingEmails', e.target.checked)}
                  className="mt-1 w-4 h-4 text-gg-primary rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Plus, email me inspiring stories, exclusive promotions, and donation match opportunities to amplify my impact!</div>
                  <p className="text-sm text-gray-600">Stay inspired and discover new ways to make a difference.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.communication.email.donationMatchOpportunities}
                  onChange={(e) => updateEmail('donationMatchOpportunities', e.target.checked)}
                  className="mt-1 w-4 h-4 text-gg-primary rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Notify me about donation match opportunities</div>
                  <p className="text-sm text-gray-600">Be the first to know when your gift can be doubled or matched.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">
                <MessageCircle className="w-4 h-4 text-gray-400 mt-1" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Allow organizations to share project updates via WhatsApp/SMS</div>
                  <input
                    type="checkbox"
                    checked={preferences.communication.whatsappUpdates}
                    onChange={(e) => updateCommunication('whatsappUpdates', e.target.checked)}
                    className="mt-1 w-4 h-4 text-gg-primary rounded"
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Additional Preferences */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-gg-primary" />
              <h2 className="font-semibold text-gray-900">Additional Preferences</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.communication.physicalThankYouCard}
                  onChange={(e) => updateCommunication('physicalThankYouCard', e.target.checked)}
                  className="mt-1 w-4 h-4 text-gg-primary rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">I want to receive a thank you card from the organization</div>
                  <p className="text-sm text-gray-600">Physical address required for mailing.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">
                <Eye className="w-4 h-4 text-gray-400 mt-1" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">I want my donation to be publicly listed on the project page</div>
                  <p className="text-sm text-gray-600">Your name will be shown as: {getRecognitionLabel()}</p>
                  <input
                    type="checkbox"
                    checked={preferences.additional.publicRecognition}
                    onChange={(e) => updateAdditional('publicRecognition', e.target.checked)}
                    className="mt-2 w-4 h-4 text-gg-primary rounded"
                  />
                </div>
              </label>

              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dedicate this donation to:</label>
                <input
                  type="text"
                  value={preferences.additional.dedication}
                  onChange={(e) => updateAdditional('dedication', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gg-primary"
                  placeholder='e.g., "In memory of...", "In honor of..."'
                />
                <p className="text-xs text-gray-500 mt-1">Optional. This dedication may be shared with the organization if you choose to connect.</p>
              </div>
            </div>
          </div>

          {/* Public Recognition Preview */}
          <div className="bg-gradient-to-r from-gg-primary/10 to-orange-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-gg-primary" />
              <h2 className="font-semibold text-gray-900">Recognition Preview</h2>
            </div>
            <div className="bg-white rounded-lg p-4 border border-orange-100">
              <p className="text-gray-700">
                <span className="font-semibold text-gg-primary">{getRecognitionLabel()}</span> donated {totalAmount.toFixed(2)} {currency}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {preferences.recognition.type === 'anonymous'
                  ? 'Your identity will be kept private from the organization and public listings.'
                  : 'Your name and contact information will be shared with the organization so they can thank you.'}
              </p>
            </div>
          </div>

          {/* Privacy & Consent */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Privacy & Consent</h2>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              By continuing, you agree to our Privacy Policy. We respect your privacy and will never sell your information.
            </p>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.consent.privacyPolicy}
                  onChange={(e) => updateConsent('privacyPolicy', e.target.checked)}
                  className="mt-1 w-4 h-4 text-gg-primary rounded"
                />
                <span className="text-sm text-gray-700">
                  I have read and accept the <a href="/privacy" className="text-gg-primary hover:underline">Privacy Policy</a>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.consent.terms}
                  onChange={(e) => updateConsent('terms', e.target.checked)}
                  className="mt-1 w-4 h-4 text-gg-primary rounded"
                />
                <span className="text-sm text-gray-700">
                  I agree to the <a href="/terms" className="text-gg-primary hover:underline">Terms of Service</a>
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back to Payment
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="flex-1 bg-gg-primary hover:bg-gg-primary-hover text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Continue to Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
