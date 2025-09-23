import 'dart:convert';
import 'package:movil_condominio/models/reserva_model.dart';
import 'package:movil_condominio/models/response__model.dart';
import 'package:movil_condominio/services/auth_service.dart';
import 'package:http/http.dart' as http;
import 'package:movil_condominio/config/config_db.dart';
import 'dart:io';
import 'package:http_parser/http_parser.dart'; // para MediaType

class ReservaCopropietarioService {
  final String baseUrl = '${Config.baseUrl}/areacomun';
  final AuthService authService = AuthService();

  Future<List<ReservaModel>> mostrarReservasCopropietario() async {
    final token = await authService.getToken();

    if (token == null) throw Exception("Usuario no autenticado");

    final response = await http.get(
      Uri.parse('$baseUrl/mostrarReservasCopropietario'),
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
      return lista.map((item) => ReservaModel.fromJson(item)).toList();
    } else {
      throw Exception(resModel.message ?? "Error al obtener reservas");
    }
  }

  Future<Map<String, dynamic>> adjuntarComprobante(
    int idReserva,
    File imagen,
  ) async {
    final token = await authService.getToken();
    if (token == null) throw Exception("Usuario no autenticado");

    var uri = Uri.parse('$baseUrl/adjuntarComprobante/$idReserva');

    var request = http.MultipartRequest('PATCH', uri);

    // Header de autorización
    request.headers['Authorization'] = 'Bearer $token';

    // Agregar el archivo
    request.files.add(
      http.MultipartFile(
        'imagen', // nombre del campo que espera tu backend
        imagen.readAsBytes().asStream(),
        imagen.lengthSync(),
        filename: imagen.path.split("/").last,
        contentType: MediaType('image', 'jpeg'), // o 'png' según tu imagen
      ),
    );

    // Enviar petición
    var streamedResponse = await request.send();

    // Obtener respuesta completa
    var response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200) {
      // Tu backend devuelve un JSON con status, error, message, url_comprobante
      return jsonDecode(response.body);
    } else {
      throw Exception("Error al subir comprobante: ${response.statusCode}");
    }
  }
}
