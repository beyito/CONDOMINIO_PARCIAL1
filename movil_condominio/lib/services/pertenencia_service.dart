import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:movil_condominio/models/pertenencia_model.dart';
import 'package:movil_condominio/config/config_db.dart';
import 'package:movil_condominio/services/auth_service.dart';

class PertenenciaService {
  final String baseUrl = '${Config.baseUrl}/unidadpertenencia';
  final AuthService authService = AuthService();

  Future<Map<String, dynamic>> fetchPertenencias() async {
    final token = await authService.getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/listarPertenencias'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final vehiculos = (data['values']['vehiculos'] as List)
          .map((v) => Vehiculo.fromJson(v))
          .toList();
      final mascotas = (data['values']['mascotas'] as List)
          .map((m) => Mascota.fromJson(m))
          .toList();
      return {"vehiculos": vehiculos, "mascotas": mascotas};
    } else {
      throw Exception("Error al cargar pertenencias");
    }
  }
}
