package com.novashop.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = Brand600,
    onPrimary = Color.White,
    primaryContainer = Brand100,
    onPrimaryContainer = Brand900,
    secondary = Brand400,
    onSecondary = Color.White,
    secondaryContainer = Brand50,
    onSecondaryContainer = Brand800,
    tertiary = Accent500,
    onTertiary = Color.White,
    background = Surface50,
    onBackground = Surface900,
    surface = Color.White,
    onSurface = Surface900,
    surfaceVariant = Surface100,
    onSurfaceVariant = Surface600,
    outline = Surface300,
    outlineVariant = Surface200,
    error = Error,
    onError = Color.White,
)

private val DarkColorScheme = darkColorScheme(
    primary = Brand400,
    onPrimary = Brand900,
    primaryContainer = Brand800,
    onPrimaryContainer = Brand100,
    secondary = Brand300,
    onSecondary = Brand900,
    secondaryContainer = Brand700,
    onSecondaryContainer = Brand100,
    tertiary = Accent400,
    onTertiary = Surface900,
    background = Surface900,
    onBackground = Surface50,
    surface = Surface800,
    onSurface = Surface50,
    surfaceVariant = Surface700,
    onSurfaceVariant = Surface300,
    outline = Surface500,
    outlineVariant = Surface600,
    error = Color(0xFFF87171),
    onError = Surface900,
)

@Composable
fun NovaShopTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            if (darkTheme) DarkColorScheme else LightColorScheme
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
