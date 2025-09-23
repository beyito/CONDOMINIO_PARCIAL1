import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:movil_condominio/config/config_db.dart';
import 'package:movil_condominio/services/auth_service.dart';

class ReservaService {
  final String baseUrl = '${Config.baseUrl}/areacomun';
  final AuthService authService = AuthService();

  Future<bool> crearReserva({
    required String area,
    required DateTime fecha,
    required String horaInicio,
    required String horaFin,
    required String nota,
  }) async {
    final token = await authService.getToken();

    final response = await http.post(
      Uri.parse('$baseUrl/reservas/'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        "area": area,
        "fecha":
            "${fecha.year}-${fecha.month.toString().padLeft(2, '0')}-${fecha.day.toString().padLeft(2, '0')}",
        "hora_inicio": horaInicio,
        "hora_fin": horaFin,
        "nota": nota,
      }),
    );

    print("STATUS: ${response.statusCode}");
    print("BODY: ${response.body}");

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data["status"] == 1) {
        return true;
      } else {
        throw Exception(data["message"] ?? "Error al crear la reserva");
      }
    } else {
      throw Exception("Error de servidor: ${response.statusCode}");
    }
  }
}
