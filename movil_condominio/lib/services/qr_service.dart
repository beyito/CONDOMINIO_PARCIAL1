import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:movil_condominio/config/config_db.dart';

class QrService {
  final String baseUrl =
      '${Config.baseUrl}/pago/qr/'; // 🔹 reemplaza con tu ruta real

  Future<String?> obtenerQrActivo() async {
    final response = await http.get(Uri.parse(baseUrl));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['status'] == 1 && data['values'] != null) {
        return data['values']['url_qr'];
      }
    }
    return null; // en caso de error o no encontrar QR
  }
}
