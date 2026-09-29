package com.example.ui.screens

import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ProductEntity
import com.example.ui.components.AppProductImage
import com.example.ui.theme.*
import com.example.ui.viewmodel.StoreViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminAddEditProductScreen(
    productId: Long?,
    viewModel: StoreViewModel
) {
    BackHandler { viewModel.navigateBack() }

    val context = LocalContext.current
    val categories by viewModel.categories.collectAsState()
    val allProducts by viewModel.allProducts.collectAsState()
    val existingProduct = remember(productId, allProducts) {
        if (productId != null) allProducts.firstOrNull { it.id == productId } else null
    }

    var name by remember { mutableStateOf(existingProduct?.name ?: "") }
    var description by remember { mutableStateOf(existingProduct?.description ?: "") }
    var price by remember { mutableStateOf(existingProduct?.let { it.price.toInt().toString() } ?: "") }
    var discountPrice by remember { mutableStateOf(existingProduct?.let { if (it.discountPrice > 0) it.discountPrice.toInt().toString() else "" } ?: "") }
    var stockQuantity by remember { mutableStateOf(existingProduct?.stockQuantity?.toString() ?: "15") }
    var category by remember { mutableStateOf(existingProduct?.category ?: (categories.firstOrNull()?.name ?: "Electronics & Gadgets")) }
    var brand by remember { mutableStateOf(existingProduct?.brand ?: "") }
    var sku by remember { mutableStateOf(existingProduct?.sku ?: "") }
    var specifications by remember { mutableStateOf(existingProduct?.specifications ?: "") }
    var variants by remember { mutableStateOf(existingProduct?.variants ?: "") }
    var weight by remember { mutableStateOf(existingProduct?.weight ?: "") }
    var isFeatured by remember { mutableStateOf(existingProduct?.isFeatured ?: false) }
    var isBestSeller by remember { mutableStateOf(existingProduct?.isBestSeller ?: false) }
    var isNewArrival by remember { mutableStateOf(existingProduct?.isNewArrival ?: true) }
    var isVisible by remember { mutableStateOf(existingProduct?.isVisible ?: true) }

    // Multi-image selection list from device
    var imageList by remember {
        mutableStateOf(
            existingProduct?.images?.split(",")?.map { it.trim() }?.filter { it.isNotEmpty() }
                ?: listOf("res:ic_store_logo")
        )
    }

    // Photo picker from local device gallery
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            imageList = (imageList.filter { it != "res:ic_store_logo" } + uri.toString())
            Toast.makeText(context, "Photo added from local device!", Toast.LENGTH_SHORT).show()
        }
    }

    var showCategoryDropdown by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (productId == null) "Add New Product" else "Edit Product", fontWeight = FontWeight.Bold, color = Color(0xFF0F172A)) },
                navigationIcon = {
                    IconButton(onClick = { viewModel.navigateBack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color(0xFF0F172A))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = Color(0xFF0F172A)
                )
            )
        },
        bottomBar = {
            Surface(
                color = Color.White,
                shadowElevation = 8.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .windowInsetsPadding(WindowInsets.navigationBars)
            ) {
                Box(modifier = Modifier.padding(16.dp)) {
                    Button(
                        onClick = {
                            if (name.isBlank() || price.isBlank()) {
                                Toast.makeText(context, "Product name and price are required", Toast.LENGTH_SHORT).show()
                                return@Button
                            }

                            val productToSave = ProductEntity(
                                id = existingProduct?.id ?: 0L,
                                name = name.trim(),
                                description = description.trim(),
                                price = price.toDoubleOrNull() ?: 0.0,
                                discountPrice = discountPrice.toDoubleOrNull() ?: 0.0,
                                stockQuantity = stockQuantity.toIntOrNull() ?: 0,
                                category = category,
                                brand = brand.trim(),
                                sku = sku.trim(),
                                specifications = specifications.trim(),
                                variants = variants.trim(),
                                weight = weight.trim(),
                                images = imageList.joinToString(","),
                                isFeatured = isFeatured,
                                isBestSeller = isBestSeller,
                                isNewArrival = isNewArrival,
                                isVisible = isVisible,
                                rating = existingProduct?.rating ?: 5.0f,
                                reviewCount = existingProduct?.reviewCount ?: 1
                            )

                            viewModel.saveProduct(productToSave)
                            Toast.makeText(context, "Product saved to Pukalavan Store!", Toast.LENGTH_SHORT).show()
                            viewModel.navigateBack()
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF0F3E88),
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .testTag("save_product_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Save,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Save & Publish Product",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        val adminFieldColors = OutlinedTextFieldDefaults.colors(
            focusedTextColor = Color(0xFF0F172A),
            unfocusedTextColor = Color(0xFF0F172A),
            disabledTextColor = Color(0xFF0F172A),
            focusedContainerColor = Color.White,
            unfocusedContainerColor = Color.White,
            disabledContainerColor = Color.White,
            cursorColor = Color(0xFF0F3E88),
            focusedBorderColor = Color(0xFF1E6FD9),
            unfocusedBorderColor = Color(0xFF94A3B8),
            disabledBorderColor = Color(0xFF94A3B8),
            focusedLabelColor = Color(0xFF0F3E88),
            unfocusedLabelColor = Color(0xFF334155),
            disabledLabelColor = Color(0xFF334155),
            focusedPlaceholderColor = Color(0xFF64748B),
            unfocusedPlaceholderColor = Color(0xFF64748B),
            disabledPlaceholderColor = Color(0xFF64748B),
            focusedLeadingIconColor = Color(0xFF0F3E88),
            unfocusedLeadingIconColor = Color(0xFF475569),
            disabledLeadingIconColor = Color(0xFF475569),
            focusedTrailingIconColor = Color(0xFF0F3E88),
            unfocusedTrailingIconColor = Color(0xFF475569),
            disabledTrailingIconColor = Color(0xFF475569)
        )
        val adminTextStyle = TextStyle(
            color = Color(0xFF0F172A),
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium
        )

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .imePadding()
                .background(SlateBackground),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Product Photos from Device
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Product Photos (${imageList.size})",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = Color(0xFF0F172A)
                            )
                            OutlinedButton(
                                onClick = { imagePickerLauncher.launch("image/*") },
                                colors = ButtonDefaults.outlinedButtonColors(
                                    containerColor = Color(0xFFF1F5F9),
                                    contentColor = Color(0xFF0F3E88)
                                ),
                                border = BorderStroke(1.5.dp, Color(0xFF0F3E88)),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.testTag("pick_device_photo_btn")
                            ) {
                                Icon(
                                    imageVector = Icons.Default.AddPhotoAlternate,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp),
                                    tint = Color(0xFF0F3E88)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Choose Photo",
                                    color = Color(0xFF0F3E88),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            items(imageList) { imgUri ->
                                Box(
                                    modifier = Modifier
                                        .size(90.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(SurfaceMuted)
                                        .border(1.dp, Color(0xFFCBD5E1), RoundedCornerShape(10.dp))
                                ) {
                                    AppProductImage(
                                        imagePath = imgUri,
                                        contentDescription = "Product image",
                                        modifier = Modifier.fillMaxSize()
                                    )
                                    if (imageList.size > 1) {
                                        IconButton(
                                            onClick = { imageList = imageList.filter { it != imgUri } },
                                            modifier = Modifier
                                                .align(Alignment.TopEnd)
                                                .size(24.dp)
                                                .background(Color.Black.copy(alpha = 0.6f), CircleShape)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Close,
                                                contentDescription = "Remove",
                                                tint = Color.White,
                                                modifier = Modifier.size(14.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Basic Info Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                        Text(
                            text = "Product Information",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = Color(0xFF0F172A)
                        )

                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it },
                            label = { Text("Product Name *", fontWeight = FontWeight.SemiBold) },
                            placeholder = { Text("e.g. Wireless Noise-Cancelling Headphones", color = Color(0xFF64748B)) },
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            colors = adminFieldColors,
                            textStyle = adminTextStyle,
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("product_name_input")
                        )

                        // Category Dropdown
                        Box(modifier = Modifier.fillMaxWidth()) {
                            OutlinedTextField(
                                value = category,
                                onValueChange = {},
                                readOnly = true,
                                label = { Text("Category *", fontWeight = FontWeight.SemiBold) },
                                trailingIcon = {
                                    IconButton(onClick = { showCategoryDropdown = true }) {
                                        Icon(
                                            imageVector = Icons.Default.ArrowDropDown,
                                            contentDescription = null,
                                            tint = Color(0xFF0F3E88)
                                        )
                                    }
                                },
                                shape = RoundedCornerShape(10.dp),
                                colors = adminFieldColors,
                                textStyle = adminTextStyle,
                                modifier = Modifier.fillMaxWidth()
                            )
                            // Transparent clickable overlay to open dropdown when tapping anywhere on the field
                            Box(
                                modifier = Modifier
                                    .matchParentSize()
                                    .clickable { showCategoryDropdown = true }
                            )

                            DropdownMenu(
                                expanded = showCategoryDropdown,
                                onDismissRequest = { showCategoryDropdown = false },
                                modifier = Modifier.background(Color.White)
                            ) {
                                categories.forEach { cat ->
                                    DropdownMenuItem(
                                        text = {
                                            Text(
                                                text = cat.name,
                                                color = Color(0xFF0F172A),
                                                fontWeight = FontWeight.Medium
                                            )
                                        },
                                        onClick = {
                                            category = cat.name
                                            showCategoryDropdown = false
                                        }
                                    )
                                }
                            }
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedTextField(
                                value = brand,
                                onValueChange = { brand = it },
                                label = { Text("Brand", fontWeight = FontWeight.SemiBold) },
                                placeholder = { Text("e.g. Sony", color = Color(0xFF64748B)) },
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp),
                                colors = adminFieldColors,
                                textStyle = adminTextStyle,
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = sku,
                                onValueChange = { sku = it },
                                label = { Text("SKU / Code", fontWeight = FontWeight.SemiBold) },
                                placeholder = { Text("e.g. WH-1000XM5", color = Color(0xFF64748B)) },
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp),
                                colors = adminFieldColors,
                                textStyle = adminTextStyle,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        OutlinedTextField(
                            value = description,
                            onValueChange = { description = it },
                            label = { Text("Product Description", fontWeight = FontWeight.SemiBold) },
                            placeholder = { Text("Detailed product highlights, warranty, features...", color = Color(0xFF64748B)) },
                            minLines = 3,
                            shape = RoundedCornerShape(10.dp),
                            colors = adminFieldColors,
                            textStyle = adminTextStyle,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }

            // Pricing & Stock
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                        Text(
                            text = "Pricing & Inventory",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = Color(0xFF0F172A)
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedTextField(
                                value = price,
                                onValueChange = { price = it.filter { ch -> ch.isDigit() || ch == '.' } },
                                label = { Text("Original Price *", fontWeight = FontWeight.SemiBold) },
                                placeholder = { Text("e.g. 5000", color = Color(0xFF64748B)) },
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp),
                                colors = adminFieldColors,
                                textStyle = adminTextStyle,
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("product_price_input")
                            )
                            OutlinedTextField(
                                value = discountPrice,
                                onValueChange = { discountPrice = it.filter { ch -> ch.isDigit() || ch == '.' } },
                                label = { Text("Discount Price", fontWeight = FontWeight.SemiBold) },
                                placeholder = { Text("e.g. 4200", color = Color(0xFF64748B)) },
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp),
                                colors = adminFieldColors,
                                textStyle = adminTextStyle,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedTextField(
                                value = stockQuantity,
                                onValueChange = { stockQuantity = it.filter { ch -> ch.isDigit() } },
                                label = { Text("Stock Quantity *", fontWeight = FontWeight.SemiBold) },
                                placeholder = { Text("e.g. 25", color = Color(0xFF64748B)) },
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp),
                                colors = adminFieldColors,
                                textStyle = adminTextStyle,
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("product_stock_input")
                            )
                            OutlinedTextField(
                                value = weight,
                                onValueChange = { weight = it },
                                label = { Text("Weight", fontWeight = FontWeight.SemiBold) },
                                placeholder = { Text("e.g. 500g", color = Color(0xFF64748B)) },
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp),
                                colors = adminFieldColors,
                                textStyle = adminTextStyle,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }

            // Variants & Specifications
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                        Text(
                            text = "Variants & Specifications",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = Color(0xFF0F172A)
                        )

                        OutlinedTextField(
                            value = variants,
                            onValueChange = { variants = it },
                            label = { Text("Variants (Comma-separated)", fontWeight = FontWeight.SemiBold) },
                            placeholder = { Text("e.g. Black, Silver, Midnight Blue", color = Color(0xFF64748B)) },
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            colors = adminFieldColors,
                            textStyle = adminTextStyle,
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = specifications,
                            onValueChange = { specifications = it },
                            label = { Text("Specifications (Key: Value per line)", fontWeight = FontWeight.SemiBold) },
                            placeholder = { Text("Battery: 30 hours\nBluetooth: 5.2\nWarranty: 1 Year", color = Color(0xFF64748B)) },
                            minLines = 3,
                            shape = RoundedCornerShape(10.dp),
                            colors = adminFieldColors,
                            textStyle = adminTextStyle,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }

            // Display Options & Toggles
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(
                            text = "Display Options",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = Color(0xFF0F172A)
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Featured Product", color = Color(0xFF0F172A), fontWeight = FontWeight.SemiBold)
                            Switch(
                                checked = isFeatured,
                                onCheckedChange = { isFeatured = it },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = Color(0xFF0F3E88),
                                    uncheckedThumbColor = Color.White,
                                    uncheckedTrackColor = Color(0xFFCBD5E1)
                                )
                            )
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Best Seller", color = Color(0xFF0F172A), fontWeight = FontWeight.SemiBold)
                            Switch(
                                checked = isBestSeller,
                                onCheckedChange = { isBestSeller = it },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = Color(0xFF0F3E88),
                                    uncheckedThumbColor = Color.White,
                                    uncheckedTrackColor = Color(0xFFCBD5E1)
                                )
                            )
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("New Arrival", color = Color(0xFF0F172A), fontWeight = FontWeight.SemiBold)
                            Switch(
                                checked = isNewArrival,
                                onCheckedChange = { isNewArrival = it },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = Color(0xFF0F3E88),
                                    uncheckedThumbColor = Color.White,
                                    uncheckedTrackColor = Color(0xFFCBD5E1)
                                )
                            )
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Visible in Store", color = Color(0xFF0F172A), fontWeight = FontWeight.SemiBold)
                            Switch(
                                checked = isVisible,
                                onCheckedChange = { isVisible = it },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = Color(0xFF0F3E88),
                                    uncheckedThumbColor = Color.White,
                                    uncheckedTrackColor = Color(0xFFCBD5E1)
                                )
                            )
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}
