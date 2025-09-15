import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import '../models/usuario_model.dart';
import 'package:movil_condominio/config/config_db.dart';

class UsuarioService {
  final String baseUrl = '${Config.baseUrl}/usuario';
  final AuthService authService = AuthService();

  // Mostrar usuarios
  Future<List<UsuarioModel>> mostrarUsuarios() async {
    final token = await authService.getToken();

    if (token == null) throw Exception("Usuario no autenticado");

    final response = await http.get(
      Uri.parse('$baseUrl/mostrarUsuarios'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => UsuarioModel.fromJson(json)).toList();
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Error al cargar usuarios');
    }
  }
}
