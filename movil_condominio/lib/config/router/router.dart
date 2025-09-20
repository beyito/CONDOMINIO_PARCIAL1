import 'package:movil_condominio/pages/home_page.dart';
import 'package:movil_condominio/views/login/login_page.dart';
import 'package:movil_condominio/views/usuario/perfil_view.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Verifica si hay token
Future<bool> isLoggedIn() async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');
  return token != null && token.isNotEmpty;
}

final appRouter = GoRouter(
  initialLocation: '/home/0',
  routes: [
    // 🔹 Ruta principal con bottom navigation
    GoRoute(
      path: '/home/:page',
      name: HomePage.name,
      builder: (context, state) {
        final pageIndex = int.parse(state.pathParameters['page'] ?? '0');
        return HomePage(pageIndex: pageIndex);
      },
      routes: [
        // Subruta dentro de Home
        GoRoute(
          path: 'perfil',
          name: PerfilView.name,
          builder: (context, state) => const PerfilView(),
        ),
      ],
    ),

    // 🔹 Login
    GoRoute(
      path: '/login',
      name: LoginPage.name,
      builder: (context, state) => const LoginPage(),
    ),

    // 🔹 Redirección raíz
    GoRoute(path: '/', redirect: (_, __) => '/home/0'),
  ],

  // 🔹 Redirección global según login y rol
  redirect: (context, state) async {
    final loggedIn = await isLoggedIn();
    final loggingIn = state.location == '/login';

    if (!loggedIn && !loggingIn) {
      return '/login';
    }

    if (loggedIn && loggingIn) {
      final prefs = await SharedPreferences.getInstance();
      final rol = prefs.getString('rol') ?? '';

      // 👇 Redirigimos al home/índice inicial según el rol
      if (rol == 'Guardia') return '/home/0'; // Control ingreso
      if (rol == 'Copropietario') return '/home/0'; // Inicio copropietario
      if (rol == 'Limpieza') return '/home/0';
      return '/home/0';
    }

    return null; // no redirige si todo está correcto
  },
);
