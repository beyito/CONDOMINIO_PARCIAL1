import 'package:movil_condominio/models/usuario_model.dart';

class LoginResponse {
  final int? status;
  final String? message;
  final String? token;
  final UsuarioModel? usuario;
  final dynamic error; // Puede ser String, Map, List, etc.

  LoginResponse({
    this.status,
    this.message,
    this.token,
    this.usuario,
    this.error,
  });

  factory LoginResponse.success({
    required String token,
    required UsuarioModel usuario,
    String? message,
  }) {
    return LoginResponse(
      status: 1,
      message: message ?? "Se guardó los datos del usuario",
      token: token,
      usuario: usuario,
      error: null,
    );
  }

  factory LoginResponse.failure(dynamic error) {
    return LoginResponse(
      status: 0,
      message: null,
      token: null,
      usuario: null,
      error: error,
    );
  }
}
