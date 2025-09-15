import 'dart:convert';
import 'package:movil_condominio/models/autorizacion_visita_model.dart';
import 'package:movil_condominio/models/persona_model.dart';
import 'package:movil_condominio/models/response__model.dart';
import 'package:movil_condominio/services/auth_service.dart';
import 'package:http/http.dart' as http;
import 'package:movil_condominio/config/config_db.dart';
import '../models/registro_visita_model.dart';

class ControlIngresoService {
  final String baseUrl = '${Config.baseUrl}/areacomun';
  final AuthService authService = AuthService();

  Future<List<AutorizacionVisitaModel>> mostrarSolicitudes() async {
    final token = await authService.getToken();

    if (token == null) throw Exception("Usuario no autenticado");

    final response = await http.get(
      Uri.parse('$baseUrl/mostrarVisitas'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    // print(response);
    // print(response.body);
    // Parsea a ResponseModel
    final ResponseModel resModel = ResponseModel.fromJson(
      jsonDecode(response.body),
    );

    if (resModel.status == 1 && resModel.values != null) {
      // Asume que values es una lista de comunicados
      final List<dynamic> lista = resModel.values as List<dynamic>;
      return lista
          .map((item) => AutorizacionVisitaModel.fromJson(item))
          .toList();
    } else {
      throw Exception(resModel.message ?? "Error al obtener las visitas");
    }
  }

  Future<RegistroVisitaModel> obtenerDetalleVisita(int idVisita) async {
    final token = await authService.getToken();

    if (token == null) throw Exception("Usuario no autenticado");

    final response = await http.get(
      Uri.parse('$baseUrl/detalleVisita/$idVisita'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    final ResponseModel resModel = ResponseModel.fromJson(
      jsonDecode(response.body),
    );
    if (resModel.status == 1 && resModel.values != null) {
      return RegistroVisitaModel.fromJson(resModel.values);
    } else {
      throw Exception(
        resModel.message ?? "No se encontró el detalle de la visita",
      );
    }
  }

  Future<ResponseModel> marcarEntrada(int autorizacion_id) async {
    final token = await authService.getToken();

    if (token == null) throw Exception("Usuario no autenticado");

    final response = await http.patch(
      Uri.parse('$baseUrl/marcarEntrada'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'autorizacion_id': autorizacion_id}),
    );

    final ResponseModel resModel = ResponseModel.fromJson(
      jsonDecode(response.body),
    );
    return ResponseModel(status: resModel.status, message: resModel.message);
  }

  Future<ResponseModel> marcarSalida(int autorizacion_id) async {
    final token = await authService.getToken();

    if (token == null) throw Exception("Usuario no autenticado");

    final response = await http.patch(
      Uri.parse('$baseUrl/marcarSalida'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'autorizacion_id': autorizacion_id}),
    );

    final ResponseModel resModel = ResponseModel.fromJson(
      jsonDecode(response.body),
    );
    return ResponseModel(status: resModel.status, message: resModel.message);
  }
}
