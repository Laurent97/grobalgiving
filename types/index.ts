// Nonprofits
export type Nonprofit = {
  id: string
  name: string
  slug: string
  description: string
  logo_url?: string
  verified: boolean
  created_at: string
}

// Projects
export type Project = {
  id: string
  nonprofit_id: string
  title: string
  slug: string
  description: string
  goal_amount: number
  current_amount: number
  amount_received?: number
  amount_left?: number
  location: string
  category: 'Education' | 'Physical Health' | 'Child Protection' | 'Economic Opportunity' | 'Water & Sanitation' | 'disaster' | string
  status: 'pending' | 'active' | 'completed' | 'rejected'
  main_image_url: string
  gallery_images?: string[]
  created_at: string
  start_date?: string
  end_date?: string
  featured?: boolean
  is_visible?: boolean
  tags?: string[]
  video_url?: string
  nonprofit?: Nonprofit
  nonprofits?: Nonprofit
  percentage_funded?: number
  donor_count?: number
  monthly_donor_count?: number
}

// Donations
export type Donation = {
  id: string
  donor_id?: string
  project_id: string
  amount: number
  currency: string
  frequency: 'once' | 'monthly'
  status: 'pending' | 'completed' | 'failed' | 'verified' | 'rejected'
  payment_method_type?: 'bank' | 'mobile_money' | 'crypto' | 'card' | 'paypal'
  payment_method_id?: string
  transaction_reference?: string
  receipt_url?: string
  admin_notes?: string
  verified_by?: string
  verified_at?: string
  dedication_type?: 'memory' | 'honor'
  dedication_name?: string
  donor_comment?: string
  created_at: string
  project?: Project
  donor?: UserProfile
}

// User Profiles
export type UserProfile = {
  id: string
  full_name?: string
  email?: string
  role: 'donor' | 'nonprofit_admin' | 'admin'
  nonprofit_id?: string
  avatar_url?: string
  created_at: string
}

// Favorites
export type Favorite = {
  user_id: string
  project_id: string
  created_at: string
}

// Project Updates (Impact Reports)
export type ProjectUpdate = {
  id: string
  project_id: string
  author_id: string
  content: string
  media_urls?: string[]
  created_at: string
}

// Admin Audit Log
export type AdminAuditLog = {
  id: string
  admin_id: string
  action: string
  target_id: string
  old_value?: Record<string, any>
  new_value?: Record<string, any>
  created_at: string
}

// Cart Item
export type CartItem = {
  id: string
  projectId: string
  projectTitle: string
  amount: number
  frequency: 'once' | 'monthly'
}

// Payment Method Types
export type BankAccount = {
  id: string
  account_name: string
  bank_name: string
  account_number: string
  routing_number?: string
  swift_bic?: string
  account_type: 'international' | 'local' | 'regional'
  currency: string
  country: string
  branch_address?: string
  instructions?: string
  bank_logo_url?: string
  status: boolean
  display_order: number
  created_at: string
  updated_at: string
  created_by?: string
}

export type MobileMoneyAccount = {
  id: string
  provider_name: string
  country: string
  phone_number: string
  account_name: string
  network_type: string
  currency: string
  fee_structure: 'sender' | 'receiver' | 'shared'
  instructions?: string
  status: boolean
  display_order: number
  created_at: string
  updated_at: string
  created_by?: string
}

export type CryptoWallet = {
  id: string
  currency_name: string
  currency_symbol: string
  wallet_address: string
  network: string
  qr_code_url?: string
  min_amount: number
  exchange_rate_source: string
  status: boolean
  display_order: number
  created_at: string
  updated_at: string
  created_by?: string
}

export type PaypalAccount = {
  id: string
  email: string
  account_name: string
  currency: string
  me_link?: string
  client_id?: string
  instructions?: string
  status: boolean
  display_order: number
  created_at: string
  updated_at: string
  created_by?: string
}

export type PaymentMethod = BankAccount | MobileMoneyAccount | CryptoWallet | PaypalAccount

export type DonationCartItem = {
  id: string
  user_id?: string
  session_id?: string
  project_id: string
  amount: number
  currency: string
  dedication_type?: 'memory' | 'honor'
  dedication_name?: string
  comment?: string
  created_at: string
  updated_at: string
  project?: Project
}

export type PaymentAuditLog = {
  id: string
  action: string
  entity_type: string
  entity_id: string
  changes?: Record<string, any>
  performed_by?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}
