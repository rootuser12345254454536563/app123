package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import com.example.ui.viewmodel.StoreViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IntegrationGuideScreen(viewModel: StoreViewModel) {
    BackHandler { viewModel.navigateBack() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Integrations & Setup Guide", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { viewModel.navigateBack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = TextPrimary
                )
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(SlateBackground),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Text(
                    text = "Pukalavan Store Production Setup",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = TextPrimary
                )
                Text(
                    text = "Complete production guidelines for external APIs, databases, authentication, and payment gateways.",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }

            // 1. WhatsApp Configuration
            item {
                IntegrationGuideCard(
                    title = "1. WhatsApp Order Notifications & API",
                    icon = Icons.Default.Chat,
                    accentColor = WhatsAppGreen,
                    content = """
• Pre-configured WhatsApp direct messaging: Currently uses WhatsApp deep-linking (wa.me/api.whatsapp.com) to immediately open the customer's WhatsApp with a pre-filled, formatted order summary.
• Store WhatsApp Number: Configurable directly inside 'Admin Dashboard' -> 'Settings' tab. Default is +94 77 123 4567.
• WhatsApp Business Cloud API (Server-side): For automated server-side message dispatching without client interaction, configure Meta WhatsApp Business API webhook with your System User Access Token and Phone Number ID.
                    """.trimIndent()
                )
            }

            // 2. Firebase Configuration
            item {
                IntegrationGuideCard(
                    title = "2. Firebase Database & Authentication",
                    icon = Icons.Default.Cloud,
                    accentColor = AmberGold,
                    content = """
• google-services.json: Download your google-services.json from Firebase Console (Project Settings) and place it under /app/google-services.json.
• Firestore Database: Uncomment 'libs.firebase.firestore' in app/build.gradle.kts to enable cloud Firestore multi-device synchronization.
• Firebase Storage: Used for cloud image hosting when admin uploads product photos from device.
• Cloud Functions: Set up onCreate trigger on 'orders' collection to send automated WhatsApp/SMS/Email notifications.
                    """.trimIndent()
                )
            }

            // 3. Social Login
            item {
                IntegrationGuideCard(
                    title = "3. Google, Facebook & X (Twitter) OAuth",
                    icon = Icons.Default.VpnKey,
                    accentColor = AccentBlue,
                    content = """
• Google Sign-In: Configure Web Client ID in Google Cloud Console. Credential Manager dependencies are pre-configured.
• Facebook Login: Add facebook_app_id in strings.xml and register SHA-1 fingerprint in Meta Developer Portal.
• X (Twitter) API: Create Twitter Developer App and obtain OAuth 2.0 Client ID and Secret.
                    """.trimIndent()
                )
            }

            // 4. Payment Gateway Integration
            item {
                IntegrationGuideCard(
                    title = "4. Sri Lankan Payment Gateways (PayHere / FriMi / WebXpay)",
                    icon = Icons.Default.CreditCard,
                    accentColor = NavyPrimary,
                    content = """
• Cash on Delivery (COD) is active by default.
• Online Payment Architecture is ready: Integrates with PayHere Sri Lanka SDK (lk.payhere:android-sdk) or Stripe Mobile SDK.
• Configure Merchant ID, Merchant Secret, and currency (LKR) in Admin Settings.
                    """.trimIndent()
                )
            }

            // 5. Admin Security
            item {
                IntegrationGuideCard(
                    title = "5. Admin Credentials & Role-Based Access",
                    icon = Icons.Default.Security,
                    accentColor = NavyPrimaryDark,
                    content = """
• Demo passcode for testing: 'admin123' or 'pukalavan2026'.
• In production, authenticate admins via Firebase Auth custom claims (admin: true) or a secure backend API.
• Credentials are strictly kept hidden from public user views.
                    """.trimIndent()
                )
            }
        }
    }
}

@Composable
fun IntegrationGuideCard(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    accentColor: Color,
    content: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(accentColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = null, tint = accentColor, modifier = Modifier.size(20.dp))
                }
                Spacer(modifier = Modifier.width(10.dp))
                Text(title, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextPrimary)
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(content, fontSize = 12.sp, lineHeight = 18.sp, color = TextSecondary)
        }
    }
}
