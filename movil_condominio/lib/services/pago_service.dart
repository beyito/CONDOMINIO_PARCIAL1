import 'dart:convert';
import 'package:movil_condominio/models/pago_model.dart';
import 'package:movil_condominio/services/auth_service.dart';
import 'package:http/http.dart' as http;
import 'package:movil_condominio/config/config_db.dart';
import 'dart:io';

class PagoService {
  final String baseUrl = '${Config.baseUrl}/pago';
  final AuthService authService = AuthService();

  Future<List<PagoModel>> mostrarPagosCopropietario() async {
    final token = await authService.getToken();

    if (token == null) throw Exception("Usuario no autenticado");
    final response = await http.get(
      Uri.parse('$baseUrl/mostrarPagosCopropietario'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List pagosJson = data['values'];
      return pagosJson.map((json) => PagoModel.fromJson(json)).toList();
    } else {
      throw Exception("Error al cargar los pagos");
    }
  }

  Future<Map<String, dynamic>> adjuntarComprobante(
    int id_pago,
    File imagen,
  ) async {
    final token = await authService.getToken();
    if (token == null) throw Exception("Usuario no autenticado");

    var request = http.MultipartRequest(
      'PATCH',
      Uri.parse('$baseUrl/adjuntarComprobanteReserva/$id_pago/'),
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
