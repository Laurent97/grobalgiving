import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch all active payment methods (public)
export async function GET(req: Request) {
  try {
    const supabase = await createClient()

    // Fetch active bank accounts
    const { data: bankAccounts, error: bankError } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('status', true)
      .order('display_order', { ascending: true })

    if (bankError) {
      console.error('Error fetching bank accounts:', bankError)
    }

    // Fetch active mobile money accounts
    const { data: mobileMoneyAccounts, error: mobileError } = await supabase
      .from('mobile_money_accounts')
      .select('*')
      .eq('status', true)
      .order('display_order', { ascending: true })

    if (mobileError) {
      console.error('Error fetching mobile money accounts:', mobileError)
    }

    // Fetch active crypto wallets
    const { data: cryptoWallets, error: cryptoError } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('status', true)
      .order('display_order', { ascending: true })

    if (cryptoError) {
      console.error('Error fetching crypto wallets:', cryptoError)
    }

    // Fetch active PayPal accounts
    const { data: paypalAccounts, error: paypalError } = await supabase
      .from('paypal_accounts')
      .select('*')
      .eq('status', true)
      .order('display_order', { ascending: true })

    if (paypalError) {
      console.error('Error fetching PayPal accounts:', paypalError)
    }

    return NextResponse.json({
      bank_accounts: bankAccounts || [],
      mobile_money: mobileMoneyAccounts || [],
      crypto_wallets: cryptoWallets || [],
      paypal_accounts: paypalAccounts || []
    })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
