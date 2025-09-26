import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:movil_condominio/models/persona_model.dart';
import 'package:movil_condominio/config/config_db.dart';
import 'package:movil_condominio/services/auth_service.dart';

class PersonaService {
  final String baseUrl = '${Config.baseUrl}/usuario';
  final String baseUrlAreaComun = '${Config.baseUrl}/areacomun';
  final AuthService authService = AuthService();

  Future<List<Persona>> fetchPersonas() async {
    final token = await authService.getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/mostrarPersonas/'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    print(response);
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final personasJson = data['values'] as List;
      return personasJson.map((json) => Persona.fromJson(json)).toList();
    } else {
      throw Exception('Error al cargar personas');
    }
  }

  Future<bool> registrarVisita({
    required int personaId,
    required DateTime fechaInicio,
    required DateTime fechaFin,
    required String motivo,
  }) async {
    final token = await authService.getToken();
    final response = await http.post(
      Uri.parse('$baseUrlAreaComun/registrarVisita/$personaId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'hora_inicio': fechaInicio.toIso8601String(),
        'hora_fin': fechaFin.toIso8601String(),
        'motivo_visita': motivo,
      }),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return true;
    } else {
      return false;
    }
  }
}
