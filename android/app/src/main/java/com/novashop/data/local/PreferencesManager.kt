package com.novashop.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.novashop.data.model.CartItem
import com.novashop.data.model.User
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "novashop_prefs")

@Singleton
class PreferencesManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val gson = Gson()

    companion object {
        private val TOKEN_KEY = stringPreferencesKey("auth_token")
        private val USER_KEY = stringPreferencesKey("user_data")
        private val CART_KEY = stringPreferencesKey("cart_data")
    }

    // ── Auth ──

    val token: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[TOKEN_KEY]
    }

    val user: Flow<User?> = context.dataStore.data.map { prefs ->
        prefs[USER_KEY]?.let { json ->
            try { gson.fromJson(json, User::class.java) } catch (_: Exception) { null }
        }
    }

    suspend fun saveAuth(user: User) {
        context.dataStore.edit { prefs ->
            prefs[TOKEN_KEY] = user.token
            prefs[USER_KEY] = gson.toJson(user)
        }
    }

    suspend fun clearAuth() {
        context.dataStore.edit { prefs ->
            prefs.remove(TOKEN_KEY)
            prefs.remove(USER_KEY)
        }
    }

    // ── Cart ──

    val cartItems: Flow<List<CartItem>> = context.dataStore.data.map { prefs ->
        prefs[CART_KEY]?.let { json ->
            try {
                val type = object : TypeToken<List<CartItem>>() {}.type
                gson.fromJson<List<CartItem>>(json, type)
            } catch (_: Exception) { emptyList() }
        } ?: emptyList()
    }

    suspend fun saveCart(items: List<CartItem>) {
        context.dataStore.edit { prefs ->
            prefs[CART_KEY] = gson.toJson(items)
        }
    }

    suspend fun clearCart() {
        context.dataStore.edit { prefs ->
            prefs.remove(CART_KEY)
        }
    }
}
