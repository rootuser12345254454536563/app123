import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { getWhatsAppApiStatus } from '../services/marketplaceService';
import {
  ArrowLeft,
  Smartphone,
  MessageCircle,
  CreditCard,
  Layers,
  CheckCircle2,
  Code,
  ShieldCheck,
  Server,
  Database,
  Lock,
  ExternalLink
} from 'lucide-react';

export const IntegrationGuideScreen: React.FC = () => {
  const { setScreen } = useStore();
  const [waStatus, setWaStatus] = useState<any>(null);

  useEffect(() => {
    getWhatsAppApiStatus().then(res => setWaStatus(res)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <button
        onClick={() => setScreen({ type: 'account' })}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Account</span>
      </button>

      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900">
          BUYJUMP Architecture & Deployment Guide
        </h1>
        <p className="text-xs text-slate-500">
          Complete architecture for USER, SELLER, ADMIN roles, Firebase Authentication, Cloud Firestore, Firebase Storage, and Meta WhatsApp Cloud API.
        </p>
      </div>

      {/* Architecture Visual Diagram */}
      <div className="bg-[#091A36] text-white rounded-3xl p-6 sm:p-8 font-mono text-xs shadow-xl space-y-4 overflow-x-auto">
        <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs">System Topology</h3>
        <pre className="text-slate-200 text-[11px] leading-relaxed">
{`                         BUYJUMP
                            │
              ┌─────────────┼─────────────┐
              │             │             │
            USER          SELLER         ADMIN
              │             │             │
       Email/Google/   Email/Google/    Email/
         Facebook        Facebook       Password
              │             │             │
              └─────────────┼─────────────┘
                            │
                      Firebase Auth
                            │
                        Firestore
                            │
                      Secure Backend
                      /           \\
                     /             \\
              WhatsApp API       Storage
                  │                 │
             Meta WhatsApp     Images/Files`}
        </pre>
      </div>

      {/* Section 1: Authentication & RBAC */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-[#0F2C59]">
          <Lock className="w-5 h-5 text-blue-600" />
          <h3 className="font-extrabold text-base text-slate-900">1. Firebase Authentication & Role-Based Access Control (RBAC)</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Authentication is driven by Firebase Authentication with strict password security (no plain text passwords stored in Firestore).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="font-black text-slate-900 block mb-1">USER</span>
            <p className="text-slate-600 text-[11px]">
              Registers with email or Google/Facebook OAuth. Automatic Firestore profile created with <code>role: 'user'</code> and <code>status: 'active'</code>.
            </p>
          </div>
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="font-black text-emerald-950 block mb-1">SELLER</span>
            <p className="text-emerald-800 text-[11px]">
              Registers business profile in Firestore <code>sellers</code> collection with <code>role: 'seller'</code> and <code>status: 'pending'</code>. Must be approved by Admin before publishing products.
            </p>
          </div>
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
            <span className="font-black text-amber-950 block mb-1">ADMIN</span>
            <p className="text-amber-800 text-[11px]">
              Master administrative credentials authenticated through Firebase Auth. Has full authority over user suspensions, seller approvals, and order status changes.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Meta WhatsApp Cloud API */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-emerald-700">
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-base text-slate-900">2. Official Meta WhatsApp Cloud API Integration</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          All order receipts, status dispatches, and merchant alerts route through the secure Express backend to the official Meta Graph API endpoints.
        </p>
        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-[11px] font-mono space-y-1">
          <p className="text-emerald-400 font-bold"># Environment Variables required for production live messages:</p>
          <p>WHATSAPP_ACCESS_TOKEN=your_permanent_system_user_token</p>
          <p>WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_number_id</p>
          <p>WHATSAPP_BUSINESS_ACCOUNT_ID=your_meta_waba_id</p>
          <p>WHATSAPP_VERIFY_TOKEN=buyjump_webhook_verify_token_2026</p>
        </div>
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
          <p className="font-bold">Webhook Endpoint:</p>
          <p className="font-mono text-[11px]">GET /api/whatsapp/webhook (Meta verification with hub.challenge)</p>
          <p className="font-mono text-[11px]">POST /api/whatsapp/webhook (Real-time message & delivery status receipts)</p>
        </div>
      </div>

      {/* Section 3: Firebase Console Settings Required */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#0F2C59]">
          <Database className="w-5 h-5 text-[#0F2C59]" />
          <h3 className="font-extrabold text-base text-slate-900">3. Firebase Console Configuration Checklist</h3>
        </div>
        <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1.5">
          <li><strong>Firebase Authentication:</strong> Ensure <em>Email/Password</em> is enabled under Sign-in methods.</li>
          <li><strong>Google Sign-In:</strong> Enable <em>Google</em> under Sign-in methods and set your project support email.</li>
          <li><strong>Facebook Login:</strong> Enable <em>Facebook</em> under Sign-in methods and supply your Meta Developer App ID and Secret.</li>
          <li><strong>Cloud Firestore:</strong> Provisioned with rules deployed from <code>firestore.rules</code>.</li>
          <li><strong>Firebase Storage:</strong> Enable Firebase Storage in the console for product photo uploads.</li>
        </ul>
      </div>
    </div>
  );
};
