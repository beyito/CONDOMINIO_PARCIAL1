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
  final String baseUrlPago = '${Config.baseUrl}/pago';
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

  Future<Map<String, dynamic>> cancelarReserva(
    int id_reserva,
    String motivo_cancelacion,
  ) async {
    final token = await authService.getToken();
    if (token == null) throw Exception("Usuario no autenticado");

    final response = await http.patch(
      Uri.parse(
        '$baseUrl/cancelarReserva/$id_reserva',
      ), // 👈 ojo con la barra final
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({"motivo_cancelacion": motivo_cancelacion}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } else {
      throw Exception("Error al cancelar reserva: ${response.body}");
    }
  }

  Future<Map<String, dynamic>> adjuntarComprobanteReserva(
    int idReserva,
    File imagen,
  ) async {
    final token = await authService.getToken();
    if (token == null) throw Exception("Usuario no autenticado");

    var request = http.MultipartRequest(
      'PATCH',
      Uri.parse('$baseUrlPago/adjuntarComprobanteReserva/$idReserva/'),
    );

    request.headers['Authorization'] = 'Bearer $token';

    request.files.add(
      http.MultipartFile(
        'imagen', // este nombre debe coincidir con request.FILES.get('imagen') en Django
        imagen.readAsBytes().asStream(),
        imagen.lengthSync(),
        filename: imagen.path.split("/").last,
      ),
    );

    var response = await request.send();
    var responseData = await http.Response.fromStream(response);

    if (response.statusCode == 200) {
      return jsonDecode(responseData.body); // ✅ Devuelve Map<String, dynamic>
    } else {
      throw Exception("Error al subir comprobante: ${responseData.body}");
    }
  }
}
