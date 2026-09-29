package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.localization.AppLanguage
import com.example.localization.LocalizationRepository
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("Pukalavan Store", appName)
  }

  @Test
  fun `verify multi-language translations`() {
    val en = LocalizationRepository.getStrings(AppLanguage.ENGLISH)
    val ta = LocalizationRepository.getStrings(AppLanguage.TAMIL)
    val si = LocalizationRepository.getStrings(AppLanguage.SINHALA)

    assertNotNull(en.appName)
    assertNotNull(ta.appName)
    assertNotNull(si.appName)

    assertEquals("Pukalavan Store", en.appName)
    assertEquals("புகழவன் அங்காடி", ta.appName)
    assertEquals("පුකලවන් ස්ටෝර්", si.appName)
  }
}
