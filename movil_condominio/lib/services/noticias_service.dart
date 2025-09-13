import 'dart:convert';
import 'package:movil_condominio/models/noticia_model.dart';
import 'package:movil_condominio/models/response__model.dart';
import 'package:movil_condominio/models/usuario_model.dart';
import 'package:movil_condominio/services/auth_service.dart';
import 'package:http/http.dart' as http;

class NoticiasService {
  final String baseUrl = "http://10.0.2.2:8000/comunicacion";
  final AuthService authService = AuthService();

  Future<List<NoticiaModel>> mostrarComunicados() async {
    final token = await authService.getToken();

    if (token == null) throw Exception("Usuario no autenticado");

    final response = await http.get(
      Uri.parse('$baseUrl/mostrarComunicados'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    print(response);
    print(response.body);
    // Parsea a ResponseModel
    final ResponseModel resModel = ResponseModel.fromJson(
      jsonDecode(response.body),
    );

    if (resModel.status == 1 && resModel.values != null) {
      // Asume que values es una lista de comunicados
      final List<dynamic> lista = resModel.values as List<dynamic>;
      return lista.map((item) => NoticiaModel.fromJson(item)).toList();
    } else {
      throw Exception(resModel.message ?? "Error al obtener comunicados");
    }
  }

  // Future<List<NoticiaModel>> mostrarComunicadosx() async {
  //   // Simula un delay de red
  //   await Future.delayed(const Duration(milliseconds: 800));

  //   return [
  //     NoticiaModel(
  //       id: 1,
  //       titulo: 'Nueva Piscina Inaugurada',
  //       descripcion:
  //           'El condominio ahora cuenta con una piscina semi-olímpica lista para el uso de todos los vecinos.',
  //       imagenUrl:
  //           'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  //       administrador: UsuarioModel(
  //         id: 101,
  //         username: 'admin',
  //         nombre: 'Juan Pérez',
  //         email: 'admin@condominio.com',
  //         idRol: 1,
  //         nombreRol: 'Administrador',
  //       ),
  //       creadoEn: '2025-09-07',
  //       expiraEn: '2025-09-30',
  //     ),
  //     NoticiaModel(
  //       id: 2,
  //       titulo: 'Reunión de Vecinos',
  //       descripcion:
  //           'Se invita a todos los residentes a la asamblea general este sábado en el salón comunal.',
  //       imagenUrl:
  //           'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  //       administrador: UsuarioModel(
  //         id: 102,
  //         username: 'comitevec',
  //         nombre: 'Comité Vecinal',
  //         email: 'comite@condominio.com',
  //         idRol: 2,
  //         nombreRol: 'Comité',
  //       ),
  //       creadoEn: '2025-09-09',
  //       expiraEn: '2025-09-11',
  //     ),
  //     NoticiaModel(
  //       id: 3,
  //       titulo: 'Aviso de Corte de Agua',
  //       descripcion:
  //           'El lunes 11 no habrá agua potable desde las 8am hasta las 2pm por trabajos de mantenimiento.',
  //       imagenUrl:
  //           'https://images.unsplash.com/photo-1444065381814-865dc9da92c0?auto=format&fit=crop&w=600&q=80',
  //       administrador: UsuarioModel(
  //         id: 103,
  //         username: 'servicios',
  //         nombre: 'Servicios Comunes',
  //         email: 'servicios@condominio.com',
  //         idRol: 3,
  //         nombreRol: 'Servicios',
  //       ),
  //       creadoEn: '2025-09-11',
  //       expiraEn: '2025-09-11',
  //     ),
  //   ];
  // }
}
