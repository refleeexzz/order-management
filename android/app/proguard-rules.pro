# Add project specific ProGuard rules here.
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.novashop.data.model.** { *; }
-keep class retrofit2.** { *; }
-keepclassmembers class * { @retrofit2.http.* <methods>; }
-keep class com.google.gson.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**
-keepclassmembers class kotlinx.coroutines.** { *; }
