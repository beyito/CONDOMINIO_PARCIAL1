import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:movil_condominio/shared/custom_appbar.dart';
import 'package:movil_condominio/shared/custom_bottom_navigation.dart';
import 'package:movil_condominio/views/usuario/noticias_view.dart';
import 'package:movil_condominio/views/area_comun/areacomun_view.dart';
import '../views/control_ingreso/control_ingreso_view.dart';
import '../views/pago/pago_view.dart';
import '../views/reserva/reservasCopropietario_view.dart';
import '../views/tarea/tarea_views.dart';
import 'package:movil_condominio/config/config_db.dart';
//import '../views/areas_comunes/areas_comunes_view.dart';

class HomePage extends StatefulWidget {
  static const name = 'home-screen';
  final int pageIndex;
  const HomePage({super.key, required this.pageIndex});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String _rol = '';
  List<Widget> _viewRoutes = [];

  @override
  void initState() {
    super.initState();
    _setupHomePage();
    _setupFirebaseMessaging();
  }

  Future<void> _setupHomePage() async {
    final prefs = await SharedPreferences.getInstance();
    final rol = prefs.getString('rol') ?? '';
    setState(() {
      _rol = rol;

      // Definir las vistas según el rol
      if (_rol == 'Guardia') {
        _viewRoutes = [NoticiasView(), ControlIngresoView(), TareaView()];
      } else if (_rol == 'Copropietario') {
        _viewRoutes = [
          NoticiasView(),
          ReservaCopropietarioView(),
          AreasComunesView(),
          PagoView(),
        ];
      } else if (_rol == 'Limpieza') {
        _viewRoutes = [NoticiasView(), TareaView()];
      }
    });
  }

  // -------------------------------
  // 🔹 Configurar Firebase Messaging
  // -------------------------------
  // Pedir permisos en iOS
  Future<void> _setupFirebaseMessaging() async {
    FirebaseMessaging messaging = FirebaseMessaging.instance;

    // Solicitar permisos (solo necesario para iOS, pero no hace daño)
    await messaging.requestPermission();

    // Obtener token FCM
    String? tokenMensaje = await messaging.getToken();
    print("Token FCM: $tokenMensaje");

    // Guardar o enviar al backend
    if (tokenMensaje != null) {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString("token") ?? "";

      await http.post(
        Uri.parse("${Config.baseUrl}/comunicacion/registrar-token/"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
        body: '{"token": "$tokenMensaje", "plataforma": "android"}',
      );
    }
    // Escuchar notificaciones en primer plano
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print(
        "📩 Notificación recibida en foreground: ${message.notification?.title}",
      );
      // Aquí puedes mostrar un SnackBar o AlertDialog
    });

    // Escuchar cuando el usuario abre la notificación
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print("👉 Notificación abierta por el usuario: ${message.data}");
      // Aquí puedes navegar a la pantalla específica según message.data
    });

    // Notificación que abrió la app desde cerrado
    FirebaseMessaging.instance.getInitialMessage().then((
      RemoteMessage? message,
    ) {
      if (message != null) {
        print("🔔 App abierta desde notificación: ${message.data}");
      }
    });
  }

  //nada
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppbar(),
      body: _viewRoutes.isNotEmpty
          ? IndexedStack(index: widget.pageIndex, children: _viewRoutes)
          : const Center(child: CircularProgressIndicator()),
      bottomNavigationBar: _rol.isNotEmpty
          ? CustomBottomNavigation(currentIndex: widget.pageIndex, rol: _rol)
          : null,
    );
  }
}
