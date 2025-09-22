import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:movil_condominio/config/config_db.dart';
import 'package:movil_condominio/services/auth_service.dart';

class CalendarioService {
  final String baseUrl = '${Config.baseUrl}/areacomun';
  final AuthService authService = AuthService();
  Future<List<Map<String, dynamic>>> obtenerDisponibilidad({
    required String area,
    required DateTime fecha,
  }) async {
    final token = await authService.getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/mostrarCalendarioAreasComunes'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'fecha':
            "${fecha.year.toString().padLeft(4, '0')}-"
            "${fecha.month.toString().padLeft(2, '0')}-"
            "${fecha.day.toString().padLeft(2, '0')}",
      }),
    );
    final data = jsonDecode(response.body);

    if (data['status'] != 1) {
      throw Exception(data['message'] ?? 'Error al obtener calendario');
    }

    final disponibles = data['values']['disponibles'] as List<dynamic>;
    // print(disponibles);
    final areaData = disponibles.firstWhere(
      (a) => a['area_comun'] == area,
      orElse: () => null,
    );

    if (areaData == null) return [];
    return List<Map<String, dynamic>>.from(areaData['horarios']);
  }
}
