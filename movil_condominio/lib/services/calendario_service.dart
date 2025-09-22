import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:movil_condominio/config/config_db.dart';

class CalendarioService {
  final String baseUrl = '${Config.baseUrl}/mostrarCalendarioAreasComunes';

  Future<List<Map<String, dynamic>>> obtenerDisponibilidad({
    required String area,
    required DateTime fecha,
  }) async {
    // Formatear la fecha como YYYY-MM-DD
    final fechaStr =
        "${fecha.year.toString().padLeft(4, '0')}-"
        "${fecha.month.toString().padLeft(2, '0')}-"
        "${fecha.day.toString().padLeft(2, '0')}";

    final uri = Uri.parse(
      baseUrl,
    ).replace(queryParameters: {'fecha': fechaStr});

    final response = await http.get(
      uri,
      headers: {'Content-Type': 'application/json'},
    );

    final data = jsonDecode(response.body);
    if (data['status'] != 1) {
      throw Exception(data['message'] ?? 'Error al obtener calendario');
    }

    final disponibles = data['values']['disponibles'] as List<dynamic>;
    final areaData = disponibles.firstWhere(
      (a) => a['area_comun'] == area,
      orElse: () => null,
    );

    if (areaData == null) return [];
    return List<Map<String, dynamic>>.from(areaData['horarios']);
  }
}
