package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.components.StoreBottomBar
import com.example.ui.components.StoreTopAppBar
import com.example.ui.screens.*
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.Screen
import com.example.ui.viewmodel.StoreViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                PukalavanStoreApp()
            }
        }
    }
}

@Composable
fun PukalavanStoreApp(viewModel: StoreViewModel = viewModel()) {
    val currentScreen by viewModel.currentScreen.collectAsState()
    val strings by viewModel.strings.collectAsState()
    val cartItems by viewModel.cartItemsWithProducts.collectAsState()
    val cartCount = remember(cartItems) { cartItems.sumOf { it.cartItem.quantity } }

    val isTopLevelScreen = currentScreen is Screen.Home ||
            currentScreen is Screen.Categories ||
            currentScreen is Screen.Search ||
            currentScreen is Screen.Cart ||
            currentScreen is Screen.Account

    // Handle back button on top level screens to return to Home
    if (!isTopLevelScreen) {
        BackHandler {
            viewModel.navigateBack()
        }
    } else if (currentScreen !is Screen.Home) {
        BackHandler {
            viewModel.navigateTo(Screen.Home)
        }
    }

    Scaffold(
        topBar = {
            if (isTopLevelScreen) {
                StoreTopAppBar(
                    viewModel = viewModel,
                    strings = strings,
                    cartCount = cartCount,
                    onOpenCart = { viewModel.navigateTo(Screen.Cart) },
                    onOpenWishlist = { viewModel.navigateTo(Screen.Wishlist) },
                    onSearchClick = { viewModel.navigateTo(Screen.Search) }
                )
            }
        },
        bottomBar = {
            if (isTopLevelScreen) {
                StoreBottomBar(
                    currentScreen = currentScreen,
                    cartItemCount = cartCount,
                    strings = strings,
                    onNavigate = { screen -> viewModel.navigateTo(screen) }
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (val screen = currentScreen) {
                is Screen.Home -> HomeScreen(viewModel)
                is Screen.Categories -> CategoriesScreen(viewModel)
                is Screen.Search -> SearchScreen(viewModel)
                is Screen.Cart -> CartScreen(viewModel)
                is Screen.Account -> AccountScreen(viewModel)
                is Screen.ProductDetail -> ProductDetailScreen(productId = screen.productId, viewModel = viewModel)
                is Screen.Checkout -> CheckoutScreen(viewModel)
                is Screen.OrderSuccess -> OrderSuccessScreen(orderId = screen.orderId, viewModel = viewModel)
                is Screen.MyOrders -> OrdersListScreen(viewModel)
                is Screen.OrderDetail -> OrderDetailScreen(orderId = screen.orderId, viewModel = viewModel)
                is Screen.Wishlist -> WishlistScreen(viewModel)
                is Screen.SavedAddresses -> SavedAddressesScreen(viewModel)
                is Screen.Auth -> AuthScreen(viewModel)
                is Screen.AdminLogin -> AdminLoginScreen(viewModel)
                is Screen.AdminDashboard -> AdminDashboardScreen(viewModel)
                is Screen.AdminEditProduct -> AdminAddEditProductScreen(productId = screen.productId, viewModel = viewModel)
                is Screen.IntegrationGuide -> IntegrationGuideScreen(viewModel)
                else -> HomeScreen(viewModel)
            }
        }
    }
}
