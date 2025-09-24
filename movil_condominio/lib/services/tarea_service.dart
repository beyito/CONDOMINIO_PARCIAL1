import 'package:movil_condominio/models/tarea_model.dart';
import 'dart:convert';
import 'package:movil_condominio/models/response__model.dart';
import 'package:movil_condominio/services/auth_service.dart';
import 'package:http/http.dart' as http;
import 'package:movil_condominio/config/config_db.dart';

class TareaService {
  final String baseUrl = '${Config.baseUrl}/tareas';
  final AuthService authService = AuthService();

  Future<List<TareaModel>> mostrarTareas() async {
    final token = await authService.getToken();

    if (token == null) throw Exception("Usuario no autenticado");

    final response = await http.get(
      Uri.parse('$baseUrl/mostrarTareasPersonal'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    // Parsea a ResponseModel
    final ResponseModel resModel = ResponseModel.fromJson(
      jsonDecode(response.body),
    );

    if (resModel.status == 1 && resModel.values != null) {
      // Asume que values es una lista de reservas
      final List<dynamic> lista = resModel.values as List<dynamic>;
      return lista.map((item) => TareaModel.fromJson(item)).toList();
    } else {
      throw Exception(resModel.message ?? "Error al obtener tareas");
    }
  }
}
