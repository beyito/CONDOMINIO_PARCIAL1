import 'dart:convert';
import 'package:http/http.dart' as http;

class Vehiculo {
  final String placa;
  final String marca;
  final String modelo;
  final String color;
  final String estado;
  final String tipo;

  Vehiculo({
    required this.placa,
    required this.marca,
    required this.modelo,
    required this.color,
    required this.estado,
    required this.tipo,
  });

  factory Vehiculo.fromJson(Map<String, dynamic> json) {
    return Vehiculo(
      placa: json['placa'],
      marca: json['marca'],
      modelo: json['modelo'],
      color: json['color'] ?? '',
      estado: json['estado'],
      tipo: json['tipo'],
    );
  }
}

class Mascota {
  final String nombre;
  final String tipo;
  final String raza;
  final String? color;
  final double? peso;

  Mascota({
    required this.nombre,
    required this.tipo,
    required this.raza,
    this.color,
    this.peso,
  });

  factory Mascota.fromJson(Map<String, dynamic> json) {
    return Mascota(
      nombre: json['nombre'],
      tipo: json['tipo'],
      raza: json['raza'] ?? '',
      color: json['color'],
      peso: json['peso'] != null ? (json['peso'] as num).toDouble() : null,
    );
  }
}
