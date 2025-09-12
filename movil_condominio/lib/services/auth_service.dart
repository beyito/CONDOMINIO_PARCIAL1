import 'dart:async';
import 'dart:convert';
import 'package:movil_condominio/models/login_response.dart';
import 'package:movil_condominio/models/usuario_model.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  final String baseUrl = "http://10.0.2.2:8000/users";

  // Login
  Future<LoginResponse> login(String username, String password) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/login'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'username': username, 'password': password}),
          )
          .timeout(const Duration(seconds: 3)); // <-- aquí el timeout

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        // Guardar token localmente
        final prefs = await SharedPreferences.getInstance();
        final token = data['token'];
        final usuario = UsuarioModel.fromJson(data['usuario']);
        final rol = usuario.idRol;

        await prefs.setString('token', token);
        await prefs.setString('rol', rol.toString());
        await prefs.setString('username', usuario.username ?? '');

        return LoginResponse.success(token: token, usuario: usuario);
      } else {
        final error = data['error'] ?? 'Error de login';
        return LoginResponse.failure(error);
      }
    } on TimeoutException {
      return LoginResponse.failure(
        "Tiempo de espera agotado. Intenta de nuevo.",
      );
    } catch (e) {
      return LoginResponse.failure("Error inesperado: $e");
    }
  }

  // Obtener token guardado
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // Logout
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }
}
