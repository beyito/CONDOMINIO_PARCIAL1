import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:movil_condominio/config/router/router.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

// Manejo de notificaciones en segundo plano
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print("🔔 Notificación en segundo plano: ${message.messageId}");
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // Configurar handler para notificaciones en background
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Inmobiliaria',
      debugShowCheckedModeBanner: false,
      routerConfig: appRouter,
    );
  }
}
